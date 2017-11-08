let _ = require('lodash/core');

class String {
  
  async ValidateType(value) {

    return _.isString(value);

  }
   
}

module.exports = String