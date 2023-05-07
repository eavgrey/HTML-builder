const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'files');
const copyDirectory = path.join(__dirname, 'files-copy');

async function copyDir(source, target) {
  const entries = await fs.promises.readdir(source, { withFileTypes: true });

  await fs.promises.mkdir(target, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const dstPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, dstPath);
    } else {
      await fs.promises.copyFile(srcPath, dstPath);
    }
  }

  console.log('Directory copied successfully!');
}

copyDir(directory, copyDirectory)
  .catch(err => console.error(err));
