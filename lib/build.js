const fs = require('fs');
const path = require('path');
const util = require('./util');
const builder = require('./builder');
const oktaSpec = util.readYAML(path.resolve(__dirname, '../resources/spec.yaml'));


const spec = builder.build({
  spec: oktaSpec
});

// write the spec to a file
const dir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
fs.writeFileSync(path.join(dir, 'spec.json'), util.prettyJSON(spec));
fs.writeFileSync(path.join(dir, 'spec.yaml'), util.prettyYAML(spec));
