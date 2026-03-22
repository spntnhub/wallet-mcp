// Copy openapi.yaml to dist after build
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, 'openapi.yaml');
const dest = path.resolve(__dirname, 'dist/openapi.yaml');

fs.copyFileSync(src, dest);
console.log('Copied openapi.yaml to dist/');
