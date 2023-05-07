const fs = require("fs");
const path = require("path");

const stylesDir = path.join(__dirname, "styles");
const distDir = path.join(__dirname, "project-dist");
const bundleFile = path.join(distDir, "bundle.css");

function readDir(dir, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) return callback(err);

    const filePaths = files.map(file => path.join(dir, file));

    let cssFiles = [];
    let dirsLeft = filePaths.length;

    filePaths.forEach(filePath => {
      fs.stat(filePath, (err, stat) => {
        if (err) return callback(err);

        if (stat.isDirectory()) {
          readDir(filePath, (err, nestedFiles) => {
            if (err) return callback(err);

            cssFiles = cssFiles.concat(nestedFiles);
            if (--dirsLeft === 0) callback(null, cssFiles);
          });
        } else if (path.extname(filePath) === ".css") {
          cssFiles.push(filePath);
          if (--dirsLeft === 0) callback(null, cssFiles);
        } else {
          if (--dirsLeft === 0) callback(null, cssFiles);
        }
      });
    });
  });
}

readDir(stylesDir, (err, cssFiles) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  let content = "";

  cssFiles.forEach(file => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      content += data;

      if (--cssFiles.length === 0) {
        fs.writeFile(bundleFile, content, err => {
          if (err) {
            console.error(err);
          } else {
            console.log("Styles merged successfully!");
          }
        });
      }
    });
  });
});

