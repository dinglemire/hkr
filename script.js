// script.js – Enhanced Error Handling + User Experience

let routeData = [];
const contentArea = document.getElementById('route-content');
const navigationContainer = document.getElementById('navigation');
const resetButton = document.getElementById('resetBtn');

// 1. Load Route Data
async function loadRouteData() {
    const jsonPath = './route_data.json';

    try {
        console.log('Attempting to load:', jsonPath);
        const response = await fetch(jsonPath, { cache: "no-cache" });

        if (!response.ok) {
            const isLocal = location.protocol === 'file:';
            throw new Error(`
                <strong>Failed to load route_data.json</strong><br><br>
                Status: ${response.status} ${response.statusText}<br><br>
                ${response.status === 404 
                    ? `File not found at: <code>${jsonPath}</code>`
                    : `Server error. Try refreshing the page.`}
                ${isLocal 
                    ? `<br><br><strong>Warning:</strong> You are opening the site directly from a file (file://).`
                    : ''}
            `);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.route)) {
            throw new Error(`<strong>Invalid JSON structure</strong>`);
        }

        routeData = data.route;
        console.log('Route data loaded successfully:', routeData.length, 'parts');
        initializeApp();

    } catch (error) {
        contentArea.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #2a1a1a; border: 2px solid #d9534f; margin: 2rem; border-radius: 8px;">
                <h1 style="color: #d9534f; margin-bottom: 1rem;">Error Loading Route Data</h1>
                <div style="color: #eee;">${error.message || error}</div>
            </div>
        `;
        console.error('Failed to load route data:', error);
    }
}

// 2. Core Rendering Functions
function renderNavigation() {
    if (navigationContainer.querySelector('#dynamic-links')) {
        navigationContainer.querySelector('#dynamic-links').remove();
    }

    const dynamicLinksDiv = document.createElement('div');
    dynamicLinksDiv.id = 'dynamic-links';

    const homeLink = document.createElement('a');
    homeLink.href = '#home';
    homeLink.textContent = 'Home';
    homeLink.classList.add('nav-link');
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderHome();
        history.pushState(null, '', '#home');
    });
    dynamicLinksDiv.appendChild(homeLink);

    routeData.forEach(part => {
        const link = document.createElement('a');
        link.href = `#${part.id}`;
        link.textContent = part.title.split(':')[0].trim();
        link.classList.add('nav-link');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            renderPart(part.id);
            history.pushState(null, '', `#${part.id}`);
        });
        dynamicLinksDiv.appendChild(link);
    });

    const mapLink = navigationContainer.querySelector('a[href="map.html"]');
    if (mapLink) {
        navigationContainer.insertBefore(dynamicLinksDiv, mapLink);
    } else {
        navigationContainer.prepend(dynamicLinksDiv);
    }
}

function renderHome() {
    contentArea.innerHTML = `
        <h1 style="text-align:center; margin-bottom: 1rem;">Hollow Knight 112% Route</h1>
        <p style="text-align:center; font-size: 1.2rem; opacity: 0.9;">
            Select a part from the navigation to begin tracking your run.
        </p>
    `;
    updateActiveNav(null);
}

function renderPart(partId) {
    const part = routeData.find(p => p.id === partId);
    if (!part) {
        contentArea.innerHTML = `<h2 style="color:#d9534f; text-align:center;">Part not found: ${partId}</h2>`;
        return;
    }

    let html = `<h1>${part.title}</h1>`;

    part.legs.forEach(leg => {
        html += `
            <div class="leg-section">
                <h3>${leg.title}</h3>
                <div class="checklist">
        `;

        // Loop through the mixed content (steps and images)
        leg.content.forEach(item => {
            if (item.type === 'step') {
                // Render Checklist Item
                const isChecked = localStorage.getItem(item.id) === 'true';
                const completedClass = isChecked ? 'completed' : '';
                html += `
                    <div class="checklist-item ${completedClass}">
                        <input type="checkbox" class="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
                        <span class="step-description">${item.text}</span>
                    </div>
                `;
            } else if (item.type === 'img') {
                // Render Image or HR separator
                if (item.src.includes('hr.png')) {
                    html += `<div style="width:100%; height:1px; background:#444; margin: 16px 0;"></div>`;
                } else {
                    html += `
                        <div class="image-gallery single-image">
                            <img src="${item.src}" alt="Route reference" loading="lazy">
                        </div>
                    `;
                }
            }
        });

        html += `   </div>
            </div>`; // End .checklist and .leg-section
    });

    contentArea.innerHTML = html;
    updateActiveNav(partId);

    // Re-attach checkbox listeners
    document.querySelectorAll('.checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
            const id = this.id;
            const checked = this.checked;
            localStorage.setItem(id, checked);
            this.closest('.checklist-item').classList.toggle('completed', checked);
        });
    });
}

function updateActiveNav(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        const isActive = activeId === null 
            ? link.href.includes('#home')
            : link.href.includes(`#${activeId}`);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
}

function setupResetButton() {
    resetButton.addEventListener('click', () => {
        if (confirm('Reset ALL 112% progress? This cannot be undone!')) {
            localStorage.clear();
            alert('Progress reset! Reloading current section...');
            const hash = location.hash.slice(1);
            if (hash && routeData.some(p => p.id === hash)) {
                renderPart(hash);
            } else {
                renderHome();
            }
        }
    });
}

function initializeApp() {
    renderNavigation();
    setupResetButton();

    const hash = location.hash.slice(1);
    if (hash && routeData.some(p => p.id === hash)) {
        renderPart(hash);
    } else {
        renderHome();
    }
}

window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (!hash || hash === 'home') {
        renderHome();
    } else if (routeData.some(p => p.id === hash)) {
        renderPart(hash);
    }
});

document.addEventListener('DOMContentLoaded', loadRouteData);