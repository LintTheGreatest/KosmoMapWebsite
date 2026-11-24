const addPOIButton = document.getElementById('addPOI');
const poiStatus = document.getElementById('poiStatus');
const supabase = window.KOSMO_SUPABASE;
const supabaseUrl = supabase?.url?.replace(/\/$/, '');
const supabaseKey = supabase?.anonKey;
const poisEndpoint = supabaseUrl ? `${supabaseUrl}/rest/v1/pois` : null;
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('YOUR-PROJECT') &&
  !supabaseKey.includes('YOUR_SUPABASE')
);

let placingPOI = false;

function setPOIStatus(message) {
  poiStatus.textContent = message;
}

function requestHeaders(extraHeaders = {}) {
  const headers = {
    apikey: supabaseKey,
    ...extraHeaders
  };

  // Legacy anon keys are JWTs and also use Authorization; publishable keys
  // (sb_publishable_...) must only be sent as an apikey.
  if (supabaseKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

  return headers;
}

function renderPOI(poi) {
  const marker = document.createElement('span');
  marker.className = 'poi';
  marker.style.left = `${poi.x}px`;
  marker.style.top = `${poi.y}px`;
  marker.title = `POI ${poi.id}`;
  canvas.appendChild(marker);
}

async function loadPOIs() {
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const url = new URL(poisEndpoint);
    url.searchParams.set('select', 'id,x,y');
    url.searchParams.set('order', 'id.asc');
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));

    const response = await fetch(url, { headers: requestHeaders() });
    if (!response.ok) {
      throw new Error(`Loading POIs failed (${response.status}).`);
    }

    const pois = await response.json();
    pois.forEach(renderPOI);
    offset += pois.length;

    if (pois.length < pageSize) break;
  }
}

async function savePOI(x, y) {
  const response = await fetch(poisEndpoint, {
    method: 'POST',
    headers: requestHeaders({
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }),
    body: JSON.stringify({ x, y })
  });

  if (!response.ok) {
    throw new Error(`Saving POI failed (${response.status}).`);
  }

  const [savedPOI] = await response.json();
  renderPOI(savedPOI);
}

addPOIButton.addEventListener('click', () => {
  placingPOI = true;
  setPOIStatus('Click the map to place a POI.');
});

viewport.addEventListener('click', async (event) => {
  if (!placingPOI) return;

  const rect = viewport.getBoundingClientRect();
  const x = (event.clientX - rect.left - pointX) / scale;
  const y = (event.clientY - rect.top - pointY) / scale;

  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > 100000 || y > 100000) {
    setPOIStatus('Choose a point on the map.');
    return;
  }

  placingPOI = false;
  setPOIStatus('Saving POI…');

  try {
    await savePOI(x, y);
    setPOIStatus('POI saved and shared.');
  } catch (error) {
    console.error(error);
    setPOIStatus('Could not save POI. Check the Supabase setup and try again.');
  }
});

if (!isConfigured) {
  addPOIButton.disabled = true;
  setPOIStatus('Add your Supabase URL and anon key in supabase-config.js.');
} else {
  setPOIStatus('Loading shared POIs…');
  loadPOIs()
    .then(() => setPOIStatus('Shared POIs loaded.'))
    .catch((error) => {
      console.error(error);
      setPOIStatus('Could not load POIs. Check the Supabase setup.');
    });
}

