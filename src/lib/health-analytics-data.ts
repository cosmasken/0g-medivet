export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  category: 'vitals' | 'labs' | 'biometrics' | 'lifestyle';
}

export interface HealthTrend {
  date: string;
  value: number;
  metric: string;
}

export interface AIRecommendation {
  id: string;
  type: 'lifestyle' | 'medical' | 'preventive' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
  timeframe: string;
  category: string;
  confidence: number; // 0-100
  basedOn: string[];
}

export interface RiskAssessment {
  id: string;
  condition: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  riskScore: number; // 0-100
  factors: {
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
  }[];
  recommendations: string[];
  nextScreening?: string;
  lastAssessed: string;
}

export interface HealthInsight {
  id: string;
  type: 'achievement' | 'concern' | 'trend' | 'milestone';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  relatedMetrics: string[];
  generatedAt: string;
}

// Generate realistic health trends over the past year
const generateHealthTrends = (metric: string, baseValue: number, variance: number, trend: 'improving' | 'stable' | 'declining'): HealthTrend[] => {
  const trends: HealthTrend[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    let value = baseValue;
    
    // Apply trend
    if (trend === 'improving') {
      value = baseValue + (i * variance * 0.1) - (Math.random() * variance * 0.5);
    } else if (trend === 'declining') {
      value = baseValue - (i * variance * 0.1) + (Math.random() * variance * 0.5);
    } else {
      value = baseValue + (Math.random() - 0.5) * variance;
    }
    
    trends.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      metric
    });
  }
  
  return trends;
};

export const mockHealthMetrics: HealthMetric[] = [
  {
    id: 'bp-systolic',
    name: 'Systolic Blood Pressure',
    value: 128,
    unit: 'mmHg',
    normalRange: { min: 90, max: 120 },
    status: 'borderline',
    trend: 'improving',
    lastUpdated: '2024-08-20T10:30:00Z',
    category: 'vitals'
  },
  {
    id: 'bp-diastolic',
    name: 'Diastolic Blood Pressure',
    value: 82,
    unit: 'mmHg',
    normalRange: { min: 60, max: 80 },
    status: 'borderline',
    trend: 'stable',
    lastUpdated: '2024-08-20T10:30:00Z',
    category: 'vitals'
  },
  {
    id: 'heart-rate',
    name: 'Resting Heart Rate',
    value: 68,
    unit: 'bpm',
    normalRange: { min: 60, max: 100 },
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2024-08-22T08:15:00Z',
    category: 'vitals'
  },
  {
    id: 'cholesterol-total',
    name: 'Total Cholesterol',
    value: 195,
    unit: 'mg/dL',
    normalRange: { min: 0, max: 200 },
    status: 'normal',
    trend: 'improving',
    lastUpdated: '2024-08-15T14:20:00Z',
    category: 'labs'
  },
  {
    id: 'cholesterol-ldl',
    name: 'LDL Cholesterol',
    value: 118,
    unit: 'mg/dL',
    normalRange: { min: 0, max: 100 },
    status: 'borderline',
    trend: 'improving',
    lastUpdated: '2024-08-15T14:20:00Z',
    category: 'labs'
  },
  {
    id: 'cholesterol-hdl',
    name: 'HDL Cholesterol',
    value: 58,
    unit: 'mg/dL',
    normalRange: { min: 40, max: 200 },
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2024-08-15T14:20:00Z',
    category: 'labs'
  },
  {
    id: 'glucose',
    name: 'Fasting Glucose',
    value: 92,
    unit: 'mg/dL',
    normalRange: { min: 70, max: 100 },
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2024-08-18T09:00:00Z',
    category: 'labs'
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    value: 5.4,
    unit: '%',
    normalRange: { min: 4.0, max: 5.6 },
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2024-08-15T14:20:00Z',
    category: 'labs'
  },
  {
    id: 'bmi',
    name: 'Body Mass Index',
    value: 24.8,
    unit: 'kg/m²',
    normalRange: { min: 18.5, max: 24.9 },
    status: 'normal',
    trend: 'improving',
    lastUpdated: '2024-08-22T07:30:00Z',
    category: 'biometrics'
  },
  {
    id: 'weight',
    name: 'Weight',
    value: 165,
    unit: 'lbs',
    normalRange: { min: 140, max: 180 },
    status: 'normal',
    trend: 'improving',
    lastUpdated: '2024-08-22T07:30:00Z',
    category: 'biometrics'
  }
];

