import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5037",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // If the file is in node_modules, put it in the 'vendor' chunk
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    // Since we are grouping all vendors, the chunk will be > 500kB.
    // We increase the limit to 1500kB to stop the warning.
    chunkSizeWarningLimit: 1500,
  },
});
