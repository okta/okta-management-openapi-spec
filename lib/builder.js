const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const version = require('./version').version;
const util = require('./util');

const builder = module.exports;

builder.build = ({spec}) => {
  spec = spec || {};
  spec.info = spec.info || {};
  spec.info.version = version;
  spec.paths = spec.paths || {};
  spec.definitions = spec.definitions || {};

  builder.addEndpoints({spec});

  builder.addModels({spec});

  // OperationIds can collide, like getUsers on /api/v1/users and /api/v1/groups/:id/users
  util.ensureUniqueOperationIds(spec);

  // Ensure that all properties of models that can't be sent to Okta are readOnly
  util.ensureReadOnlyProperties(spec);

  util.ensureConsistentStructure(spec);

  // Recursively remove null and undefined properties
  spec = util.removeNils(spec);

  // Ensure that we generate a consistent spec for diffing
  util.ensureConsistentStructure(spec);

  util.removeUnusedModels(spec);

  return spec;
};



// Add endpoints to the spec (known as paths in openapi)
builder.addEndpoints = ({spec}) => {

  util.forEachMapEntry(spec.paths, function(url, path) {




    const originalUrl = url;


    function extractParams(str) {
      const matches = str.match(/\{\w+\}/g);
      if (matches) {
        return matches.map((original) => original.substring(1, original.length - 1) )
      }
      return []
    }

    var oldParams = extractParams(originalUrl);
    var newParams = extractParams(url);

    var pathArgMap = {};
    oldParams.forEach((value, index) => pathArgMap[value] = newParams[index]);

    util.forEachMapEntry(path, function(method, operation) {

      operation.consumes = operation.consumes || ['application/json'];
      operation.produces = operation.produces || ['application/json'];

      // TODO: we can add oauth2 support here in the future
      operation.security = [{
        'api_token': []
      }];

      if (operation.responses) {
        util.forEachMapEntry(operation.responses, function(statusCode, response){

          if (statusCode === 'default') {
            statusCode = '200';
            operation.responses[statusCode] = response;
            operation.responses['default'] = null;
          }

          if (response.schema) {
            if(response.schema.hasOwnProperty('$ref')) {

              let modelName = _.last(response.schema['$ref'].split('/'));
              response.schema['$ref'] = "#/definitions/" + modelName;

            } else if (response.schema.hasOwnProperty('items') && response.schema.items['$ref']) {

              let modelName = _.last(response.schema.items['$ref'].split('/'));
              response.schema.items['$ref'] = "#/definitions/" + modelName;
            }
          }
        });
      }

      // TODO currently not using deprecated, so clear it
      operation.deprecated = null;

      if (operation.parameters !== undefined) {
        operation.parameters.forEach(function(param) {

          // we don't use 'pattern' so clear it out
          param.pattern = null;

          // determine if required
          if (!param.required) {
            param.required = null; // false is the default, so just clear it out, reduce initial diff
          }

          if(param.schema && param.schema.hasOwnProperty('$ref')) {

            // rename the param name and type based on the modelMap
            let modelName = _.last(param.schema['$ref'].split('/'));
          }
        });
      }
    });

    spec.paths[url] = path;
  });
};

// Add models to the spec
builder.addModels = ({spec}) => {

  util.forEachMapEntry(spec.definitions, function(modelName, model) {

    // TODO: to reduce diff, remove the int32 format marker
    model = _.cloneDeepWith(model, (value) => {
      if(typeof value === 'string' && value === 'int32') {
        return null;
      }
    });

    spec.definitions[modelName] = model;
  });
};
