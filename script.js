document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Fetch IP and details from an API that supports HTTPS and CORS
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.error) {
            throw new Error(data.reason || "Failed to fetch IP details");
        }

        updateUI(data);
        saveAndShowHistory(data.ip);
        initMap(data.latitude, data.longitude, data.city);

    } catch (error) {
        console.error("Error fetching IP data:", error);
        document.getElementById('ip-display').textContent = "Error";
        document.getElementById('ip-display').classList.remove('skeleton-text');
        document.getElementById('isp-display').textContent = "Could not load connection details. Ad-blockers might block IP APIs.";
    }
}

function updateUI(data) {
    // Main IP
    const ipDisplay = document.getElementById('ip-display');
    ipDisplay.textContent = data.ip;
    ipDisplay.classList.remove('skeleton-text');

    // ISP
    document.getElementById('isp-display').textContent = data.org || data.asn || "Unknown Provider";

    // Details Grid
    const detailsContainer = document.getElementById('details-container');
    const details = [
        { label: "City", value: data.city },
        { label: "Region", value: data.region },
        { label: "Country", value: data.country_name },
        { label: "Postal Code", value: data.postal },
        { label: "Timezone", value: data.timezone },
        { label: "Currency", value: data.currency }
    ];

    let html = '';
    details.forEach(item => {
        if (item.value) {
            html += `
                <div class="detail-item">
                    <span class="detail-label">${item.label}</span>
                    <span class="detail-value">${item.value}</span>
                </div>
            `;
        }
    });
    detailsContainer.innerHTML = html;
}

function initMap(lat, lng, city) {
    const mapContainer = document.getElementById('map');
    mapContainer.classList.remove('skeleton-box');

    if (!lat || !lng) {
        mapContainer.innerHTML = "<p style='padding: 2rem; text-align:center; color: var(--text-secondary);'>Location data unavailable.</p>";
        return;
    }

    // Initialize Leaflet map
    const map = L.map('map').setView([lat, lng], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${city || "Your Location"}</b><br>Approximate based on IP.`)
        .openPopup();
}

function saveAndShowHistory(currentIp) {
    const cookieName = "ip_history";
    let history = [];

    // Parse existing cookie
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith(cookieName + "=")) {
            try {
                history = JSON.parse(decodeURIComponent(c.substring(cookieName.length + 1)));
            } catch (e) {
                console.error("Failed to parse cookie");
            }
            break;
        }
    }

    // Add current IP if not last in history
    if (history[history.length - 1] !== currentIp) {
        // Remove it if it exists elsewhere to move it to the end
        history = history.filter(ip => ip !== currentIp);
        history.push(currentIp);
        
        // Keep only last 10
        if (history.length > 10) {
            history.shift();
        }

        // Save cookie (1 year expiry)
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(history))};expires=${d.toUTCString()};path=/`;
    }

    // Render history
    const historyContainer = document.getElementById('history-container');
    if (history.length === 0) {
        historyContainer.innerHTML = "<span class='history-desc'>No history yet.</span>";
        return;
    }

    let html = '';
    // Reverse to show newest first
    [...history].reverse().forEach(ip => {
        const isCurrent = ip === currentIp;
        html += `<div class="history-badge ${isCurrent ? 'current' : ''}">
            ${isCurrent ? '<span style="color:var(--accent)">●</span> ' : ''}${ip}
        </div>`;
    });
    historyContainer.innerHTML = html;
}
