const _ = require('lodash/core');

function IsRequiredAndSet(constraints, field) {

  if (_.isBoolean(constraints.required) && constraints.required === true && 
      _.isUndefined(field)) {

    return false;

  }

  return true;

}

async function IsValidType(type, field) {

  try {

    let ValidationModule = require(`${__base}/Common/Validation/${type}`);
    let validationModule = new ValidationModule();

    return await validationModule.ValidateType(field);

  }

  catch(e) {

    throw e;

  }

}

function StripUnrequiredParameters(requiredParams = {}, listToFilter = {}) {

  let filtered = {};

  Object.entries(requiredParams).forEach( ([field, value]) => {

    filtered[field] = listToFilter[field];

  })

  return filtered;

}

function ValidateBody(req, res, next) {

  let errors = [],
      params = {};

  if (!_.isObject(req.routeParameters)) {

    return next();

  }

  Object.entries(req.routeParameters).forEach( ([name, constraints]) => {

    if (!_.isObject(constraints)) {

      return;

    }

    if (!IsRequiredAndSet(constraints, req.body[name])) {

      errors.push(`${name} is a required parameter`);
      return;

    }

    try {

      if (!IsValidType(constraints.type, req.body[name])) {

        errors.push(`${name} is not a valid ${constraints.type}`);
        return;

      }

    }

    catch(e) {

      console.log(`Error: ${e.message}`);
      return;

    }

  })

  if (errors.length > 0) {

    return res.status(403).send({errors: errors});

  }

  req.body = StripUnrequiredParameters(req.routeParameters, req.body);

  return next();

}

module.exports = ValidateBody;