import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Quản Lý Trọ Việt - Rental Manager',
        short_name: 'Quản Lý Trọ',
        description: 'Hệ thống quản lý nhà trọ, kiot, ghi điện nước và tính tiền phòng cho iPhone',
        theme_color: '#0f172a', // Dark theme slate-900 làm màu chủ đạo
        background_color: '#0f172a',
        display: 'standalone', // Chạy độc lập, ẩn thanh công cụ Safari
        orientation: 'portrait', // Giới hạn màn hình dọc trên điện thoại
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
