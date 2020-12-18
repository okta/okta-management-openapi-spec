const _ = require('lodash');
const fs = require('fs');
const stringify = require('json-stable-stringify');
const yaml = require('js-yaml');

const util = module.exports;

/*
 * Given a list of regexs, return a function that
 * determines if a given string is in that list
 */
util.buildListMatcher = regexList => {
  regexList = regexList || [];
  const list = regexList.map(str => new RegExp(`^${str}$`));
  return url => !!list.find((pattern) => {
    return pattern.test(url);
  });
};

util.buildRegexMap = regexHash => {
  const map = new Map();
  Object.keys(regexHash).map(regex => map.set(new RegExp(regex), regexHash[regex]));
  return map;
};

/*
 * Given an object where the keys are regexs, return
 * a function that returns a list of values for each
 * key that matches a string
 */
util.buildTagMatcher = tags => {
  tags = tags || {};
  const tagMap = util.buildRegexMap(tags);
  return url => {
    let urlTags = [];
    for (let [tagRegex, tagValue] of tagMap) {
      if (tagRegex.test(url)) {
        urlTags.push(tagValue);
      }
    }
    return urlTags;
  };
};

util.buildPathRewriter = pathRewriteMap => {
  pathRewriteMap = pathRewriteMap || {};
  const pathMap = util.buildRegexMap(pathRewriteMap);
  return (url, path) => {
    for (let [pathRegex, pathValue] of pathMap) {
      // See if this is a valid url
      if (pathRegex.test(url)) {
        // Get what we're replacing
        const ogPathParam = pathRegex.exec(url)[2];

        // Replace the url with our desired value in the correct place
        url = url.replace(pathRegex, `$1${pathValue}$3`);
      }
    }
    return [url, path];
  };
};

util.buildPathFinder = spec => {
  const regexToPath = [];

  const orderedPaths = Object.entries(spec.paths)
  .sort(([pathNameA], [pathNameB]) => {
    if (pathNameA < pathNameB) return -1;
    if (pathNameA > pathNameB) return 1;
    return 0;
  });

  // Loop through each path
  for (let [pathName, path] of orderedPaths) {
    // Change the pathName to a regex
    const pathRegex = pathName.replace(/{.*?}/g, '[^/]*?') + '$';
    regexToPath.push({
      regex: new RegExp(pathRegex),
      path
    });
  }

  // Return a function that finds the match
  return url => {
    // Remove the query params from url
    const sanitizedUrl = url.split('?')[0];

    for (let regexPathPair of regexToPath) {
      if (regexPathPair.regex.test(sanitizedUrl)) {
        return regexPathPair.path;
      }
    }
  };
};

util.buildOperationFinder = spec => {
  const pathFinder = util.buildPathFinder(spec);
  return (req) => {
    const path = pathFinder(req.url);
    if (path && req.method) {
      return path[req.method.toLowerCase()];
    }
  };
};

util.ensureUniqueOperationIds = spec => {
  // go through each spec.paths[path][operation].operationId to find those that aren't unique
  const duplicates = new Set();
  const operationIdMap = {};
  for (let p in spec.paths) {
    const path = spec.paths[p];
    for (let op in path) {
      const operation = path[op];
      const opId = operation.operationId;
      if (operationIdMap[opId]) {
        if(opId !== undefined) {
          duplicates.add(opId);
          operationIdMap[opId].push(operation);
        }
      } else {
        operationIdMap[opId] = [operation];
      }
    }
  }

  duplicates.forEach(opId => {
    operationIdMap[opId].forEach(operation => {
      const splitOpId = opId.split(/(?=[A-Z])/);
      const tag = operation.tags[0];
      if (!opId.includes(tag)) {
        splitOpId.splice(1, 0, tag);
        operation.operationId = splitOpId.join('');
      }
    });
  });
};

util.forEachMapEntry = (map, callbackfn) => {
  if (map) {
     Object.entries(map).forEach( entry => callbackfn(...entry));
  }
};

// Ensures that models that cannot be updated via API only have readOnly properties
// Also ensure that 'id' properties are all readOnly
util.ensureReadOnlyProperties = spec => {

  for (let [modelName, model] of Object.entries(spec.definitions)) {
    if (model && model.properties && model.properties.hasOwnProperty('id') && model.properties.id && model.properties.id['readOnly'] !== false) {
      model.properties.id['readOnly'] = true;

    }
    // remove readonly false from spec
    if (model && model.properties && model.properties.hasOwnProperty('id') && model.properties.id && model.properties.id['readOnly'] === false) {
      model.properties.id['readOnly'] = null;

    }
  }
};

toObject = map => {
    const result = {};
    map.forEach ((v,k) => { result[k] = v });
    return result;
};

