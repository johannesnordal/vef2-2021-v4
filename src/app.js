import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import dotenv from 'dotenv';

import { router as proxyRouter } from './proxy.js';
import { catchErrors, notFoundHandler, errorHandler } from './error.js';

dotenv.config();

const {
  PORT: port = 3001,
} = process.env;

const app = express();
const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.use('/proxy', proxyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function index(req, res, next) {
  res.sendFile(join(path, '../index.html'));
}

app.get('/', catchErrors(index));

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
