const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../lib/util');

describe('util', () => {
  describe('removeNils', () => {
    it('returns nothing is nothing passed', () => {
      expect(util.removeNils()).to.be.undefined;
    });

    it('only returns properties directly on the object', () => {
      class Parent {};
      Parent.prototype.random = 'this is random';
      const child = new Parent();
      child.prop = true;
      expect(util.removeNils(child)).to.deep.equal({
        prop: true
      });
    });
  });

  describe('nbsp', () => {
    it('returns an empty string', () => {
      expect(util.nbsp(0)).to.equal('');
    });

    it('returns a space character', () => {
      expect(util.nbsp()).to.equal(' ');
    });

    it('returns n space characters', () => {
      expect(util.nbsp(3)).to.equal('   ');
    });
  });

  describe('exists', () => {
    it('returns false for null object', () => {
      expect(util.exists(null, 'foo')).to.be.false;
    });

    it('returns false for undefined object', () => {
      expect(util.exists(undefined, 'foo')).to.be.false;
    });

    it('returns false for empty object', () => {
      expect(util.exists({}, 'foo')).to.be.false;
    });

    it('returns false for undefined property', () => {
      expect(util.exists({ foo: undefined }, 'foo')).to.be.false;
    });

    it('returns false for null key', () => {
      expect(util.exists({ foo: 'bar' }, null)).to.be.false;
    });

    it('returns false for undefined key', () => {
      expect(util.exists({ foo: 'bar' }, undefined)).to.be.false;
    });

    it('returns false for empty key', () => {
      expect(util.exists({ foo: 'bar' }, '')).to.be.false;
    });

    it('returns false for wrong key', () => {
      expect(util.exists({ foo: 'bar' }, 'baz')).to.be.false;
    });

    it('returns true for valid property', () => {
      expect(util.exists({ foo: 'bar' }, 'foo')).to.be.true;
    });
  });

  describe('getCommonType', () => {
    it('returns null if undefined', () => {
      expect(util.getCommonType(undefined)).to.equal('null');
    });

    it('returns object if no type', () => {
      expect(util.getCommonType({})).to.equal('object');
    });

    it('returns array if items available', () => {
      expect(util.getCommonType({type: 'any', items:[]})).to.equal('array');
    });

    it('returns hash if additionalProperties available', () => {
      expect(util.getCommonType({type: 'any', additionalProperties:[]})).to.equal('hash');
    });

    it('returns integer if integer type and no format', () => {
      expect(util.getCommonType({type: 'integer'})).to.equal('integer');
    });

    it('returns integer if integer type and format is int32', () => {
      expect(util.getCommonType({type: 'integer', format: 'int32'})).to.equal('integer');
    });

    it('returns long if integer type and format is int64', () => {
      expect(util.getCommonType({type: 'integer', format: 'int64'})).to.equal('long');
    });

    it('returns float if number type and no format', () => {
      expect(util.getCommonType({type: 'number'})).to.equal('float');
    });

    it('returns float if number type and format is float', () => {
      expect(util.getCommonType({type: 'number', format: 'float'})).to.equal('float');
    });

    it('returns double if number type and format is double', () => {
      expect(util.getCommonType({type: 'number', format: 'double'})).to.equal('double');
    });

    it('returns string if string type and no format', () => {
      expect(util.getCommonType({type: 'string'})).to.equal('string');
    });

    it('returns byte if string type and format is byte', () => {
      expect(util.getCommonType({type: 'string', format: 'byte'})).to.equal('byte');
    });

    it('returns binary if string type and format is binary', () => {
      expect(util.getCommonType({type: 'string', format: 'binary'})).to.equal('binary');
    });

    it('returns date if string type and format is date', () => {
      expect(util.getCommonType({type: 'string', format: 'date'})).to.equal('date');
    });

    it('returns dateTime if string type and format is date-time', () => {
      expect(util.getCommonType({type: 'string', format: 'date-time'})).to.equal('dateTime');
    });

    it('returns password if string type and format is password', () => {
      expect(util.getCommonType({type: 'string', format: 'password'})).to.equal('password');
    });

    it('returns boolean if boolean type', () => {
      expect(util.getCommonType({type: 'boolean'})).to.equal('boolean');
    });

    it('returns object if unrecognized type', () => {
      expect(util.getCommonType({type: 'thisIsUnrecognizeable'})).to.equal('object');
    });
  });

  describe('handlebarsHelpers', () => {
    it('exposes nbsp', () => {
      expect(util.handlebarsHelpers.nbsp()).to.equal(' ');
    });

    it('exposes exists', () => {
      expect(util.handlebarsHelpers.exists({foo: 'bar'}, 'foo')).to.equal(true);
    });
    
    it('exposes whitespace', () => {
      expect(util.handlebarsHelpers.whitespace()).to.equal('');
    });
    
    it('exposes eq', () => {
      expect(util.handlebarsHelpers.eq(1, 2)).to.equal(false);
    });
    
    it('exposes ne', () => {
      expect(util.handlebarsHelpers.ne(1, 2)).to.equal(true);
    });
    
    it('exposes lt', () => {
      expect(util.handlebarsHelpers.lt(1, 2)).to.equal(true);
    });
    
    it('exposes gt', () => {
      expect(util.handlebarsHelpers.gt(1, 2)).to.equal(false);
    });
    
    it('exposes lte', () => {
      expect(util.handlebarsHelpers.lte(1, 2)).to.equal(true);
    });
    
    it('exposes gte', () => {
      expect(util.handlebarsHelpers.gte(1, 2)).to.equal(false);
    });
    
    it('exposes and', () => {
      expect(util.handlebarsHelpers.and(true, false)).to.equal(false);
    });
    
    it('exposes or', () => {
      expect(util.handlebarsHelpers.or(false, true)).to.equal(true);
    });
    
    it('exposes camelCase', () => {
      expect(util.handlebarsHelpers.camelCase('str test')).to.equal('strTest');
    });
    
    it('exposes snakeCase', () => {
      expect(util.handlebarsHelpers.snakeCase('str test')).to.equal('str_test');
    });
    
    it('exposes upperSnakeCase', () => {
      expect(util.handlebarsHelpers.upperSnakeCase('str test')).to.equal('STR_TEST');
    });
    
    it('exposes capitalize', () => {
      expect(util.handlebarsHelpers.capitalize('str test')).to.equal('Str test');
    });
    
    it('exposes upperCase', () => {
      expect(util.handlebarsHelpers.upperCase('str test')).to.equal('STR TEST');
    });
    
    it('exposes lowerCase', () => {
      expect(util.handlebarsHelpers.lowerCase('str Test')).to.equal('str test');
    });

    it('exposes pascalCase', () => {
      expect(util.handlebarsHelpers.pascalCase('str test')).to.equal('StrTest');
    });
  });

  describe('removeUnusedModels', () => {
    it('should remove models which are not referenced by a $ref property', () => {
      const input = {
        paths: {
          "api/v1": {
            "responses": {
              "200": {
                "description": "Success",
                "schema": {
                  "$ref": "#/components/schemas/Bar"
                }
              }
            },
          }
        },
        components: {
          schemas: {
            Foo: {
              properties: {

              }
            },
            Bar: {
              properties: {
                foo: {
                  "$ref": "#/components/schemas/Foo"
                }
              }
            },
            Baz: {

            }
          }
        }
      }
      const expectedOutput = _.cloneDeep(input);
      delete expectedOutput.components.schemas.Baz
      util.removeUnusedModels(input)
      expect(input).to.deep.equal(expectedOutput);
    });
  })

  describe('getInputMediaTypes', () => {
    it('should return an empty list if requestBody.content is missing', () => {
      expect(util.getInputMediaTypes({})).to.be.empty;
      expect(util.getInputMediaTypes({requestBody: {}})).to.be.empty;
    });

    it('should return media types defined in requestBody.', () => {
      const input = {
        requestBody: {
          content: {
            'application/json': {},
            'text/xml': {},
          }
        }
      };
      const expectedOutput = Object.keys(input.requestBody.content);
      expect(util.getInputMediaTypes(input)).to.deep.equal(expectedOutput);
    });
  });

  describe('getOutputMediaTypes', () => {
    it('should return an empty list if method.responses is missing', () => {
      expect(util.getOutputMediaTypes({})).to.be.empty;
    });

    it('should return media types defined in method.responses', () => {
      const input = {
        responses: {
          '200': {
            content: {
              'application/json': {},
              'text/html': {},
            }
          }
        }
      };
      const expectedOutput = Object.keys(input.responses['200'].content);
      expect(util.getOutputMediaTypes(input)).to.deep.equal(expectedOutput);
    });
  });
});
