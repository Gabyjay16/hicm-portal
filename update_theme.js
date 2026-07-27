const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components');

const replacements = [
  // Backgrounds
  { regex: /bg-navy-900/g, replacement: 'bg-slate-50' },
  { regex: /bg-navy-800/g, replacement: 'bg-white' },
  { regex: /bg-slate-900/g, replacement: 'bg-slate-50' },
  { regex: /bg-slate-800/g, replacement: 'bg-white' },
  { regex: /bg-slate-700/g, replacement: 'bg-slate-100' },
  
  // Borders
  { regex: /border-slate-700\/[0-9]+/g, replacement: 'border-slate-200' },
  { regex: /border-slate-700/g, replacement: 'border-slate-200' },
  { regex: /border-slate-600/g, replacement: 'border-slate-300' },
  { regex: /border-white\/20/g, replacement: 'border-slate-200' },
  
  // Text colors on generic elements (this is tricky, let's target specific known bad ones)
  // Only replace text-white if it's NOT following a blue/emerald/red bg.
  // Actually, let's just do targeted replacements for text-offwhite, text-slate-200, text-slate-300, text-slate-400
  { regex: /text-offwhite/g, replacement: 'text-slate-900' },
  { regex: /text-slate-200/g, replacement: 'text-slate-800' },
  { regex: /text-slate-300/g, replacement: 'text-slate-700' },
  { regex: /text-slate-400/g, replacement: 'text-slate-600' },
  
  // Specific replacements for TimedEvaluation & Plagiarism text-white
  { regex: /text-white block/g, replacement: 'text-slate-900 block' },
  { regex: /text-white font-bold/g, replacement: 'text-slate-900 font-bold' },
];

function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      // Special case: text-white that might be inside a button (we want to keep those).
      // We'll manually fix the glass-panel text-white if needed, or we just did with "text-white block" etc.
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log("Done updating themes.");
