const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();
const computeService = require('../services/compute');
const encryption = require('../lib/encryption');

/**
 * Submit AI analysis job with database tracking
 */
router.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  let jobId = null;

  try {
    const { fileData, analysisType = 'medical-analysis', userId, fileId } = req.body;

    // Get database instance from app
    const db = req.app.get('db');

    // Validate required fields
    if (!fileData || !userId) {
      return res.status(400).json({ error: 'Missing required fields: fileData, userId' });
    }

    // Validate userId format
    if (typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Validate fileId if provided
    if (fileId && (typeof fileId !== 'string' || fileId.length > 100)) {
      return res.status(400).json({ error: 'Invalid fileId format' });
    }

    // Validate analysisType
    const validAnalysisTypes = ['medical-analysis', 'enhanced-analysis'];
    if (analysisType && !validAnalysisTypes.includes(analysisType)) {
      return res.status(400).json({ error: 'Invalid analysisType. Must be medical-analysis or enhanced-analysis' });
    }

    // Validate fileData is an object
    if (typeof fileData !== 'object' || fileData === null) {
      return res.status(400).json({ error: 'Invalid fileData format. Must be an object' });
    }

    // Limit the size of fileData to prevent abuse
    const fileDataStr = JSON.stringify(fileData);
    if (fileDataStr.length > 1000000) { // 1MB limit
      return res.status(400).json({ error: 'fileData too large. Maximum 1MB allowed' });
    }

    // Create job record in database
    jobId = require('crypto').randomUUID();

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO compute_jobs (id, user_id, file_id, job_type, status, parameters, created_at)
         VALUES (?, ?, ?, ?, 'running', ?, datetime('now'))`,
        [jobId, userId, fileId, analysisType, fileDataStr],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Submit to compute service
    const result = await computeService.submitAnalysis(fileData, analysisType);
    const computeTime = Date.now() - startTime;

    // Update job record with results
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE compute_jobs 
         SET status = 'completed', result = ?, compute_time_ms = ?, 
             completed_at = datetime('now'), zero_g_job_id = ?, 
             provider_address = ?, is_valid = ?
         WHERE id = ?`,
        [
          JSON.stringify(result),
          computeTime,
          result.jobId,
          result.provider,
          result.isValid ? 1 : 0,
          jobId
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update daily usage stats
    await updateUsageStats(userId, true, computeTime);

    res.json({
      success: true,
      jobId,
      analysis: result.analysis,
      isValid: result.isValid,
      provider: result.provider,
      timestamp: result.timestamp,
      computeTime
    });

  } catch (error) {
    console.error('Analysis request failed:', error);

    // Update job record with error
    if (jobId) {
      const computeTime = Date.now() - startTime;
      await new Promise((resolve) => {
        db.run(
          `UPDATE compute_jobs 
           SET status = 'failed', error_message = ?, compute_time_ms = ?, 
               completed_at = datetime('now')
           WHERE id = ?`,
          [error.message, computeTime, jobId],
          () => resolve()
        );
      });

      await updateUsageStats(req.body.userId, false, computeTime);
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: 'Internal server error occurred during analysis',
      fallback: true
    });
  }
});

/**
 * Get compute job status
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get database instance from app
    const db = req.app.get('db');
    const job = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM compute_jobs WHERE id = ?`,
        [jobId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      id: job.id,
      status: job.status,
      jobType: job.job_type,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.error_message,
      computeTime: job.compute_time_ms,
      createdAt: job.created_at,
      completedAt: job.completed_at
    });
  } catch (error) {
    console.error('Failed to get job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

/**
 * Get user's compute jobs
 */
