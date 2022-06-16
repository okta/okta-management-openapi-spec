[![Build Status](https://www.travis-ci.com/okta/okta-management-openapi-spec.svg?branch=master&status=passed)](https://travis-ci.com/okta/okta-management-openapi-spec)


# Okta OpenAPI Specification (Management APIs)

- [Okta OpenAPI Specification (Management APIs)](#okta-openapi-specification-management-apis)
  - [Overview](#overview)
  - [NPM Artifact](#npm-artifact)
  - [Building the Spec](#building-the-spec)
  - [Maintaining the Spec](#maintaining-the-spec)
    - [Resources Folder](#resources-folder)
    - [Modifying the Spec](#modifying-the-spec)
    - [Submitting a Spec Change](#submitting-a-spec-change)
  - [Building An SDK](#building-an-sdk)
    - [Using The Generator](#using-the-generator)
    - [Creating Templates](#creating-templates)
    - [Template Models](#template-models)
      - ["operations"](#%22operations%22)
      - ["models"](#%22models%22)

## Overview

This repository contains:

- The official built version of the OpenAPI specification (`dist/spec.json` and `dist/spec.yaml`) that we use to build our Management SDKs.
- The spec file (`resources/spec.yaml`), that is used to generate the dist files.
- A code generator that will provide a translated OpenAPI data structure that is friendly for use with handlebars templates (you must provide the templates).


## NPM Artifact

A published NPM artifact is available to the public as [@okta/openapi](https://www.npmjs.com/package/@okta/openapi).

This artifact contains the final spec (`dist/spec.json`) and the code generator (`lib/` files).

## Building the Spec

[Node JS 10.16.0 or higher](https://nodejs.org/en/download/) is required.

To build `dist/spec.json`, do the following:

```
$ git clone git@github.com:okta/okta-management-openapi-spec.git
$ cd okta-management-openapi-spec
$ npm install
$ npm run build // a spec will be built to dist/spec.json
```

## Maintaining the Spec

### Resources Folder

The `resources/` folder contains the a single file which is used to build the spec:

- **spec.yaml** - Used to make the distributed spec files.


### Submitting a Spec Change

Update the spec in `resources/spec.yaml` that contains your changes and additions. When changes are done, run `yarn build` which will create the dist files. Create a PR that contains all the files you modified, AND the changes to the built `dist/spec.json` and `dist/spec.yaml`.  During review we want to verify that all changes have resulted in the correct spec.

## Building An SDK

All of our management SDKs must be built from this spec.

### Using The Generator

1. Install this module in your project directory:

```sh
npm install @okta/openapi
```

2. Run this script, telling it where your templates are, and where the output should go (use `-h` to get more info):

```sh
./node_modules/.bin/okta-sdk-generator -t templates/ -o .
```

### Creating Templates

For now, please use the Node SDK as a reference example:

https://github.com/okta/okta-sdk-nodejs/tree/master/templates

The important parts are:

* Exporting a `process` function in `index.js`.  The generator will call this with the original spec and template model (see below)
* Declaring which files are templates, and where they should be output as generated source code
* Providing helpers for handlebars, that you can use in your templates
* Using handlebars for the template files themselves
* The generator also provides some template helpers, see here: https://github.com/okta/okta-management-openapi-spec/blob/master/lib/generator.js#L233-L284

### Template Models

The generator passes the following objects to your exported `process` function:

```javascript
(spec, operations, models, handlebars)
```

* **spec** - The verbatim JSON spec, created by `npm bun build` above.
* **operations** - A re-format of the operations, made friendly for iterating in templates.  Example next.
* **models** - Ditto, but for resource models.  Example below.
* **handlebars** - The handlebars API, so you can register helpers.

They are a remix of the actual JSON spec, they are designed to be easy-to-use in your templates.  Here are examples:

#### "operations"

```javascript
[
    {
        "path": "/api/v1/apps",
        "method": "get",
        "queryParams": [
            {
                "in": "query",
                "name": "q",
                "type": "string"
            },
            {
                "description": "Specifies the pagination cursor for the next page of apps",
                "in": "query",
                "name": "after",
                "type": "string"
            },
            {
                "default": -1,
                "description": "Specifies the number of results for a page",
                "format": "int32",
                "in": "query",
                "name": "limit",
                "type": "integer"
            },
            {
                "default": false,
                "in": "query",
                "name": "includeNonDeleted",
                "type": "boolean"
            }
        ],
        "pathParams": [],
        "operationId": "listAppInstances",
        "description": "Enumerates apps added to your organization with pagination. A subset of apps can be returned that match a supported filter expression or query.",
        "summary": "List Applications",
        "tags": [
            "App"
        ],
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ],
        "responseModel": "PublicAppInstance",
        "isArray": true
    },
    {
        "path": "/api/v1/apps",
        "method": "post",
        "queryParams": [
            {
                "default": true,
                "description": "Executes activation lifecycle operation when creating the app",
                "in": "query",
                "name": "activate",
                "type": "boolean"
            }
        ],
        "pathParams": [],
        "operationId": "createAppInstance",
        "description": "Adds a new application to your Okta organization.",
        "summary": "Add Application",
        "tags": [
            "App"
        ],
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ],
        "bodyModel": "PublicAppInstance",
        "responseModel": "PublicAppInstance"
    },
    // ...
```

#### "models"

```javascript
[
  {
    "modelName": "Factor"
    "requiresResolution": true,
    "resolutionStrategy": {
      "propertyName": "factorType",
      "valueToModelMapping": {
        "sms": "SmsFactor",
        // ...
      }
    }
  },
  {
    "modelName": "SmsFactor"
    "extends": "Factor",
    // ...
  },{
    "modelName": "UserStatus",
    "enum": [
      "STAGED",
      "PROVISIONED",
      "ACTIVE",
      "RECOVERY",
      "PASSWORD_EXPIRED",
      "LOCKED_OUT",
      "DEPROVISIONED",
      "SUSPENDED"
    ],
    "tags": [
      "User"
    ]
  },
  {
    "modelName": "User",
    "properties": [{
        "readOnly": true,
        "propertyName": "_embedded",
        "commonType": "hash",
        "isHash": true,
        "model": "object"
      },
      {
        "readOnly": true,
        "propertyName": "_links",
        "commonType": "hash",
        "isHash": true,
        "model": "object"
      },
      {
        "readOnly": true,
        "propertyName": "created",
        "commonType": "dateTime"
      },
      {
        "readOnly": true,
        "propertyName": "id",
        "commonType": "string"
      },
      {
        "$ref": "#/definitions/UserProfile",
        "propertyName": "profile",
        "commonType": "object",
        "isObject": true,
        "model": "UserProfile"
      },
      {
        "$ref": "#/definitions/UserStatus",
        "readOnly": true,
        "propertyName": "status",
        "commonType": "enum",
        "isEnum": true,
        "model": "UserStatus"
      },
      {
        "$ref": "#/definitions/UserStatus",
        "readOnly": true,
        "propertyName": "transitioningToStatus",
        "commonType": "enum",
        "isEnum": true,
        "model": "UserStatus"
      }
    ],
    "methods": [{
        "alias": "listGroups",
        "arguments": [{
          "dest": "userId",
          "src": "id"
        }],
        "operation": {
          "path": "/api/v1/users/{userId}/groups",
          "method": "get",
          "queryParams": [{
              "in": "query",
              "name": "after",
              "type": "string"
            },
            {
              "default": -1,
              "format": "int32",
              "in": "query",
              "name": "limit",
              "type": "integer"
            }
          ],
          "pathParams": [{
            "in": "path",
            "name": "userId",
            "required": true,
            "type": "string"
          }],
          "operationId": "listUserGroups",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ],
          "responseModel": "UserGroup",
          "isArray": true
        }
      },
      {
        "alias": "activate",
        "arguments": [{
          "dest": "userId",
          "src": "id"
        }],
        "operation": {
          "path": "/api/v1/users/{userId}/lifecycle/activate",
          "method": "post",
          "queryParams": [{
            "default": true,
            "in": "query",
            "name": "sendEmail",
            "required": true,
            "type": "boolean"
          }],
          "pathParams": [{
            "in": "path",
            "name": "userId",
            "required": true,
            "type": "string"
          }],
          "operationId": "activateUser",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ],
          "responseModel": "ActivationToken"
        }
      },
      {
        "alias": "deactivate",
        "arguments": [{
          "dest": "userId",
          "src": "id"
        }],
        "operation": {
          "path": "/api/v1/users/{userId}/lifecycle/deactivate",
          "method": "post",
          "queryParams": [],
          "pathParams": [{
            "in": "path",
            "name": "userId",
            "required": true,
            "type": "string"
          }],
          "operationId": "lifecycleDeactivateUser",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ]
        }
      },
      {
        "alias": "addToGroup",
        "arguments": [{
          "dest": "userId",
          "src": "id"
        }],
        "operation": {
          "path": "/api/v1/groups/{groupId}/users/{userId}",
          "method": "put",
          "queryParams": [],
          "pathParams": [{
              "in": "path",
              "name": "groupId",
              "required": true,
              "type": "string"
            },
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "type": "string"
            }
          ],
          "operationId": "addUserToGroup",
          "tags": [
            "Group"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ]
        }
      }
    ],
    "crud": [{
        "alias": "create",
        "arguments": [{
          "dest": "body",
          "self": true
        }],
        "operation": {
          "path": "/api/v1/users",
          "method": "post",
          "queryParams": [{
            "default": true,
            "description": "Executes activation lifecycle operation when creating the user",
            "in": "query",
            "name": "activate",
            "type": "boolean"
          }],
          "pathParams": [],
          "operationId": "createUser",
          "description": "Creates a new user in your Okta organization with or without credentials.",
          "summary": "Create User",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ],
          "bodyModel": "InputUserWithGroupIds",
          "responseModel": "User"
        }
      },
      {
        "alias": "read",
        "arguments": [],
        "operation": {
          "path": "/api/v1/users/{userId}",
          "method": "get",
          "queryParams": [],
          "pathParams": [{
            "in": "path",
            "name": "userId",
            "required": true,
            "type": "string"
          }],
          "operationId": "getUser",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ],
          "responseModel": "User"
        }
      },
      {
        "alias": "update",
        "arguments": [{
            "dest": "userId",
            "src": "id"
          },
          {
            "dest": "body",
            "self": true
          }
        ],
        "operation": {
          "path": "/api/v1/users/{userId}",
          "method": "put",
          "queryParams": [],
          "pathParams": [{
            "in": "path",
            "name": "userId",
            "required": true,
            "type": "string"
          }],
          "operationId": "updateUser",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ],
          "bodyModel": "User",
          "responseModel": "User"
        }
      },
      {
        "alias": "delete",
        "arguments": [{
            "dest": "userId",
            "src": "id"
          },
          {
            "dest": "body",
            "self": true
          }
        ],
        "operation": {
          "path": "/api/v1/users/{userId}",
          "method": "delete",
          "queryParams": [],
          "pathParams": [{
            "in": "path",
            "name": "userId",
            "required": true,
            "type": "string"
          }],
          "operationId": "deactivateOrDeleteUser",
          "tags": [
            "User"
          ],
          "consumes": [
            "application/json"
          ],
          "produces": [
            "application/json"
          ]
        }
      }
    ],
    "tags": [
      "User"
    ]
  },
  // ...
]
```

### Okta-Specific OpenAPI Extensions

- `x-okta-extensible: true` - Add this to a model when the model is a generic key/value map that can be extended by the developer.  User profiles are an example

- `x-okta-multi-operation` - Allow to have multiple operations for a single API call. Publish Cert in applications is an example.  `/api/v1/apps/%v/credentials/csrs/%v/lifecycle/publish`

- `x-okta-request-headers` - Allow extra request headers that would be needed for an API call.  `/api/v1/users/me/lifecycle/delete_sessions` has an example of this.
