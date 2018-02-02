/*global __base*/
/*global __formatError*/

const TestService = require(`${__base}/Services/TestService.js`);

class TestController {

  constructor() {}

  async postSomeData(params) {

    try {

      let testService = new TestService();
      let [error, model] = await testService.Add(params.data);

      return [error, model];

    }

    catch(e) {

      return __formatError('An unknown error has occured');

    }

  }

}

module.exports = TestController;