import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 🎯 CRITICAL: Tell Vite where your HTML and source code are located
  root: './task2/movie',
  envDir: '../../',
  build: {
    outDir: 'dist', // Output build files to a 'dist' folder outside 'movie'
  },
});