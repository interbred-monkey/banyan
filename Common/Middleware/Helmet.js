// Used to stop xss and remove headers passed from express
const helmet = require('helmet');

module.exports = helmet();