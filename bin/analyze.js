#!/usr/bin/env node

const { explore } = require('source-map-explorer');
const { join } = require('path');

const EXCLUDE = ['three'];
const LIMIT = 1024 * 13;
const DIST_DIR = join(process.cwd(), 'dist');

explore(join(DIST_DIR, 'main.js'), { gzip: true, output: { format: 'json' } }).then(
  ({ bundles }) => {
    let total = 0;

    Object.entries(bundles[0].files).forEach(([path, { size }]) => {
      const relativePath = path.replace(/(.*)(?=src|node_modules)/, '');

      if (!new RegExp(`^\\[|node_modules/(${EXCLUDE.join('|')})`).test(relativePath)) {
        total += size;

        console.info(relativePath, size);
      }
    });

    console.info('Total', total);
    console.info('Limit', LIMIT);
  }
);
