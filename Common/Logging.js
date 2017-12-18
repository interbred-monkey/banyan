const library = require('winston'),
      logsene = require('winston-logsene');

class Logging {

  constructor() {

    library.add(logsene, {
      token: process.env.LOGGING_TOKEN
    });

  }

  CreateMessage(message, stack) {

    return {
      message: message,
      stack: stack || console.trace
    };

  }

  log(message) {

    library.log(this.CreateMessage(message));

  }

  warning(message) {

    library.warn(this.CreateMessage(message));

  }

  error(error) {

    library.error(this.CreateMessage(error.message, error.stack));

  }

}

module.exports = Logging;