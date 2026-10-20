// Exercise the Express middleware and routes without a listening TCP socket.
// The same serverless adapter is used by the deployed API.
const serverless = require('serverless-http');
const inProcessFetch = (app) => {
  const handler = serverless(app);
  return async (url, options = {}) => {
    const target = new URL(url, 'http://127.0.0.1');
    const result = await handler({
      httpMethod: options.method || 'GET', path: target.pathname,
      headers: Object.fromEntries(new Headers(options.headers || {}).entries()),
      queryStringParameters: Object.fromEntries(target.searchParams),
      body: options.body || null, isBase64Encoded: false,
      requestContext: { identity: { sourceIp: '127.0.0.1' } },
    }, {});
    return new Response(result.body || null, { status: result.statusCode, headers: result.headers });
  };
};
module.exports = { inProcessFetch };
