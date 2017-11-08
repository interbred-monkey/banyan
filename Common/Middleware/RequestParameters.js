function RequestParameters(req, res, next) {
  
  Object.assign(queryParameters = {}, req.body, req.params, req.query);

  req.body = queryParameters;

  return next();

}

module.exports = RequestParameters;