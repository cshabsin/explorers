import { defineConfig } from 'vite'

export default defineConfig({
  base: '/explorers/',
  build: {
    rollupOptions: {
      // One entry per HTML page; paths are relative to the project root.
      input: {
        main: 'index.html',
        timeline: 'timeline/index.html',
      },
    },
  },
})
