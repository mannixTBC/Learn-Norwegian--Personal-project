import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

const sourceJsAsJsx = () => ({
  name: 'source-js-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (!/[\\/]src[\\/].*\.js$/.test(id)) return null;

    return transformWithOxc(code, id, { lang: 'jsx' });
  },
});

export default defineConfig({
  plugins: [sourceJsAsJsx(), react()],
  optimizeDeps: {
    noDiscovery: true,
    include: [
      '@supabase/supabase-js',
      '@material-ui/core',
      '@material-ui/icons',
      'prop-types',
      'react',
      'react-beautiful-dnd',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'styled-components',
    ],
  },
  server: {
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
