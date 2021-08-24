#!/usr/bin/env node

const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const { Packer } = require('roadroller');

const BUNDLE_PATH = join(process.cwd(), 'dist/main.js');
const TEMPLATE_PATH = join(process.cwd(), 'dist/index.html');

const data = readFileSync(BUNDLE_PATH, 'utf-8');

const packer = new Packer([{ type: 'js', action: 'eval', data }]);

packer.optimize().then(() => {
  const { firstLine, secondLine } = packer.makeDecoder();

  writeFileSync(
    TEMPLATE_PATH,
    readFileSync(TEMPLATE_PATH, 'utf-8')
      .replace('<script defer="defer" src="main.js"></script>', '')
      .replace('<body>', `<body><script>${firstLine}\n${secondLine}</script>`)
  );
});
