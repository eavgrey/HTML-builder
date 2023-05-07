const { createReadStream } = require('fs');

const filePath = './01-read-file/text.txt';
const readStream = createReadStream(filePath);

readStream.on('data', data => {
  console.log(data.toString());
});

readStream.on('error', error => {
  console.error(`Error reading file: ${error}`);
});
