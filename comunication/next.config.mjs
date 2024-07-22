module.exports = {
    async headers() {
      return [
        {
          // This will apply these headers to all routes in your application.
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store',
            },
          ],
        },
      ]
    },
    // Other Next.js configurations can go here
  };
  