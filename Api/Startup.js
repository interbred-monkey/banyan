/*global __base*/
/*global __logging*/

const Routes      = require(`${__base}/Common/Routes.js`),
      Middleware  = require(`${__base}/Common/Middleware.js`);

class Api {

  constructor () {

    this.Library  = 'express';
    this.Module   = require(this.Library)();

  }

  async Start() {

    try {

      let apiPrefix = `/api/v${process.env.API_VERSION || 1}`;
      let middleware = new Middleware(`${__base}/Api/Middleware`);
      await middleware.Load();
      let routes = new Routes(`${__base}/Api/Routes`, `${__base}/Api/Controllers`, apiPrefix);
      await routes.Load();

      middleware.SetupRouteParameterInjection(this.Module, routes.RoutesConfig);
      middleware.SetupRouteUriParameterExtraction(this.Module, routes.RoutesConfig);

      middleware.Apply(this.Module);
      routes.Apply(this.Module);

      routes.AddDefaultMissingResponse(this.Module);

      this.Module.listen(process.env.API_PORT);

    }

    catch(e) {

      throw e;

    }

  }

}

module.exports = Api;
