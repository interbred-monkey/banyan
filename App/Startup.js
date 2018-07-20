/*global __base*/
/*global __formatError*/

const _           = require('lodash/core'),
      fs          = require('fs'),
      Routes      = require(`${__base}/Common/Routes.js`),
      Middleware  = require(`${__base}/Common/Middleware.js`);

class App {

  constructor () {

    this.Library  = 'express';
    this.Module   = require(this.Library)();
    this.Protocol   = require(this.DefineProtocolLibrary());

  }

  DefineProtocolLibrary() {

    if (_.isString(process.env.APP_SSL_KEY)) {

      return 'https';

    }

    else {

      return 'http';

    }

  }

  async DefineSSLOptions() {

    let options = {},
        actions = [];

    if (_.isString(process.env.APP_SSL_KEY)) {

      options.key = '';
      actions.push(this.ReadSSLCertificate(process.env.APP_SSL_KEY));

    }

    if (_.isString(process.env.APP_SSL_CA)) {

      options.ca = '';
      actions.push(this.ReadSSLCertificate(process.env.APP_SSL_CA));

    }

    if (_.isString(process.env.APP_SSL_CERT)) {

      options.cert = '';
      actions.push(this.ReadSSLCertificate(process.env.APP_SSL_CERT));

    }

    return Promise.all(actions)
    .then(values => {

      let keys = Object.keys(options);
      values.map((val, key) => {

        options[keys[key]] = val;

      });

      return (_.isEmpty(options)?null:options);

    })
    .catch((e) => {

      throw e;

    });

  }

  ReadSSLCertificate(path) {

    return new Promise((resolve, reject) => {

      if (!fs.existsSync(`${__base}/${path}`)) {

        return reject(__formatError(`The supplied path,\n ${path} \n does not exist`));

      }

      fs.readFile(`${__base}/${path}`, (err, data) => {

        if (!_.isNull(err)) {

          return reject(err);

        }

        return resolve(data.toString());

      });

    });

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

      let serverOptions = _.compact([await this.DefineSSLOptions(), this.Module]);

      this.Protocol.createServer.apply(null, serverOptions).listen(process.env.APP_PORT, process.env.APP_IP || '0.0.0.0');

    }

    catch(e) {

      throw e;

    }

  }

}

module.exports = App;