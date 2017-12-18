/*global __base*/
/*global __logging*/

const Routes      = require(`${__base}/Common/Routes.js`),
      Middleware  = require(`${__base}/Common/Middleware.js`);

class App {

  constructor () {

    this.Library  = 'express';
    this.Module   = require(this.Library)();

  }

  async Start() {

    try {

      let middleware = new Middleware(`${__base}/App/Middleware`);
      await middleware.Load();
      let routes = new Routes(`${__base}/App/Routes`, `${__base}/App/Controllers`);
      await routes.Load();

      middleware.SetupRouteParameterInjection(this.Module, routes.RoutesConfig);

      middleware.Apply(this.Module);
      routes.Apply(this.Module);

      routes.AddStaticFiles(this.Library, this.Module, `${__base}/${process.env.STATIC_DIRECTORY}`);
      routes.AddMissingPage(this.Module, `${__base}/${process.env.MISSING_PAGE}`);
      routes.AddErrorPage(this.Module, `${__base}/${process.env.ERROR_PAGE}`);

      this.Module.listen(process.env.APP_PORT);

    }

    catch(e) {

      throw e;

    }

  }

}

module.exports = App;