export const mockHealthTrends: HealthTrend[] = [
  ...generateHealthTrends('bp-systolic', 128, 15, 'improving'),
  ...generateHealthTrends('bp-diastolic', 82, 10, 'stable'),
  ...generateHealthTrends('heart-rate', 68, 8, 'stable'),
  ...generateHealthTrends('cholesterol-total', 195, 25, 'improving'),
  ...generateHealthTrends('cholesterol-ldl', 118, 20, 'improving'),
  ...generateHealthTrends('glucose', 92, 12, 'stable'),
  ...generateHealthTrends('bmi', 24.8, 2, 'improving'),
  ...generateHealthTrends('weight', 165, 8, 'improving')
];

export const mockAIRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    type: 'lifestyle',
    priority: 'medium',
    title: 'Optimize Blood Pressure Through Diet',
    description: 'Your blood pressure readings show a borderline elevation. Dietary modifications could help bring it into the normal range.',
    actionItems: [
      'Reduce sodium intake to less than 2,300mg per day',
      'Increase potassium-rich foods (bananas, spinach, avocados)',
      'Follow the DASH diet pattern',
      'Limit processed foods and restaurant meals'
    ],
    expectedImpact: 'Could reduce systolic BP by 5-10 mmHg within 2-3 months',
    timeframe: '2-3 months',
    category: 'Cardiovascular Health',
    confidence: 85,
    basedOn: ['Blood pressure trends', 'Current medication status', 'BMI']
  },
  {
    id: 'rec-2',
    type: 'preventive',
    priority: 'high',
    title: 'Schedule Cardiovascular Screening',
    description: 'Based on your age, family history, and current risk factors, you should consider advanced cardiovascular screening.',
    actionItems: [
      'Schedule coronary calcium scoring CT scan',
      'Discuss statin therapy with your cardiologist',
      'Consider stress testing if experiencing symptoms',
      'Update family history information'
    ],
    expectedImpact: 'Early detection of cardiovascular disease risk',
    timeframe: '1-2 months',
    category: 'Preventive Care',
    confidence: 78,
    basedOn: ['Age', 'Cholesterol levels', 'Blood pressure', 'Family history']
  },
  {
    id: 'rec-3',
    type: 'lifestyle',
    priority: 'low',
    title: 'Maintain Current Weight Management',
    description: 'Your BMI is in the healthy range and trending positively. Continue current lifestyle habits.',
    actionItems: [
      'Maintain current exercise routine',
      'Continue balanced nutrition approach',
      'Monitor weight weekly',
      'Stay hydrated with 8+ glasses of water daily'
    ],
    expectedImpact: 'Sustained healthy weight and improved metabolic health',
    timeframe: 'Ongoing',
    category: 'Weight Management',
    confidence: 92,
    basedOn: ['BMI trends', 'Weight trends', 'Activity levels']
  },
  {
    id: 'rec-4',
    type: 'medical',
    priority: 'medium',
    title: 'Optimize LDL Cholesterol',
    description: 'Your LDL cholesterol is slightly above optimal. Consider discussing treatment options with your provider.',
    actionItems: [
      'Increase soluble fiber intake (oats, beans, apples)',
      'Add plant sterols/stanols to diet',
      'Consider omega-3 fatty acid supplements',
      'Discuss statin therapy if lifestyle changes insufficient'
    ],
    expectedImpact: 'Reduce LDL by 10-15% within 3-6 months',
    timeframe: '3-6 months',
    category: 'Cholesterol Management',
    confidence: 81,
    basedOn: ['LDL trends', 'Total cholesterol', 'Cardiovascular risk factors']
  }
];

