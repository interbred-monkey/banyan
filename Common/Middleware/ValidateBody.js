/*global __base*/

const _ = require('lodash/core');

function IsRequiredAndSet(required, field) {

  if (_.isBoolean(required) && required === true && _.isUndefined(field)) {

    return false;

  }

  return true;

}

function IsValidType(type, field) {

  try {

    let ValidationModule = require(`${__base}/Common/Validation/${type}`);
    let validationModule = new ValidationModule();

    return validationModule.ValidateType(field);

  }

  catch(e) {

    throw e;

  }

}

function StripUnrequiredParameters(requiredParams = {}, listToFilter = {}) {

  let filtered = {};

  Object.entries(requiredParams).forEach( ([field]) => {

    filtered[field] = listToFilter[field];

  });

  return filtered;

}

async function ValidateBody(req, res, next) {

  let errors = [];

  if (!_.isObject(req.routeParameters)) {

    return next();

  }

  Object.entries(req.routeParameters).forEach( ([name, constraints]) => {

    if (!_.isObject(constraints)) {

      return;

    }

    if (!IsRequiredAndSet(constraints.required, req.body[name])) {

      errors.push(`${name} is a required parameter`);
      return;

    }

    if (_.isUndefined(req.body[name])) {

      return;

    }

    try {

      let isValueValid;
      [isValueValid, req.body[name]] = IsValidType(constraints.type, req.body[name]);

      if (!isValueValid) {

        errors.push(`${name} is not a valid ${constraints.type}`);
        return;

      }

    }

    catch(e) {

      throw e;

    }

  });

  if (errors.length > 0) {

    return res.status(403).send({errors: errors});

  }

  req.body = StripUnrequiredParameters(req.routeParameters, req.body);
  return next();

}

module.exports = ValidateBody;
