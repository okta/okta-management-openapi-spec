const _ = require('lodash');
const spec = require('../dist/spec.json');

let errored = false;

function error(err) {
  errored = true;
  console.error(err);
}

/**
 * Define a custom set of validation functions, so that we can catch anything
 * that's a problem in our extensions of the spec.  The swagger-cli is used to
 * catch anything that is a violation of the "standard" spec.
 */

const validators =  {
  enumInheritance : (spec) => {
    _.forIn(spec.definitions, (model, modelName) => {
      const parentPath = model['x-okta-parent'];
      if(parentPath) {
        const parentModelName = parentPath.split('/')[2]
        _.forIn(model.properties, (property, propertyName) => {
          if(property.enum) {
            if(spec.definitions[parentModelName].properties[propertyName]){
              error(`${modelName} has re-defined enum '${propertyName}'.  It should only be defined once on ${parentModelName}`)
            }
          }
        })
      }
    })
  },
  definitionTags : (spec) => {
    _.forIn(spec.definitions, (model, modelName) => {
      const xoktatags = model['x-okta-tags'];
      if(!xoktatags || xoktatags.length < 1) {
        error(`${modelName} does not define any 'x-okta-tags'. It should have at least one 'x-okta-tags' item defined.`)
      }
    })
  }
}

_.forIn(validators, (validator, name) => {
  validator(spec);
})

if (errored) {
  process.exit(1)
}