util.stable = object => {
  return JSON.parse(stringify(object));
};

// This ensures consistent results when we diff
// json-stable-stringify is used, because a non-stringified version was unavailable
util.ensureConsistentStructure = spec => {
  spec.paths = JSON.parse(stringify(spec.paths));
  spec.definitions = JSON.parse(stringify(spec.definitions));
};

util.removeNils = obj => {
  if (_.isNil(obj)) return;

  if (_.isArray(obj)) {
    const newArr = [];
    for (let i = 0; i < obj.length; i++) {
      const res = util.removeNils(obj[i]);
      if (res) {
        newArr.push(res);
      }
    }
    return newArr;
  }

  if (_.isObject(obj)) {
    const newObj = {};
    for (let p of Object.keys(obj)) {
      newObj[p] = util.removeNils(obj[p]);
    }
    return newObj;
  }

  return obj;
};

util.prettyJSON = obj => JSON.stringify(obj, null, 2);

util.prettyYAML = obj => yaml.safeDump(obj);

util.readYAML = filename => yaml.safeLoad(fs.readFileSync(filename, 'utf8'));

util.overrideLinksAndEmbedded = (spec) => {
  const readOnlyObjectMap = {
    additionalProperties: {
      type: 'object'
    },
    readOnly: true,
    type: 'object'
  };

  for (let model of Object.values(spec.definitions)) {
    /* istanbul ignore else */
    if (model && model.properties) {

      if (model.properties['_links']) {
        model.properties['_links'] = _.clone(readOnlyObjectMap);
      }

      if (model.properties['_embedded']) {
        model.properties['_embedded'] = _.clone(readOnlyObjectMap);
      }
    }
  }

  // Remove the definitions that may have been associated with it
  /* istanbul ignore else */
  if (spec.definitions) {
    delete spec.definitions.Link;
    delete spec.definitions.LinksUnion;
    delete spec.definitions.EmbeddedObject;
  }
};

// Helper for adding whitespace (used from handlebars)
util.nbsp = (times) => {
  if (typeof times !== 'number') times = 1;
  return ' '.repeat(times);
};

// Helper for checking for property existence (used from handlebars)
util.exists = (obj, key) => {
  if (obj === null) return false;
  if (typeof obj === 'undefined') return false;

  return obj && obj.hasOwnProperty(key) && typeof obj[key] !== 'undefined';
};

util.getCommonType = (obj) => {
  if (!obj) return 'null';
  if (!obj.type) return 'object';
  if (obj.items) return 'array';
  if (obj.additionalProperties) return 'hash';

  switch (obj.type) {
    case 'integer':
      switch (obj.format) {
        case 'int32': return 'integer';
        case 'int64': return 'long';
        default: return 'integer';
      }
    case 'number':
      switch (obj.format) {
        case 'float': return 'float';
        case 'double': return 'double';
        default: return 'float';
      }
    case 'string':
      switch (obj.format) {
        case 'byte': return 'byte';
        case 'binary': return 'binary';
        case 'date': return 'date';
        case 'date-time': return 'dateTime';
        case 'password': return 'password';
        default: return 'string';
      }
    case 'boolean': return 'boolean';
    default: return 'object';
  }
};

util.handlebarsHelpers = {
    nbsp: (times) => util.nbsp(times),
    exists: (obj, key) => util.exists(obj, key),
    whitespace: () => '',
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) =>  v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and: (v1, v2) => v1 && v2,
    or: (v1, v2) => v1 || v2,
    camelCase: str => _.camelCase(str),
    snakeCase: str => _.snakeCase(str),
    upperSnakeCase: str => _.snakeCase(str).toUpperCase(),
    capitalize: str => _.capitalize(str),
    upperCase: str => str.toUpperCase(),
    lowerCase: str => str.toLowerCase(),
    pascalCase: str => _.upperFirst(_.camelCase(str))
  };

  util.removeUnusedModels = (spec) =>{
    const definedModelNames = Object.keys(spec.definitions);
    const referencedModelNames = new Set();
    // Use the underscore customizer to visit all properties in the spec
    _.cloneDeepWith(spec, (value) => {
      if (typeof value === 'string' && value.includes('#/definitions')) {
        referencedModelNames.add(value.split('/')[2]);
      }
    })
    definedModelNames.forEach(name => {
      if (!referencedModelNames.has(name)) {
        delete spec.definitions[name]
      }
    })
    // If models have been removed, call this function again.  The removed
    // models may have referenced other models which are no longer needed
    if(definedModelNames.length !== Object.keys(spec.definitions).length) {
      util.removeUnusedModels(spec);
    }
  }
