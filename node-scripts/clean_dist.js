
const fs = require("fs");

const distFolder = './dist';

if (fs.existsSync(distFolder)) {
    console.log('The path exists.');
    fs.rmdirSync(distFolder, { recursive : true});
}