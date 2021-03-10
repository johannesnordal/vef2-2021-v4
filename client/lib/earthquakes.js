export async function fetchEarthquakes(type = 'significant', period = 'week') {
  const url = new URL('/proxy', window.location);

  if (type) {
    url.searchParams.append('type', type);
  }

  if (period) {
    url.searchParams.append('period', period);
  }

  let result;

  try {
    result = await fetch(url.href);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return {
    earthquakes: data.data.features,
    cacheInfo: data.info,
  };
}
