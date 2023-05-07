const fs = require('fs');
const path = require('path');

fs.readdir('03-files-in-folder/secret-folder', (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const filePath = path.join('03-files-in-folder/secret-folder', file);
      fs.stat(filePath, (err, stats) => {
        if (err) throw err;
  
        if (stats.isFile()) {
          const name = path.parse(file).name;
          const extension = path.parse(file).ext.slice(1);
          const size = stats.size / 1024;
          console.log(`${name} - ${extension} - ${size.toFixed(3)}kb`);
        }
      });
    });
  });