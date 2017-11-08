const Routes      = require(`${__base}/Common/Routes.js`),
      Middleware  = require(`${__base}/Common/Middleware.js`);

class App {

  constructor () {
    
    this.Module = require('express')();

  }

  async Start() {

    try {
      
      let middleware = new Middleware(`${__base}/App/Middleware`);
      await middleware.Load();
      let routes = new Routes(`${__base}/App/Routes`, `${__base}/App/Controllers`)
      await routes.Load();

      middleware.SetupRouteParameterInjection(this.Module, routes.RoutesConfig);

      middleware.Apply(this.Module);
      routes.Apply(this.Module);

      this.Module.listen(process.env.APP_PORT);

    }
    
    catch(e) {

      console.log(e);
      process.exit();

    }

  }

}

module.exports = App;