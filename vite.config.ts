import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Sourcemap: tắt trong production để giảm bundle size
    sourcemap: false,
    
    // Minification: sử dụng esbuild (mặc định, nhanh hơn terser)
    minify: 'esbuild',
    
    // Target browsers để optimize code
    target: 'es2015',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Rollup options cho code splitting
    rollupOptions: {
      output: {
        // Manual chunks: tách vendor code để tối ưu caching
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': ['react-hot-toast', 'react-icons'],
          
          // Chart libraries
          'chart-vendor': ['react-chartjs-2', '@kurkle/color'],
          
          // Utilities
          'utils-vendor': ['axios', 'dompurify'],
        },
        
        // Naming pattern cho chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Optimize CSS
    cssMinify: true,
  },
});
