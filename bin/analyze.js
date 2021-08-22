#!/usr/bin/env node

const { explore } = require('source-map-explorer');
const { join } = require('path');
const { statSync } = require('fs');

const DIST_DIR = join(process.cwd(), 'dist');

const BUNDLE_SIZE = statSync(join(DIST_DIR, 'index.html')).size;
const LIMIT = 1024 * 13;

explore(join(DIST_DIR, 'main.js'), { gzip: true, output: { format: 'json' } }).then(
  ({ bundles }) => {
    Object.entries(bundles[0].files).forEach(([path, { size }]) => {
      if (!path.startsWith('[') && !path.includes('THREE')) {
        const relativePath = path.replace(/(.*)(?=src|node_modules)/, '');
        console.info(relativePath, size);
      }
    });

    console.info('Total', BUNDLE_SIZE);
    console.info('Limit', LIMIT);
  }
);
