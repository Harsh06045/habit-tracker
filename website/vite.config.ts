import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    {
      name: 'serve-apk-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.toLowerCase().includes('.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="HabitFlow.apk"');
          }
          next();
        });
      },
    },
  ],
});
