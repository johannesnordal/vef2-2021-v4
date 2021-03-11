import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup, clearMarkers } from './lib/map';

function dataDescriptor(type, period) {
  let isType = `${type}+ á ricther`;

  if (type === 'all') {
    isType = 'Allir';
  } else if (type === 'significant') {
    isType = 'Verulegir';
  }

  let isPeriod;

  if (period === 'month') {
    isPeriod = 'seinasta mánuð';
  } else if (period === 'week') {
    isPeriod = 'seinustu viku';
  } else if (period === 'day') {
    isPeriod = 'seinasta dag';
  } else if (period === 'hour') {
    isPeriod = 'seinustu klukkustund';
  }

  return `${isType} jarðskjálftar ${isPeriod}`;
}

function cacheDescriptor(cacheInfo) {
  let cacheStatus = '';

  if (!cacheInfo.cached) {
    cacheStatus = 'ekki';
  }

  const info = `Gögn eru ${cacheStatus} í cache.
    Fyrirspurn tók ${cacheInfo.elapsed} sek.`;

  return info;
}

async function fetchAndRender(type, period) {
  const ul = document.querySelector('.earthquakes');

  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  document.querySelector('.cache').innerHTML = '';
  document.querySelector('.loading').innerHTML = 'Hleð gögnum...';

  const { earthquakes, cacheInfo } = await fetchEarthquakes(type, period);

  if (!earthquakes) {
    ul.appendChild(
      el('li', 'Villa við að sækja gögn'),
    );
  }

  document.querySelector('.loading').innerHTML = '';
  document.querySelector('h1').innerHTML = dataDescriptor(type, period);
  document.querySelector('.cache').innerHTML = cacheDescriptor(cacheInfo);

  clearMarkers();

  if (earthquakes.length === 0) {
    const li = el('li', 'Engir jarðskjálftar á þessu tímabili.');
    ul.appendChild(li);
    return;
  }

  earthquakes.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const map = document.querySelector('.map');
  init(map);

  const links = document.querySelectorAll('.nav a');

  links.forEach((link) => {
    const url = new URL(link.href);
    const { searchParams } = url;

    const type = searchParams.get('type');
    const period = searchParams.get('period');

    link.addEventListener('click', (e) => {
      e.preventDefault();
      fetchAndRender(type, period);
    });
  });
});
