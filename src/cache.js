import util from 'util';
import redis from 'redis';

// Þetta verður lesið úr .env síðar meir.
const REDIS_URL = 'redis://127.0.0.1:6379/0';

let client;

if (REDIS_URL) {
  client = redis.createClient({ url: REDIS_URL });
}

const asyncGet = util.promisify(client.get).bind(client);
const asyncSet = util.promisify(client.set).bind(client);

function genKey(queryParams) {
  return `${queryParams.period}:${queryParams.type}`;
}

export async function cacheGet(queryParams) {

  const cacheKey = genKey(queryParams);

  if (!client || !asyncGet) {
    return false;
  }

  let fresh, cached;
  try {
    fresh = await asyncGet(`${cacheKey}:age`);
    cached = await asyncGet(`${cacheKey}:data`);
  } catch (e) {
    console.warn(`Error: ${e.message}`);
    return false;
  }

  if (!cached) {
    return false;
  }

  let data;
  try {
    data = JSON.parse(cached);
  } catch (e) {
    console.warn(`Warning: ${e.message}`);
    return false;
  }

  return {
    fresh,
    data,
  };
}

export async function cacheSet(queryParams, data, ttl) {

  const cacheKey = genKey(queryParams);

  if (!client || !asyncSet) {
    return false;
  }

  try {
    const serializedData = JSON.stringify(data);
    await asyncSet(`${cacheKey}:data`, serializedData);
    await asyncSet(`${cacheKey}:age`, 1, 'EX', ttl);
  } catch (e) {
    console.warn(`Couldn't cache data, key: ${cacheKey}, warning: ${e.message}`);
    return false;
  }

  return true;
}

export async function cacheQuit() {
  client.quit();
}
