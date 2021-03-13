import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import dotenv from 'dotenv';

import { router as proxyRouter } from './proxy.js';

dotenv.config();

const {
  PORT: port = 3001,
} = process.env;

const app = express();
const path = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(path, '../index.html'));
});

app.use(express.static(join(path, '../public')));

app.use('/proxy', proxyRouter);

function notFoundHandler(req, res, next) {
  const title = 'Síða fannst ekki';
  res.status(404).send(title);
}

function errorHandler(req, res, next) {
  const title = 'Villa kom upp';
  res.status(500).send(title);
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
