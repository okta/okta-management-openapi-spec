const path = require('path');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const program = require('commander');
const generator = require('../lib/generator');

describe('generator', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'ensureDirSync');
    sandbox.stub(fs, 'ensureFileSync');
    sandbox.stub(fs, 'writeFileSync');
  });
  afterEach(() => sandbox.restore());

  it('throws error if no output directory is provided', () => {
    expect(generator).to.throw('You must provide a directory to write the generated code with -o or --output');
  });

  it('throws an error if an index.js file does not exist in the templateDir', () => {
    sandbox.stub(process, 'argv', [
      'node', 'generator.js',
      '--output', 'random_output',
      '--templateDir', 'random_template'
    ]);
    expect(generator).to.throw(`An index.js file must exist in ${path.join(__dirname, "../..")}/openapi/random_template`);
  });

  it('throws an error if the language template does not contain a process() method', () => {
    const templateDir = path.join(__dirname, 'fixtures/templateWithoutProcess');
    sandbox.stub(process, 'argv', [
      'node', 'generator.js',
      '--output', 'random_output',
      '--templateDir', templateDir
    ]);
    expect(generator).to.throw(`${templateDir}/index.js must export a process method`);
  });

  it('processes templates', () => {
    const output = path.join(__dirname, 'random_output');
    const templateDir = path.join(__dirname, 'fixtures/templates');
    sandbox.stub(process, 'argv', [
      'node', 'generator.js',
      '--output', output,
      '--templateDir', templateDir
    ]);
    generator();
    expect(fs.ensureDirSync.lastCall.args[0]).to.equal(output);
    expect(fs.ensureFileSync.lastCall.args[0]).to.equal(`${output}/destination.js`);
    expect(fs.writeFileSync.lastCall.args[0]).to.equal(`${output}/destination.js`);
    expect(fs.writeFileSync.lastCall.args[1]).to.equal('sample\n');
  });
});
