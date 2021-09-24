#! /usr/bin/env node
const _ = require('lodash');
const path = require('path');
const program = require('commander');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const packageJson = require('../package.json');
const util = require('./util');

const defaultSpecLocation = path.normalize(path.join(__dirname, '../dist/spec.json'));

function formatPath(p) {
  /* istanbul ignore if */
  if (!p) /* istanbul ignore next */ return;
  if (path.isAbsolute(p)) return p;
  return path.normalize(path.join(process.cwd(), p));
}

function getModelName(definition) {
  return _.last(definition.split('/'));
}

function getModelType(obj) {
  if (obj.additionalProperties) {
    /* instanbul ignore if */
    if (obj.additionalProperties['$ref']) {
      /* istanbul ignore next */ return getModelName(obj.additionalProperties['$ref']);
    } else {
      return util.getCommonType(obj.additionalProperties);
    }
  }

  if (obj.items) {
    /* istanbul ignore if  */
    if (obj.items['$ref']) {
      /* istanbul ignore next */ return getModelName(obj.items['$ref']);
    } else {
      return util.getCommonType(obj.items);
    }
  }

  /* instanbul ignore else */
  if (obj['$ref']) {
    return getModelName(obj['$ref']);
  }
}

function buildOperations(spec) {
  const operations = [];
  for (let [pathName, path] of Object.entries(spec.paths)) {
    for (let [methodName, method] of Object.entries(path)) {
      if(method['x-okta-multi-operation'] !== undefined) {
        for (let [operationKey, operation] of Object.entries(method['x-okta-multi-operation'])) {
          if(operation.parameters) {
            const newParametersList = [...operation.parameters, ...method.parameters];
            operation.parameters = newParametersList;
          }
          delete method['x-okta-multi-operation'];

          let newMethod = Object.assign({}, method, operation);

          const multiOperation = buildOperation(pathName, methodName, newMethod);

          operations.push(multiOperation);
        }


      }
      delete path;
    }
    for (let [methodName, method] of Object.entries(path)) {
      if(method.operationId !== undefined) {
        // common parameters for all HTTP methods?
        if (!method.parameters && path.parameters) {
          method.parameters = path.parameters;
        }
        const operation = buildOperation(pathName, methodName, method);

        operations.push(operation);

      }
    }
  }
  return operations;

  function buildOperation(pathName, methodName, method) {
    const operation = buildOperationObject(pathName, methodName, method);
    const body = method['requestBody'];
    if (body) {
      const jsonBody = body.content['application/json'] || {};
      operation.consumes = Object.keys(body.content);
      if (jsonBody.schema) {
        operation.bodyModel = getModelName(jsonBody.schema['$ref']);
      }
      if (!jsonBody.schema && jsonBody.type) {
        operation.bodyModel = body.type

        if (jsonBody.format) {
          operation.bodyFormat = jsonBody.format
        }
      }
    }
    // Determine the return type
    const success = _.get(method, 'responses["200"].content') || _.get(method, 'responses["201"].content');
    
    if (success) {
      const jsonResponse = success['application/json'];
      operation.produces = Object.keys(success);
      if (jsonResponse) {
        if (jsonResponse.schema.items && jsonResponse.schema.items['$ref']) {
          operation.responseModel = getModelName(jsonResponse.schema.items['$ref']);
          operation.isArray = true;
          /* istanbul ignore else */
        }
        else if (jsonResponse.schema['$ref']) {
          operation.responseModel = getModelName(jsonResponse.schema['$ref']);
        }
        else if (jsonResponse.schema['type']) {
          operation.returnType = jsonResponse.schema['type'];
        }
      }
    }
    return operation;
  }

  function buildOperationObject(pathName, methodName, method) {
    const methodParameters = method.parameters || [];
    return Object.assign({
        consumes: [],
        produces: [],
      },
      {
      path: pathName,
      method: methodName,
      queryParams: methodParameters
        .filter(param => param.in === 'query')
        .map(param => {
          if (param['schema'] && param['schema']['$ref']) {
            param.schema.type = getModelName(param['schema']['$ref']);
            // delete param['x-openapi-v3-schema-ref'];
          }
          return param;
        }),
      pathParams: methodParameters.filter(param => param.in === 'path')
    }, _.pick(method, [
      'operationId',
      'description',
      'summary',
      'tags',
      'consumes',
      'produces',
      'encoding',
      'parameters'
    ]));
  }
}

