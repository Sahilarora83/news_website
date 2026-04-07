const apiPort = process.env.VITE_API_PORT || 3001;

export default {
  server: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
};
