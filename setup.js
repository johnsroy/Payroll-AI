const fs = require('fs');
const path = require('path');

// Create directory structure
const directories = [
  'lib',
  'lib/agents',
  'supabase',
  'supabase/migrations'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('Directory structure created successfully!');