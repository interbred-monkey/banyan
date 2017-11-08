global.__base = __dirname;

const fs = require('fs');
           require('dotenv').config();

if (fs.existsSync(`${__base}/art.txt`)) {

  console.log(`\n${fs.readFileSync(`${__base}/art.txt`, 'utf-8').toString()}\n`);

}

if (fs.existsSync(`${__base}/Api`)) {

  let Api = require(`${__base}/Api/Startup.js`);
  new Api().Start();

}

if (fs.existsSync(`${__base}/App`)) {

  let App = require(`${__base}/App/Startup.js`);
  new App().Start();

}