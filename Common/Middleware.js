const _     = require('lodash/core'),
      fs    = require('fs');

class Middleware {

  constructor(customMiddlewareDir) {

    this.CustomMiddlewareDir = customMiddlewareDir;
    this.CommonMiddlewareDir = `${__base}/Common/Middleware`;
    this.MiddlewareList;
    return;
  
  }

  async Load() {

    try {

      let commonDirList = await this.ListDir(this.CommonMiddlewareDir);
      let customDirList = await this.ListDir(this.CustomMiddlewareDir);

      this.MiddlewareList = commonDirList.splice(customDirList);

    }

    catch(e) {

      throw e;

    }

    return;

  }

  ListDir(dir) {

    return new Promise( (resolve, reject) => {

      fs.readdir(dir, async (err, files) => { 

        if (!_.isNull(err)) { return resolve([]); }

        return resolve(files.map( (f) => { return `${dir}/${f}`; }));

      })

    })

  }

  Apply(module) {

    if (!_.isArray(this.MiddlewareList)) {

      return;

    }

    this.MiddlewareList.forEach( (path) => {

      module.use(require(path));
    
    })

    return;

  }

  SetupRouteParameterInjection(module, routes) {

    if (!_.isObject(routes)) {

      return;

    }

    Object.entries(routes).forEach( ([endpoint, route]) => {

      module[route.method.toLowerCase()](endpoint, async (req, res, next) => {

        req.routeParameters = (_.isObject(route.parameters)?route.parameters:{});

        return next();

      })

    })

    return;

  }

}

module.exports = Middleware;