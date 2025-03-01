const fs = require('fs');

// Read the file
const filePath = 'client/src/components/payroll/PayrollDataEntryTable.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all escape sequences (ANSI escape codes)
content = content.replace(/\x1B\[\d+[A-Z]/g, '');
content = content.replace(/\x1B\[\d+;\d+[A-Z]/g, '');
content = content.replace(/\x1B\[\d+[ABCD]/g, '');
content = content.replace(/\x1B\[\d+m/g, '');

// Write the cleaned file
fs.writeFileSync('clean-file.tsx', content);
console.log('File cleaned and saved to clean-file.tsx');