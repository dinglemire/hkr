// script.js (Refined)

// 1. Data Fetching and Initialization
let routeData = [];
const contentArea = document.getElementById('route-content');
const navigationContainer = document.getElementById('navigation');
// Use the reset button as a reference point for dynamic link insertion
const resetButton = document.getElementById('resetBtn'); 

// Fetch data from JSON file
async function loadRouteData() {
    try {
        // Use a relative path to the JSON file
        const response = await fetch('./route_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        routeData = await response.json();
        initializeApp();
    } catch (error) {
        contentArea.innerHTML = `
            <h1 style="color: #d9534f;">Error Loading Route Data</h1>
            <p>Could not fetch <code>route_data.json</code>. Please ensure the file exists and is correctly formatted.</p>
        `;
        console.error('Error fetching data:', error);
    }
}

// 2. Core Rendering Functions
function renderNavigation() {
    // Check if links have already been generated (prevents duplication on re-render)
    if (navigationContainer.querySelector('#dynamic-links')) {
        navigationContainer.querySelector('#dynamic-links').remove();
    }

    const dynamicLinksDiv = document.createElement('div');
    dynamicLinksDiv.id = 'dynamic-links';

    // Create an "Home" link
    let homeLink = document.createElement('a');
    homeLink.href = '#home';
    homeLink.textContent = 'Home';
    homeLink.classList.add('nav-link');
    homeLink.addEventListener('click', () => renderHome());
    dynamicLinksDiv.appendChild(homeLink);

    // Create links for each part defined in the JSON
    routeData.forEach(part => {
        let link = document.createElement('a');
        link.href = `#${part.id}`;
        link.textContent = part.title.split(':')[0]; // E.g., just "Part 1"
        link.classList.add('nav-link');
        link.addEventListener('click', () => renderPart(part.id));
        dynamicLinksDiv.appendChild(link);
    });
    
    // Insert the dynamically created links before the map link/reset button
    navigationContainer.insertBefore(dynamicLinksDiv, navigationContainer.querySelector('a[href="map.html"]'));
}

function renderHome() {
    contentArea.innerHTML = `
        <h1 style="text-align:center;">Hollow Knight 112% Route</h1>
        <p style="text-align:center;">Select a part from the navigation to track your progress.</p>
    `;
    updateActiveNav(null);
}

function renderPart(partId) {
    const part = routeData.find(p => p.id === partId);
    if (!part) return;

    let html = `<h1>${part.title}</h1>`;

    part.legs.forEach(leg => {
        html += `
            <div class="leg">
                <h3>${leg.title}</h3>
        `;
        
        // Generate checklist steps for this leg
        leg.steps.forEach(step => {
            const isChecked = localStorage.getItem(step.id) === 'true';
            // Use the global function defined below
            html += `
                <label>
                    ${step.description} 
                    <input type="checkbox" id="${step.id}" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem('${step.id}', this.checked)">
                </label>
            `;
        });

        // Add images for this leg
        leg.images.forEach(imgSrc => {
            html += `<img src="${imgSrc}" alt="${leg.title} image" />`;
        });

        html += '</div>';
    });

    contentArea.innerHTML = html;
    updateActiveNav(partId);
}

function updateActiveNav(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.href.includes(activeId)) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// 3. LocalStorage and Event Handling (Global function)
// This function must be globally accessible because it's called from onchange events in dynamic HTML
window.toggleChecklistItem = (id, isChecked) => {
    localStorage.setItem(id, isChecked ? 'true' : 'false');
};

function setupResetButton() {
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset ALL 112% progress? This cannot be undone.')) {
            localStorage.clear();
            
            // Determine which view to re-render
            const currentHash = window.location.hash.substring(1);
            if (currentHash && routeData.some(p => p.id === currentHash)) {
                renderPart(currentHash);
            } else {
                renderHome();
            }
            alert('Checklist reset.');
        }
    });
}

// 4. Application Startup
function initializeApp() {
    renderNavigation();
    setupResetButton();
    
    // Check for a specific part in the URL hash (e.g., /#part1)
    const initialHash = window.location.hash.substring(1);
    if (initialHash && routeData.some(p => p.id === initialHash)) {
        renderPart(initialHash);
    } else {
        renderHome();
    }
}

// Start the process
document.addEventListener('DOMContentLoaded', loadRouteData);
