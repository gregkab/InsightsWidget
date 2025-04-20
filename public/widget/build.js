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

`;

// Process files
let bundle = banner;

// Process each file
for (const file of files) {
  console.log(`Processing: ${path.relative(process.cwd(), file)}`);
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove module imports
  content = content.replace(/^import.*?;$/gm, '');
  
  // Remove module exports
  content = content.replace(/^export\s+/gm, '');
  
  // Add to bundle
  bundle += content + '\n\n';
}

// Write to output file
fs.writeFileSync(outputFile, bundle);

console.log(`Bundle created: ${path.relative(process.cwd(), outputFile)}`);
console.log(`File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`); 