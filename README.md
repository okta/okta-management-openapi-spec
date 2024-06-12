*NOTE*:

This is the legacy branch saving the work done by Okta's former Developer
Experience team to maintain a Swagger OpenAPI specification used for language
SDK generation. These specs were maintained by hand and are not up to date or
being maintained with Okta's current APIs. Currently, the master branch and
releases are directly maintained with automation from the tooling Okta uses to
build the Okta service. The main branch and releases are currently in OpenAPI
3.0 format and have documentation maintained at
https://developer.okta.com/docs/api/ .

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Support](https://img.shields.io/badge/support-Developer%20Forum-blue.svg)](https://devforum.okta.com/)
[![npm version](https://img.shields.io/npm/v/@okta/openapi.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta)

# Okta OpenAPI Specification v3 (Management APIs)

- [Overview](#overview)
- [NPM Artifact](#npm-artifact)
- [Building An SDK](#building-an-sdk)

## Overview

This repository contains:

- The official built version of the OpenAPI specification v3 (`dist/spec.yaml`) that we use to build our Management SDKs.
- The spec files `resources/*.yaml` that would be used to generate `dist/spec.yaml`.

## NPM Artifact

A published NPM artifact would be available to the public as [@okta/openapi](https://www.npmjs.com/package/@okta/openapi).

## Building An SDK

All of our management SDKs must be built from this spec.

## Issues

If you notice any issues with the spec files while working with any of our management SDKs, please open a Github issue in the
corresponding management SDK repo, it would be triaged from there.
