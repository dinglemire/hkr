// script.js – Single Page Version

let routeData = [];
const contentArea = document.getElementById('route-content');
const navigationContainer = document.getElementById('navigation');
const resetButton = document.getElementById('resetBtn');

// 1. Load Route Data
async function loadRouteData() {
    const jsonPath = './route_data.json';

    try {
        const response = await fetch(jsonPath, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        routeData = data.route;
        
        // Initialize
        renderNavigation();
        renderFullRoute(); // <-- This renders EVERYTHING at once
        setupResetButton();
        setupScrollSpy();  // <-- New feature: highlight nav based on scroll

        // Handle initial hash (e.g. loading page with #part3)
        if (location.hash) {
            setTimeout(() => {
                const target = document.querySelector(location.hash);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

    } catch (error) {
        contentArea.innerHTML = `<h2 style="color:red; text-align:center">Error loading data: ${error.message}</h2>`;
        console.error(error);
    }
}

// 2. Render Navigation (Anchor Links)
function renderNavigation() {
    if (navigationContainer.querySelector('#dynamic-links')) {
        navigationContainer.querySelector('#dynamic-links').remove();
    }

    const dynamicLinksDiv = document.createElement('div');
    dynamicLinksDiv.id = 'dynamic-links';

    routeData.forEach(part => {
        const link = document.createElement('a');
        link.href = `#${part.id}`; // Links to ID on same page
        link.textContent = part.title.split(':')[0].trim(); // "Part 1", "Part 2"
        link.classList.add('nav-link');
        
        // Smooth scroll event
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = part.id;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, '', `#${targetId}`);
            }
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

// 3. Render EVERYTHING (The Long List)
function renderFullRoute() {
    let html = '';

    routeData.forEach(part => {
        // Create a section for each Part
        html += `<section id="${part.id}" class="route-part-section">`;
        html += `<h1 class="part-title">${part.title}</h1>`;

        part.legs.forEach(leg => {
            html += `
                <div class="leg-section">
                    <h3>${leg.title}</h3>
                    <div class="checklist">
            `;

            // Render mixed content (Steps + Images)
            leg.content.forEach(item => {
                if (item.type === 'step') {
                    const isChecked = localStorage.getItem(item.id) === 'true';
                    const completedClass = isChecked ? 'completed' : '';
                    html += `
                        <div class="checklist-item ${completedClass}">
                            <input type="checkbox" class="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
                            <span class="step-description">${item.text}</span>
                        </div>
                    `;
                } else if (item.type === 'img') {
                    if (item.src.includes('hr.png')) {
                        html += `<div class="hr-divider"></div>`;
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
                </div>`; // End leg
        });

        html += `</section>`; // End part
    });

    contentArea.innerHTML = html;

    // Attach Checkbox Logic
    document.querySelectorAll('.checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
            localStorage.setItem(this.id, this.checked);
            this.closest('.checklist-item').classList.toggle('completed', this.checked);
        });
    });
}

// 4. Scroll Spy (Highlights the active button in the menu)
function setupScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                // Remove active class from all links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.setAttribute('aria-current', 'false');
                    link.classList.remove('active-nav');
                });
                // Add to current
                const activeLink = document.querySelector(`a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.setAttribute('aria-current', 'page');
                    activeLink.classList.add('active-nav');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px' // Triggers when section is near top of screen
    });

    document.querySelectorAll('section.route-part-section').forEach(section => {
        observer.observe(section);
    });
}

// 5. Reset Button
function setupResetButton() {
    resetButton.addEventListener('click', () => {
        if (confirm('Reset ALL 112% progress?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', loadRouteData);
