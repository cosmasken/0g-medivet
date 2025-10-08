#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = '/home/groot/Code/akindo/zerog-labs/prod/medData/web/src';

// Get all TypeScript/JavaScript files
function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Extract imports and exports from a file
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const exports = [];
  
  // Find import statements - more comprehensive regex
  const importPatterns = [
    /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*(?:,\s*(?:{[^}]*}|\*\s+as\s+\w+|\w+))?\s*from\s+['"`]([^'"`]+)['"`]/g,
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, // dynamic imports
  ];
  
  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        module: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  // Find export statements
  const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  // Find default exports
  const defaultExportRegex = /export\s+default\s+(\w+)/g;
  while ((match = defaultExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  return { imports, exports, content };
}

// Main analysis
function analyzeProject() {
  const files = getAllFiles(srcDir);
  const analysis = {
    components: new Map(),
    hooks: new Map(),
    utils: new Map(),
    imports: new Map(),
    files: new Map()
  };
  
  // First pass: collect all files and their exports
  for (const file of files) {
    const relativePath = path.relative(srcDir, file);
    const { imports, exports, content } = analyzeFile(file);
    
    analysis.files.set(relativePath, {
      path: file,
      imports,
      exports,
      content,
      size: content.length
    });
    
    // Categorize by type
    if (relativePath.startsWith('components/')) {
      analysis.components.set(relativePath, exports);
    } else if (relativePath.startsWith('hooks/')) {
      analysis.hooks.set(relativePath, exports);
    } else if (relativePath.startsWith('lib/')) {
      analysis.utils.set(relativePath, exports);
    }
  }
  
  // Second pass: find usage
  const usage = new Map();
  
  for (const [filePath, fileData] of analysis.files) {
    for (const imp of fileData.imports) {
      if (imp.module.startsWith('@/') || imp.module.startsWith('./') || imp.module.startsWith('../')) {
        let key = imp.module.replace('@/', '');
        
        // Normalize paths
        if (key.startsWith('./') || key.startsWith('../')) {
          // Resolve relative paths
          const currentDir = path.dirname(filePath);
          key = path.normalize(path.join(currentDir, key));
        }
        
        if (!usage.has(key)) {
          usage.set(key, []);
        }
        usage.get(key).push({
          usedIn: filePath,
          statement: imp.statement
        });
      }
    }
  }
  
  return { analysis, usage };
}

// Generate report
function generateReport() {
  const { analysis, usage } = analyzeProject();
  
  console.log('🔍 MediVet Web Code Audit Report\n');
  console.log('=' .repeat(50));
  
  // Check specific files for usage
  function isFileUsed(filePath) {
    const pathVariants = [
      filePath,
      filePath.replace(/\.(tsx?|jsx?)$/, ''),
      filePath.replace(/\/index\.(tsx?|jsx?)$/, ''),
    ];
    
    return pathVariants.some(variant => usage.has(variant));
  }
  
  // Unused Components
  console.log('\n📦 COMPONENTS ANALYSIS');
  console.log('-'.repeat(30));
  
  const unusedComponents = [];
  for (const [componentPath] of analysis.components) {
    if (!componentPath.includes('ui/') && !isFileUsed(componentPath)) {
      unusedComponents.push(componentPath);
    }
  }
  
  if (unusedComponents.length > 0) {
    console.log('❌ Potentially Unused Components:');
    unusedComponents.forEach(comp => console.log(`   - ${comp}`));
  } else {
    console.log('✅ All non-UI components appear to be used');
  }
  
  // Unused Hooks
  console.log('\n🎣 HOOKS ANALYSIS');
  console.log('-'.repeat(30));
  
  const unusedHooks = [];
  for (const [hookPath] of analysis.hooks) {
    if (!isFileUsed(hookPath)) {
      unusedHooks.push(hookPath);
    }
  }
  
  if (unusedHooks.length > 0) {
    console.log('❌ Potentially Unused Hooks:');
    unusedHooks.forEach(hook => console.log(`   - ${hook}`));
  } else {
    console.log('✅ All hooks appear to be used');
  }
  
  // UI Components Usage
  console.log('\n🎨 UI COMPONENTS USAGE');
  console.log('-'.repeat(30));
  
  const uiComponents = new Map();
  for (const [componentPath] of analysis.components) {
    if (componentPath.includes('ui/')) {
      let usageCount = 0;
      const pathVariants = [
        componentPath,
        componentPath.replace('.tsx', ''),
        `components/ui/${path.basename(componentPath, '.tsx')}`
      ];
      
      for (const variant of pathVariants) {
        if (usage.has(variant)) {
          usageCount += usage.get(variant).length;
        }
      }
      
      uiComponents.set(componentPath, usageCount);
    }
  }
  
  const sortedUI = Array.from(uiComponents.entries()).sort((a, b) => a[1] - b[1]);
  
  console.log('UI Components by usage (least to most used):');
  sortedUI.forEach(([comp, count]) => {
    const status = count === 0 ? '❌' : count < 3 ? '⚠️ ' : '✅';
    console.log(`   ${status} ${comp}: ${count} uses`);
  });
  
  // Large Files
  console.log('\n📏 LARGE FILES');
  console.log('-'.repeat(30));
  
  const largeFiles = Array.from(analysis.files.entries())
    .filter(([_, data]) => data.size > 5000)
    .sort((a, b) => b[1].size - a[1].size);
    
  if (largeFiles.length > 0) {
    console.log('Files over 5KB (consider splitting):');
    largeFiles.forEach(([file, data]) => {
      console.log(`   📄 ${file}: ${Math.round(data.size / 1024)}KB`);
    });
  }
  
  // Duplicate/Similar Components
  console.log('\n🔄 POTENTIAL DUPLICATES');
  console.log('-'.repeat(30));
  
  const componentNames = Array.from(analysis.components.keys())
    .filter(path => !path.includes('ui/'))
    .map(path => path.split('/').pop().replace(/\.(tsx?|jsx?)$/, ''));
  
  const duplicates = componentNames.filter((name, index) => 
    componentNames.indexOf(name) !== index
  );
  
  if (duplicates.length > 0) {
    console.log('⚠️  Components with similar names:');
    duplicates.forEach(name => console.log(`   - ${name}`));
  } else {
    console.log('✅ No obvious duplicate component names found');
  }
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(30));
  console.log(`Total files analyzed: ${analysis.files.size}`);
  console.log(`Components: ${analysis.components.size}`);
  console.log(`Hooks: ${analysis.hooks.size}`);
  console.log(`Utils: ${analysis.utils.size}`);
  console.log(`Unused components: ${unusedComponents.length}`);
  console.log(`Unused hooks: ${unusedHooks.length}`);
  console.log(`Unused UI components: ${sortedUI.filter(([_, count]) => count === 0).length}`);
  
  return {
    unusedComponents,
    unusedHooks,
    underusedUI: sortedUI.filter(([_, count]) => count < 2).map(([comp]) => comp),
    largeFiles: largeFiles.map(([file]) => file),
    duplicates
  };
}

// Run the analysis
if (require.main === module) {
  try {
    const results = generateReport();
    
    // Write detailed results to file
    fs.writeFileSync(
      '/home/groot/Code/akindo/zerog-labs/prod/medData/web/audit-results.json',
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 Detailed results saved to audit-results.json');
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}