router.get('/jobs/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-1000)' });
    }

    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }

    const { data: jobs, error } = await supabase
      .from('compute_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const formattedJobs = await Promise.all(jobs.map(async job => {
      let decryptedResult = null;
      if (job.result) {
        try {
          decryptedResult = JSON.parse(encryption.decrypt(job.result));
        } catch (decryptError) {
          console.error('Failed to decrypt job result:', decryptError);
          // Keep the encrypted result as fallback
          decryptedResult = job.result;
        }
      }

      return {
        id: job.id,
        status: job.status,
        jobType: job.job_type,
        result: decryptedResult,
        error: job.error_message,
        computeTime: job.compute_time_ms,
        createdAt: job.created_at,
        completedAt: job.completed_at
      };
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    console.error('Failed to get user jobs:', error);
    res.status(500).json({ error: 'Failed to get user jobs' });
  }
});

/**
 * Get compute usage statistics
 */
router.get('/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const daysInt = parseInt(days);

    if (isNaN(daysInt) || daysInt <= 0) {
      return res.status(400).json({ error: 'Invalid days parameter' });
    }

    // Calculate the date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysInt);
    const dateStr = dateThreshold.toISOString().split('T')[0];

    const { data: usage, error: usageError } = await supabase
      .from('compute_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('date', dateStr)
      .order('date', { ascending: false });

    if (usageError) {
      console.error('Supabase usage error:', usageError);
      throw usageError;
    }

    // Get summary stats
    const { data: summary, error: summaryError } = await supabase
      .from('compute_usage')
      .select(`
        sum(total_jobs)::int as totalJobs,
        sum(successful_jobs)::int as successfulJobs,
        sum(total_compute_time_ms)::int as totalComputeTime,
        sum(total_cost_eth) as totalCost
      `)
      .eq('user_id', userId)
      .gte('date', dateStr)
      .single();

    if (summaryError) {
      console.error('Supabase summary error:', summaryError);
      throw summaryError;
    }

    // Format the summary to match the original API response
    const formattedSummary = {
      totalJobs: summary.totaljobs ? parseInt(summary.totaljobs) : 0,
      successfulJobs: summary.successfuljobs ? parseInt(summary.successfuljobs) : 0,
      totalComputeTime: summary.totalcomputetime ? parseInt(summary.totalcomputetime) : 0,
      totalCost: summary.totalcost ? parseFloat(summary.totalcost) : 0
    };

    res.json({ usage, summary: formattedSummary });
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

/**
 * Get compute account balance
 */
router.get('/balance', async (req, res) => {
  try {
    const balance = await computeService.getBalance();
    res.json(balance);
  } catch (error) {
    console.error('Balance check failed:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

/**
 * List available compute services
 */
router.get('/services', async (req, res) => {
  try {
    const services = await computeService.listServices();
    res.json({ services });
  } catch (error) {
    console.error('Service listing failed:', error);
    res.status(500).json({ error: 'Failed to list services' });
  }
});

/**
 * Health check for compute service
 */
router.get('/health', async (req, res) => {
  try {
    const health = await computeService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Update daily usage statistics
 */
async function updateUsageStats(userId, success, computeTime) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if a record already exists for today
    const { data: existing, error: selectError } = await supabase
      .from('compute_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error fetching usage stats:', selectError);
      throw selectError;
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('compute_usage')
        .update({
          total_jobs: existing.total_jobs + 1,
          successful_jobs: existing.successful_jobs + (success ? 1 : 0),
          total_compute_time_ms: existing.total_compute_time_ms + computeTime,
          total_cost_eth: existing.total_cost_eth || 0 // Assuming cost tracking might be added later
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating usage stats:', updateError);
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('compute_usage')
        .insert({
          user_id: userId,
          date: today,
          total_jobs: 1,
          successful_jobs: success ? 1 : 0,
          total_compute_time_ms: computeTime,
          total_cost_eth: 0 // Default to 0 for new records
        });

      if (insertError) {
        console.error('Error inserting usage stats:', insertError);
        throw insertError;
      }
    }


    /**
     * Test compute analysis without funding (simulation)
     */
    router.post('/test-analyze', async (req, res) => {
      try {
        const { fileData, analysisType = 'medical-analysis', userId } = req.body;

        // Validate required fields
        if (!fileData || !userId) {
          return res.status(400).json({ error: 'Missing required fields: fileData, userId' });
        }

        // Validate userId format
        if (typeof userId !== 'string' || userId.length > 100) {
          return res.status(400).json({ error: 'Invalid userId format' });
        }

        // Validate analysisType
        const validAnalysisTypes = ['medical-analysis', 'enhanced-analysis'];
        if (analysisType && !validAnalysisTypes.includes(analysisType)) {
          return res.status(400).json({ error: 'Invalid analysisType. Must be medical-analysis or enhanced-analysis' });
        }

        // Validate fileData is an object
        if (typeof fileData !== 'object' || fileData === null) {
          return res.status(400).json({ error: 'Invalid fileData format. Must be an object' });
        }

        // Limit the size of fileData to prevent abuse
        const fileDataStr = JSON.stringify(fileData);
        if (fileDataStr.length > 1000000) { // 1MB limit
          return res.status(400).json({ error: 'fileData too large. Maximum 1MB allowed' });
        }

        // Simulate compute analysis result
        const mockResult = {
          jobId: `test-${Date.now()}`,
          analysis: `AI Analysis of ${fileData.name || 'medical data'}: Based on the provided information including age ${fileData.age}, medications ${JSON.stringify(fileData.medications)}, this appears to be a routine medical profile. Recommendations: Continue current medication regimen, schedule regular follow-ups.`,
          isValid: true,
          provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
          timestamp: new Date().toISOString(),
          computeTime: 1500
        };

        // Encrypt sensitive data before storage
        const encryptedParams = encryption.encrypt(fileDataStr);
        const encryptedResult = encryption.encrypt(JSON.stringify(mockResult));

        // Store in database
        const jobId = require('crypto').randomUUID();
        const { error } = await supabase
          .from('compute_jobs')
          .insert({
            id: jobId,
            user_id: userId,
            job_type: analysisType,
            status: 'completed',
            parameters: encryptedParams,
            result: encryptedResult,
            compute_time_ms: 1500,
            completed_at: new Date().toISOString(),
            zero_g_job_id: mockResult.jobId,
            provider_address: mockResult.provider,
            is_valid: true
          });

        if (error) throw error;

        res.json({
          success: true,
          jobId,
          analysis: mockResult.analysis,
          isValid: mockResult.isValid,
          provider: mockResult.provider,
          timestamp: mockResult.timestamp,
          computeTime: 1500,
          note: 'Simulated analysis - requires wallet funding for real 0G Compute'
        });

      } catch (error) {
        console.error('Test analysis failed:', error);
        res.status(500).json({
          error: 'Test analysis failed',
          message: 'Internal server error occurred during test analysis'
        });
      }
    });

    /**
     * Provider funding endpoint - only for healthcare providers
     */
    router.post('/provider-fund', async (req, res) => {
      try {
        const { amount = 0.01, providerId } = req.body;

        // Validate required fields
        if (!providerId) {
          return res.status(400).json({ error: 'Provider ID required' });
        }

        // Validate providerId format
        if (typeof providerId !== 'string' || providerId.length > 100) {
          return res.status(400).json({ error: 'Invalid providerId format' });
        }

        // Validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000) { // Set a reasonable max
          return res.status(400).json({ error: 'Invalid amount. Must be a positive number less than 1000' });
        }

        console.log(`Provider ${providerId} requesting funding of ${parsedAmount} OG`);

        await computeService.initialize();

        // Add funds to ledger for provider use
        await computeService.broker.ledger.addLedger(parsedAmount);
        const balance = await computeService.getBalance();

        res.json({
          success: true,
          message: `Added ${parsedAmount} OG tokens for provider`,
          balance: balance.total,
          providerId
        });

      } catch (error) {
        console.error('Provider funding failed:', error);
        res.status(500).json({
          error: 'Provider funding failed',
          message: 'Internal server error occurred during funding'
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update statistics' });
  }
}

module.exports = router;
