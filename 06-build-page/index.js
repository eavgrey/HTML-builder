const fs = require('fs');
const path = require('path');

function readFilePromise(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

function writeFilePromise(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function copyDir(source, destination) {
  return new Promise((resolve, reject) => {
    fs.mkdir(destination, { recursive: true }, error => {
      if (error) {
        reject(error);
        return;
      }
      fs.readdir(source, { withFileTypes: true }, async (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        for (const file of files) {
          const sourcePath = path.join(source, file.name);
          const destPath = path.join(destination, file.name);
          if (file.isDirectory()) {
            await copyDir(sourcePath, destPath);
          } else {
            await copyFile(sourcePath, destPath);
          }
        }
        resolve();
      });
    });
  });
}

function copyFile(source, destination) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(destination);
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    readStream.pipe(writeStream);
  });
}

async function replaceTagsInTemplate(templatePath, componentsDirPath) {
  const templateContent = await readFilePromise(templatePath);
  const componentFiles = await fs.promises.readdir(componentsDirPath);

  let result = templateContent;
  for (const componentFile of componentFiles) {
    const componentFilePath = path.join(componentsDirPath, componentFile);
    const componentContent = await readFilePromise(componentFilePath);
    const tagName = `{{${componentFile.split('.')[0]}}}`;
    result = result.split(tagName).join(componentContent);
  }

  return result;
}

async function buildStyles(stylesDirPath, resultFilePath) {
  const styleFiles = await fs.promises.readdir(stylesDirPath);
  const styleContent = await Promise.all(styleFiles.map(async styleFile => {
    const styleFilePath = path.join(stylesDirPath, styleFile);
    if (path.extname(styleFilePath) !== '.css') {
      throw new Error(`Error: ${styleFilePath} is not a css file`);
    }
    return readFilePromise(styleFilePath);
  }));
  const resultContent = styleContent.join('\n');
  return writeFilePromise(resultFilePath, resultContent);
}

async function buildProject() {
  const distDirPath = path.join(__dirname, 'project-dist');
  await fs.promises.mkdir(distDirPath, { recursive: true });

  const templatePath = path.join(__dirname, 'template.html');
  const componentsDirPath = path.join(__dirname, 'components');
  const indexHtmlPath = path.join(distDirPath, 'index.html');
  const indexHtmlContent = await replaceTagsInTemplate(templatePath, componentsDirPath);
  await writeFilePromise(indexHtmlPath, indexHtmlContent);

  const stylesDirPath = path.join(__dirname, 'styles');
  const styleCssPath = path.join(distDirPath, 'style.css');
  await buildStyles(stylesDirPath, styleCssPath);

  const assetsDirPath = path.join(__dirname, 'assets');
  const assetsDistDirPath = path.join(distDirPath, 'assets');
  await copyDir(assetsDirPath, assetsDistDirPath);
}

buildProject()
  .then(() => console.log('Build success!'))
  .catch(error => console.error(error));
