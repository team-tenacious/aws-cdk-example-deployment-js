#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { ExampleStack } = require('../stack/example');
const app = new cdk.App();
new ExampleStack(app, 'ExampleStack');