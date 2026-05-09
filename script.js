document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        let ipv4 = null;
        let ipv6 = null;
        let mainData = null;

        // Try getting IPv4
        try {
            const res4 = await fetch('https://api.ipify.org?format=json');
            const data4 = await res4.json();
            ipv4 = data4.ip;
        } catch (e) {
            console.log("IPv4 blocked or unavailable");
        }

        // Try getting IPv6
        try {
            const res6 = await fetch('https://api6.ipify.org?format=json');
            const data6 = await res6.json();
            ipv6 = data6.ip;
        } catch (e) {
            console.log("IPv6 not available");
        }

        // Fetch details for whichever IP we can get (ipapi uses the preferred one)
        const response = await fetch('https://ipapi.co/json/');
        mainData = await response.json();

        if (mainData.error) {
            throw new Error(mainData.reason || "Failed to fetch IP details");
        }

        // Fallbacks if ipify failed but ipapi succeeded
        let currentIp = mainData.ip;
        if (currentIp.includes(':') && !ipv6) ipv6 = currentIp;
        if (!currentIp.includes(':') && !ipv4) ipv4 = currentIp;

        updateUI(mainData, ipv4, ipv6);
        saveAndShowHistory(currentIp); // Save the preferred connection IP
        initMap(mainData.latitude, mainData.longitude, mainData.city);

    } catch (error) {
        console.error("Error fetching IP data:", error);
        if(document.getElementById('ipv4-wrapper')) {
            document.getElementById('ipv4-wrapper').style.display = 'flex';
            document.getElementById('ipv4-display').textContent = "Error";
            document.getElementById('ipv4-display').classList.remove('skeleton-text');
            document.getElementById('isp-display').textContent = "Could not load connection details. Ad-blockers might block IP APIs.";
        }
    }
}

function updateUI(data, ipv4, ipv6) {
    // Main IPs
    if (ipv4) {
        document.getElementById('ipv4-wrapper').style.display = 'flex';
        const v4Disp = document.getElementById('ipv4-display');
        v4Disp.textContent = ipv4;
        v4Disp.classList.remove('skeleton-text');
    }
    if (ipv6) {
        document.getElementById('ipv6-wrapper').style.display = 'flex';
        const v6Disp = document.getElementById('ipv6-display');
        v6Disp.textContent = ipv6;
        v6Disp.classList.remove('skeleton-text');
    }

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
