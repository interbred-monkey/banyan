// Used to retrieve POST body parameters sent to express
const bodyParser = require('body-parser');

module.exports = [bodyParser.json(), bodyParser.urlencoded({extended: true})];