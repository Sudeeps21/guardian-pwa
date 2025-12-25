// Initial safe zone (origin position)
let safeCenter = [9.094060, 76.491953];
let safeRadius = 150;

// Path and movement
let path = [];
let moving = false;

// Dynamic connection mode
let currentMode = "Bluetooth (BLE)";
let wifiAvailable = true;

// Map setup
const map = L.map('map').setView(safeCenter, 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const marker = L.marker(safeCenter).addTo(map);
const polyline = L.polyline([], { color: '#38bdf8' }).addTo(map);
let circle = L.circle(safeCenter, { radius: safeRadius, color: '#22c55e' }).addTo(map);

// Haversine distance calculation
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Decide connection mode based on distance
function updateConnectionMode(distance) {
  if (distance <= 10) {
    currentMode = "Bluetooth (BLE)";
    wifiAvailable = true;
  } else if (distance <= 20) {
    currentMode = "Wi-Fi";
    wifiAvailable = true;
  } else {
    currentMode = "GPS";
  }

  // Simulate Wi-Fi loss after long distance
  if (distance > 50 && wifiAvailable) {
    wifiAvailable = false;
    setTimeout(() => {
      currentMode = "LoRa";
      document.getElementById('mode').innerText = currentMode;
    }, 5000);
  }

  document.getElementById('mode').innerText = currentMode;
}

function updateUI(lat, lon) {
  marker.setLatLng([lat, lon]);
  map.panTo([lat, lon]);

  path.push([lat, lon]);
  polyline.setLatLngs(path);

  const d = Math.round(haversine(lat, lon, safeCenter[0], safeCenter[1]));

  updateConnectionMode(d);

  document.getElementById('dist').innerText = d;
  document.getElementById('lat').innerText = lat.toFixed(5);
  document.getElementById('lon').innerText = lon.toFixed(5);

  const statusBox = document.getElementById('statusBox');
  if (d > safeRadius) {
    statusBox.innerText = 'STATUS: OUTSIDE SAFE ZONE';
    statusBox.className = 'status danger';
    circle.setStyle({ color: '#ef4444' });
  } else {
    statusBox.innerText = 'STATUS: SAFE ZONE';
    statusBox.className = 'status safe';
    circle.setStyle({ color: '#22c55e' });
  }
}

function simulateMovement() {
  if (!moving) return;

  const last = path.length ? path[path.length - 1] : safeCenter;

  // Gradually move away from origin
  const lat = last[0] + 0.00005;
  const lon = last[1] + 0.00005;

  updateUI(lat, lon);
  setTimeout(simulateMovement, 2000);
}

function toggleMovement() {
  moving = !moving;
  if (moving) simulateMovement();
}

// Safe radius slider
document.getElementById('radiusSlider').addEventListener('input', (e) => {
  safeRadius = parseInt(e.target.value);
  map.removeLayer(circle);
  circle = L.circle(safeCenter, { radius: safeRadius, color: '#22c55e' }).addTo(map);
});
