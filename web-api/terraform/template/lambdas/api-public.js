const awsServerlessExpress = require('@vendia/serverless-express');
const { app } = require('../../../src/app-public');
const server = awsServerlessExpress.createServer(app, undefined, [
  'application/json',
]);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
