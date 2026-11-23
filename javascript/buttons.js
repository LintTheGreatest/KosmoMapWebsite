let placingPOI = false;

addPOI.addEventListener('click', () => {
  placingPOI = true;
});

viewport.addEventListener('click', (event) => {
  if (!placingPOI) return;

  const rect = viewport.getBoundingClientRect();
  const x = (event.clientX - rect.left - pointX) / scale;
  const y = (event.clientY - rect.top - pointY) / scale;

  const marker = document.createElement('span');
  marker.className = 'poi';
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  canvas.appendChild(marker);

  placingPOI = false;
});

