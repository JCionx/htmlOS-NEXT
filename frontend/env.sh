#!/bin/sh
set -e

# Build a small JS file that exposes runtime config to the page
cat > /usr/share/nginx/html/env-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_BACKEND_ADDRESS: "${VITE_BACKEND_ADDRESS:-}"
};
EOF

exec nginx -g 'daemon off;'
