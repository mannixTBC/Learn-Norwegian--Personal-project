const serverless = require('serverless-http');
const app = require('../../backend/app');
const { connectLambda } = require('@netlify/blobs');

const handle = serverless(app);
exports.handler = async (event, context) => {
  if (event.blobs) connectLambda(event);
  return handle(event, context);
};
