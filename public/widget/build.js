#!/usr/bin/env node

/**
 * Simple build script to bundle widget files
 */

const fs = require('fs');
const path = require('path');

// Output file
const outputFile = path.resolve(__dirname, 'widget.js');

// Source directory
const srcDir = path.resolve(__dirname, 'src');

// Order of imports
const files = [
  path.join(srcDir, 'utils/helpers.js'),
  path.join(srcDir, 'core/config.js'),
  path.join(srcDir, 'core/content-detector.js'),
  path.join(srcDir, 'core/api-service.js'),
  path.join(srcDir, 'ui/elements.js'),
  path.join(srcDir, 'ui/styles.js'),
  path.join(srcDir, 'index.js')
];

// Banner comment
const banner = `/**
 * AI Insight Widget
 * 
 * This script creates a widget that analyzes page content and provides AI-generated insights.
 * Built on ${new Date().toISOString().split('T')[0]}
 */

(function() {
`;

// Closing IIFE
const footer = `})();`;

// Process files
let bundle = banner;

// Keep track of module exports
const exportedFunctions = new Set();

// First pass: gather all exported function names
for (const file of files) {
  console.log(`First pass - Collecting exports from: ${path.relative(process.cwd(), file)}`);
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Find export declarations
  const exportRegex = /export\s+(const|function|class|let|var)\s+(\w+)/g;
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    exportedFunctions.add(match[2]);
    console.log(`  Found export: ${match[2]}`);
  }
}

// Second pass: process each file
for (const file of files) {
  console.log(`Processing: ${path.relative(process.cwd(), file)}`);
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove import statements (they've all been resolved in our bundle order)
  content = content.replace(/^import\s+{([^}]+)}\s+from\s+['"]\.\/.*?['"]\s*;?$/gm, '');
  content = content.replace(/^import\s+.*?from\s+['"]\.\/.*?['"]\s*;?$/gm, '');
  
  // Remove export keywords
  content = content.replace(/export\s+/gm, '');
  
  // Add to bundle
  bundle += content + '\n\n';
}

// Add the closing IIFE
bundle += footer;

// Write to output file
fs.writeFileSync(outputFile, bundle);

console.log(`Bundle created: ${path.relative(process.cwd(), outputFile)}`);
console.log(`File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`); 