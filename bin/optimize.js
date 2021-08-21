#!/usr/bin/env node

import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { ArrayBufferPool, defaultSparseSelectors, Packer } from 'roadroller';

const BUNDLE_PATH = join(process.cwd(), 'dist/main.js');
const TEMPLATE_PATH = join(process.cwd(), 'dist/index.html');

const data = readFileSync(BUNDLE_PATH, 'utf-8');

const selectors = defaultSparseSelectors();
const packer = new Packer([{ type: 'js', action: 'eval', data }], {
  sparseSelectors: selectors,
  maxMemoryMB: 150,
  arrayBufferPool: new ArrayBufferPool(),
});

packer.optimizeSparseSelectors();

const { firstLine, secondLine } = packer.makeDecoder();

writeFileSync(
  TEMPLATE_PATH,
  readFileSync(TEMPLATE_PATH, 'utf-8')
    .replace('<script defer="defer" src="main.js"></script>', '')
    .replace('<body>', `<body><script>${firstLine}\n${secondLine}</script>`)
);
