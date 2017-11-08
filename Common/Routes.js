const _     = require('lodash/core'),
      fs    = require('fs'),
      yaml  = require('js-yaml');

class Routes {

  constructor(routesDir, controllerDir) {

    this.RoutesDir = routesDir;
    this.ControllerDir = controllerDir;
    this.RoutesConfig;
    return;
  
  }

  async Load() {

    try {

      let dirList = await this.ListDir();
      this.RoutesConfig = await this.LoadRoutesConfigFromFiles(dirList);

    }
    
    catch(e) {

      throw e;

    }

    return;

  }

  ListDir() {

    return new Promise( (resolve, reject) => {

      fs.readdir(this.RoutesDir, async (err, files) => { 

        if (!_.isNull(err)) { return resolve([]); }

        return resolve(files.map( (f) => { return `${this.RoutesDir}/${f}`; }));

      })

    })

  }

  async LoadRoutesConfigFromFiles(dirList) {

    if (!_.isArray(dirList)) {

      return {};

    }

    let routesConfig = {};

    dirList.map( (path) => {

      try {

        Object.assign(routesConfig, yaml.safeLoad(fs.readFileSync(path, 'utf8')));

      }
      
      catch (e) {

        throw e;

      }

    })

    return routesConfig;

  }

  async Apply(module) {

    if (!_.isObject(this.RoutesConfig)) {

      return;

    }

    Object.entries(this.RoutesConfig).forEach( ([endpoint, route]) => {

      module[route.method.toLowerCase()](endpoint, async (req, res) => {

        try {

          let Library = require(`${this.ControllerDir}/${route.controller}`);
          let controller = new Library();
          let [error, response] = await controller[route.handler](req.body);

          return this.SendResponse(res, route.method, error, response);

        }
        
        catch(e) {

          // log errors - to do
          console.log(e);

          // make errors more human readable - to do

          return res.status(500).send();

        }

      })

    })

    return;

  }

  SendResponse(res, method, error, body) {

    let code = this.GenerateResponseCode(method, (!_.isNull(error)?true:false));

    if (_.isObject(error)) {

      body = {
        error: error.message
      }

    }

    return res.status(code).send(body);

  }

  GenerateResponseCode(method, error) {

    switch (method) {

      case "POST":
        return (error?404:201);

      case "GET":
      case "PUT":
      case "PATCH":
      case "DELETE":
        return (error?404:200);

    }

  }

}

module.exports = Routes;