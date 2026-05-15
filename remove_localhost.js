const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('/Users/tapan/Anti Gravity/Final Capstone/frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('http://localhost:5001')) {
      let updated = content.replace(/http:\/\/localhost:5001/g, '');
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
