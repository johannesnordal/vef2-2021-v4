import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import dotenv from 'dotenv';

import { router as proxyRouter } from './proxy.js';

dotenv.config();

const {
  PORT: port = 3001, // Mun verða proxyað af browser-sync í development
} = process.env;

const app = express();
const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.use('/proxy', proxyRouter);

app.use('/', (req, res) => {
  res.sendFile(join(path, '../index.html'));
});

// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  console.error(err);
  res.status(404).send(`${err}`);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send(`${err}`);
}

// app.use(notFoundHandler);
// app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
