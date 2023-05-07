const readline = require('readline');
const path = require('path');
const { createWriteStream } = require('fs');

const fileName = 'output.txt';
const fullPath = path.join(__dirname, fileName);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const writeToFile = (text) => {
  const writeStream = createWriteStream(fullPath, { flags: 'a' });
  writeStream.write(`${text}\n`);
};

const handleUserInput = (userInput) => {
  if (userInput.toLowerCase() === 'exit') {
    console.log('Goodbye!');
    process.exit(0);
  }
  writeToFile(userInput);
  rl.prompt();
};

console.log('Type in your text and press enter. Type "exit" to exit.');
rl.prompt();

rl.on('line', handleUserInput);

rl.on('close', () => {
  console.log('Goodbye!');
});
