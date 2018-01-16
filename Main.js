/*global __base*/
/*global __logging*/

global.__base = __dirname;

require('dotenv').config();
const fs      = require('fs'),
      Db      = require(`${__base}/Common/DbDrivers/MongoDB.js`),
      Logging = require(`${__base}/Common/Logging.js`);

global.__formatError  = require(`${__base}/Common/FormatError.js`);
global.__db           = new Db();
global.__logging      = new Logging();

if (fs.existsSync(`${__base}/art.txt`)) {

  process.stdout.write(`\n${fs.readFileSync(`${__base}/art.txt`, 'utf-8').toString()}\n`);

}

if (fs.existsSync(`${__base}/Api`)) {

  let Api = require(`${__base}/Api/Startup.js`);
  new Api().Start()
  .catch( (e) => {

    __logging.error(e);
    throw e;

  });

}

if (fs.existsSync(`${__base}/App`)) {

  let App = require(`${__base}/App/Startup.js`);
  new App().Start()
  .catch( (e) => {

    __logging.error(e);
    throw e;

  });

}