const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to backend
      },
    })
  );
  
  // Proxy for teacher routes
  app.use(
    '/teacher',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    })
  );
  
  // Proxy for /me endpoint
  app.use(
    '/me',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    })
  );
  
  // Proxy for weeks
  app.use(
    '/weeks',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    })
  );
};
