import express from 'express';
import fetch from 'node-fetch';
import { cacheGet, cacheSet } from './cache.js';
import { timerStart, timerEnd } from './time.js';

export const router = express.Router();

const API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function getHostURL(query) {
  const {
    type,
    period,
  } = query;
  return new URL(`${type}_${period}.geojson`, API_URL);
}

async function fetchData(query) {
  // eslint-disable-next-line prefer-const
  let { fresh, data } = await cacheGet(query);

  if (fresh) {
    return { cached: true, data };
  }

  const hostURL = await getHostURL(query).href;

  let response;

  if (data) {
    response = await fetch(hostURL, {
      headers: { 'If-Modified-Since': data.lastModified },
    });
  } else {
    response = await fetch(hostURL);
  }

  if (response.status === 304) {
    return { cached: true, data };
  }

  data = await response.json();

  const [, maxAge] = response.headers.get('Cache-Control').split('max-age=');
  data.lastModified = response.headers.get('Last-Modified');

  await cacheSet(query, data, maxAge);

  return { cached: false, data };
}

async function getData(query) {
  const start = timerStart();

  const { cached, data } = await fetchData(query);

  const elapsed = timerEnd(start);

  return {
    data,
    info: {
      cached,
      elapsed,
    },
  };
}

async function main(req, res) {
  const query = {
    period: req.query.period,
    type: req.query.type,
  };

  const data = await getData(query);

  return res.json(data);
}

router.get('/', catchErrors(main));
