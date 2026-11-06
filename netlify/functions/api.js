const serverless = require('serverless-http');
const app = require('../../backend/app');
const { connectLambda } = require('@netlify/blobs');

const handle = serverless(app, { binary: ['audio/*', 'application/octet-stream'] });
exports.handler = async (event, context) => {
  if (event.blobs) connectLambda(event);
  return handle(event, context);
};
