const licenseHeader =
`#
# Copyright 2020-Present Okta, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
`
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
fs.writeFileSync(path.join(dir, 'spec.yaml'), licenseHeader + util.prettyYAML(spec));