export const mockRiskAssessments: RiskAssessment[] = [
  {
    id: 'risk-cvd',
    condition: 'Cardiovascular Disease',
    riskLevel: 'moderate',
    riskScore: 35,
    factors: [
      { factor: 'Age (35-44)', impact: 'negative', weight: 15 },
      { factor: 'Borderline Blood Pressure', impact: 'negative', weight: 20 },
      { factor: 'Elevated LDL Cholesterol', impact: 'negative', weight: 18 },
      { factor: 'Normal BMI', impact: 'positive', weight: -10 },
      { factor: 'Non-smoker', impact: 'positive', weight: -15 },
      { factor: 'Regular Exercise', impact: 'positive', weight: -12 }
    ],
    recommendations: [
      'Monitor blood pressure monthly',
      'Follow up on cholesterol management',
      'Maintain current exercise routine',
      'Consider stress management techniques'
    ],
    nextScreening: '2024-12-01',
    lastAssessed: '2024-08-20T00:00:00Z'
  },
  {
    id: 'risk-diabetes',
    condition: 'Type 2 Diabetes',
    riskLevel: 'low',
    riskScore: 18,
    factors: [
      { factor: 'Normal Fasting Glucose', impact: 'positive', weight: -20 },
      { factor: 'Normal HbA1c', impact: 'positive', weight: -18 },
      { factor: 'Healthy BMI', impact: 'positive', weight: -15 },
      { factor: 'Family History', impact: 'negative', weight: 25 },
      { factor: 'Active Lifestyle', impact: 'positive', weight: -12 }
    ],
    recommendations: [
      'Continue healthy diet and exercise',
      'Annual glucose screening',
      'Maintain healthy weight',
      'Monitor for symptoms'
    ],
    nextScreening: '2025-08-15',
    lastAssessed: '2024-08-15T00:00:00Z'
  },
  {
    id: 'risk-osteoporosis',
    condition: 'Osteoporosis',
    riskLevel: 'low',
    riskScore: 12,
    factors: [
      { factor: 'Age under 50', impact: 'positive', weight: -25 },
      { factor: 'Regular Weight-bearing Exercise', impact: 'positive', weight: -15 },
      { factor: 'Adequate Calcium Intake', impact: 'positive', weight: -10 },
      { factor: 'Normal Vitamin D', impact: 'positive', weight: -8 }
    ],
    recommendations: [
      'Continue weight-bearing exercises',
      'Maintain adequate calcium and vitamin D',
      'Avoid smoking and excessive alcohol',
      'Consider DEXA scan at age 50'
    ],
    nextScreening: '2034-08-20',
    lastAssessed: '2024-08-20T00:00:00Z'
  }
];

export const mockHealthInsights: HealthInsight[] = [
  {
    id: 'insight-1',
    type: 'achievement',
    title: 'Weight Loss Goal Achievement',
    description: 'Congratulations! You\'ve successfully lost 8 pounds over the past 6 months while maintaining a healthy BMI.',
    impact: 'positive',
    confidence: 95,
    relatedMetrics: ['weight', 'bmi'],
    generatedAt: '2024-08-22T00:00:00Z'
  },
  {
    id: 'insight-2',
    type: 'trend',
    title: 'Blood Pressure Improvement Trend',
    description: 'Your systolic blood pressure has decreased by an average of 2 mmHg per month over the last 4 months.',
    impact: 'positive',
    confidence: 88,
    relatedMetrics: ['bp-systolic'],
    generatedAt: '2024-08-20T00:00:00Z'
  },
  {
    id: 'insight-3',
    type: 'concern',
    title: 'LDL Cholesterol Plateau',
    description: 'Your LDL cholesterol has remained elevated above optimal levels for the past 3 months despite previous improvements.',
    impact: 'negative',
    confidence: 82,
    relatedMetrics: ['cholesterol-ldl'],
    generatedAt: '2024-08-18T00:00:00Z'
  },
  {
    id: 'insight-4',
    type: 'milestone',
    title: 'Glucose Control Milestone',
    description: 'You\'ve maintained excellent glucose control for 12 consecutive months with all readings in the normal range.',
    impact: 'positive',
    confidence: 97,
    relatedMetrics: ['glucose', 'hba1c'],
    generatedAt: '2024-08-15T00:00:00Z'
  }
];

export const calculateHealthScore = (metrics: HealthMetric[]): number => {
  let totalScore = 0;
  let weightedSum = 0;

  const weights = {
    'vitals': 0.3,
    'labs': 0.4,
    'biometrics': 0.2,
    'lifestyle': 0.1
  };

  metrics.forEach(metric => {
    let score = 100;
    
    // Calculate score based on status
    switch (metric.status) {
      case 'normal':
        score = 100;
        break;
      case 'borderline':
        score = 75;
        break;
      case 'high':
      case 'low':
        score = 50;
        break;
      case 'critical':
        score = 25;
        break;
    }

    // Apply trend modifier
    switch (metric.trend) {
      case 'improving':
        score += 5;
        break;
      case 'declining':
        score -= 10;
        break;
    }

    const weight = weights[metric.category] || 0.1;
    totalScore += score * weight;
    weightedSum += weight;
  });

  return Math.min(100, Math.max(0, Math.round(totalScore / weightedSum)));
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const getHealthScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Attention';
};