function buildModels(spec, operations) {
  const operationMap = _.keyBy(operations, 'operationId');

  // Track enums
  const enumArray = Object.entries(spec.components.schemas)
    .filter(([definitionName, definition]) => !!definition.enum)
    .map(([definitionName, definition]) => definitionName);
  const enumSet = new Set(enumArray);

  return Object.entries(spec.components.schemas)
    .map(([definitionName, definition]) => {
      const model = {
        modelName: definitionName
      };

      if (definition.enum) {
        model.enum = definition.enum;
        model.tags = definition['x-okta-tags'] || /* istanbul ignore next */ [];
        return model;
      }

      model.properties = Object.entries(definition.properties || {})
        .map(([propertyName, property]) => {
          const prop = _.cloneDeep(property);
          prop.propertyName = propertyName;

          if (property['$ref'] && enumSet.has(getModelName(property['$ref']))) {
            prop.commonType = 'enum';
          } else {
            prop.commonType = util.getCommonType(property);
          }

          switch (prop.commonType) {
            case 'hash':
              prop.isHash = true;
              break;
            case 'array':
              prop.isArray = true;
              break;
            case 'object':
              prop.isObject = true;
              break;
            case 'enum':
              prop.isEnum = true;
              break;
          }

          if (['hash', 'array', 'object', 'enum'].includes(prop.commonType)) {
            prop.model = getModelType(property);
          }

          delete prop.type;
          delete prop.format;
          delete prop.items;
          delete prop.additionalProperties;

          return prop;
        });

      model.methods = (definition['x-okta-operations'] || []).map(link => {
        return {
          alias: link.alias,
          arguments: link.arguments,
          operation: operationMap[link.operationId]
        };
      });

      model.crud = (definition['x-okta-crud'] || []).map(link => {
        return {
          alias: link.alias,
          arguments: link.arguments,
          operation: operationMap[link.operationId]
        };
      });

      model.tags = definition['x-okta-tags'] || /* istanbul ignore next */ [];

      if (definition['discriminator'] && definition['discriminator']['mapping']) {
        model.requiresResolution = true;
      }

      const parentDefinitionUri = definition['x-okta-parent'];

      if (parentDefinitionUri) {
        const parentModelName = parentDefinitionUri.split('/')[3];
        model.extends = parentModelName;
      }

      const discriminatorDefinition = definition['discriminator'];
      if (discriminatorDefinition && discriminatorDefinition.mapping) {
        model.resolutionStrategy = {
          propertyName: discriminatorDefinition.propertyName,
          valueToModelMapping: Object.entries(discriminatorDefinition.mapping).reduce((mapping, keyValuePair) => {
            mapping[keyValuePair[0]] = keyValuePair[1].split('/')[3];
            return mapping;
          }, {})
        };
      }

      return model;
    });
}

function main() {
  console.log(process.argv);
  program
    .version(packageJson.version)
    .option('-s, --spec [jsonFile]',  'OpenAPI spec. defaults to the spec packaged with the generator', formatPath, defaultSpecLocation)
    .option('-t, --templateDir [dir]', 'Directory with the language-specific templates. defaults to current directory', formatPath, process.cwd())
    .option('-o, --output [dir]', 'Destination for directory', formatPath)
    .parse(process.argv);

  if (!program.output) {
    throw new Error('You must provide a directory to write the generated code with -o or --output');
  }

  console.log(`
    spec: ${program.spec}
    templateDir: ${program.templateDir}
    output: ${program.output}
  `);

  if (!fs.existsSync(path.join(program.templateDir, 'index.js'))) {
    throw new Error(`An index.js file must exist in ${program.templateDir}`);
  }

  const spec = require(program.spec);
  const lang = require(program.templateDir);

  if (!lang.process) {
    throw new Error(`${program.templateDir}/index.js must export a process method`);
  }

  const operations = buildOperations(spec);
  const models = buildModels(spec, operations);

  const templates = lang.process({spec, operations, models, handlebars});

  // Extend handlebars with logic
  handlebars.registerHelper(util.handlebarsHelpers);

  fs.ensureDirSync(program.output);
  for (let template of templates) {
    const source = path.join(program.templateDir, template.src);
    const destination = path.join(program.output, template.dest);

    const contents = fs.readFileSync(source, 'utf8');

    const compiled = handlebars.compile(contents);
    const rendered = compiled(template.context);

    fs.ensureFileSync(destination);
    fs.writeFileSync(destination, rendered);
  }
}

// If called directly
/* istanbul ignore if */
if (require.main === module) {
  /* istanbul ignore next */
  main();

// If required as module
} else {
  module.exports = main;
}
