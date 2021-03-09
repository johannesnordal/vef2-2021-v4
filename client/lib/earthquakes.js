const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';

export async function fetchEarthquakes(type = null, period = null) {
  // TODO sækja gögn frá proxy þjónustu

  let result;

  try {
    result = await fetch(URL, { 'Access-Control-Allow-Origin': 'http://127.0.0.1:3000' });
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return data.features;
}
