import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
//import { VitePWA } from "vite-plugin-pwa";
//import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //VitePWA({ registerType: "autoUpdate" }),
    //basicSsl()
  ],
  base: "./",
  //server: {
  //  https: true,
  //},
});
