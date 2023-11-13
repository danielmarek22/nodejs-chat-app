import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig ({
  plugins: [ react () ] ,
  server: {
    proxy: {
      "/api" : {
        target: " http: // localhost:8080 " ,
    } ,
  '/stream/': {
    target: ' ws: // localhost:8080 ' ,
    ws: true ,
    } ,
  } ,
},
}) ;