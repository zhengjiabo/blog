const fs = require('fs');
const path = require('path');

const dirPath = 'E://web//items//blog//docs//assets';

fs.readdir(dirPath, function(err, files) {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(function(file) {
    const filePath = path.join(dirPath, file);

    fs.stat(filePath, function(err, stat) {
      if (err) {
        console.error('Error stating file:', err);
        return;
      }

      if (stat.isFile() && /\.(png|jpe?g)$/i.test(file)) {
        const newName = file.replace(/\s/g, 's');
        const newFilePath = path.join(dirPath, newName);

        fs.rename(filePath, newFilePath, function(err) {
          if (err) {
            console.error('Error renaming file:', err);
          } else {
            console.log(`Renamed ${file} to ${newName}`);
          }
        });
      }
    });
  });
});