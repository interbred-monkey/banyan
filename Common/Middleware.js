/*global __base*/

const _     = require('lodash/core'),
      fs    = require('fs');

class Middleware {

  constructor(customMiddlewareDir) {

    this.CustomMiddlewareDir = customMiddlewareDir;
    this.CommonMiddlewareDir = `${__base}/Common/Middleware`;
    this.MiddlewareList = [];
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

    return new Promise( (resolve) => {

      fs.readdir(dir, async (err, files) => {

        if (!_.isNull(err)) {

          return resolve([]);

        }

        return resolve(files.map( (f) => {

          return `${dir}/${f}`;

        }));

      });

    });

  }

  Apply(module) {

    module.use(this.ExtractRequestParameters);

    this.MiddlewareList.forEach( (path) => {

      module.use(require(path));

    });

    return;

  }

  SetupRouteParameterInjection(module, routes) {

    if (!_.isObject(routes)) {

      return;

    }

    Object.values(routes).map( (route) => {

      module[route.method.toLowerCase()](route.uri, async (req, res, next) => {

        req.routeParameters = (_.isObject(route.parameters)?route.parameters:{});

        return next();

      });

    });

    return;

  }

  SetupRouteUriParameterExtraction(module, routes) {

    if (!_.isObject(routes)) {

      return;

    }

    Object.values(routes).map( (route) => {

      let matches = route.uri.match(/:([.a-z0-9_-]+)/g);

      if (!matches) {

        return;

      }

      matches = matches.map( (param) => {

        return param.replace(':', '');

      });

      module.param(matches, (req, res, next) => {

        req.uriParams = req.params;

        return next();

      });

    });

    return;

  }

  ExtractRequestParameters(req, res, next) {

    let queryParameters = {};

    Object.assign(queryParameters, req.body, req.params, req.query, req.uriParams);

    req.body = queryParameters;

    return next();

  }

}

module.exports = Middleware;
