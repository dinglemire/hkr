// silksong_script.js

let routeData = [];
const contentArea = document.getElementById('route-content');
const navigationContainer = document.getElementById('navigation');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// 1. Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    setupEyeToggle();
    loadRouteData();
});

async function loadRouteData() {
    const jsonPath = 'src/ss/silksong_data.json'; 

    try {
        const response = await fetch(jsonPath, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        routeData = data.route;
        
        renderNavigation();
        renderFullRoute();
        
        setupGlobalEventListeners();
        setupResetButton();
        setupResumeButton();
        setupMapModal();
        setupScrollSpy();
        updateProgressBar();
        
        if (localStorage.getItem('ssHideCompleted') === 'true') {
            checkAndCollapseLegs(true);
        }

        setTimeout(() => { jumpToProgress(); }, 100);

    } catch (error) {
        contentArea.innerHTML = `<h2 style="color:red; text-align:center">Error: ${error.message}</h2>`;
    }
}

// 2. Theme Manager (Pharloom vs Steam)
function setupTheme() {
    const btnTheme = document.getElementById('btnThemeToggle');
    if(!btnTheme) return;

    // Check saved theme. If it was 'theme-light' (old), force 'theme-steam'
    let savedTheme = localStorage.getItem('ssTheme');
    if (savedTheme === 'theme-light' || !savedTheme) {
        savedTheme = 'theme-pharloom'; // Default
    }
    
    updateThemeUI(savedTheme);

    btnTheme.addEventListener('click', () => {
        // Toggle logic
        const current = document.body.classList.contains('theme-steam') ? 'theme-steam' : 'theme-pharloom';
        const newTheme = (current === 'theme-pharloom') ? 'theme-steam' : 'theme-pharloom';
        updateThemeUI(newTheme);
    });

    function updateThemeUI(themeName) {
        const isHidden = document.body.classList.contains('hide-completed');
        
        // Clean all potential theme classes
        document.body.classList.remove('theme-pharloom', 'theme-steam', 'theme-light');
        document.body.classList.add(themeName);

        if(isHidden) document.body.classList.add('hide-completed');

        localStorage.setItem('ssTheme', themeName);

        if (themeName === 'theme-pharloom') {
            btnTheme.textContent = '🎮'; 
            btnTheme.title = "Switch to Steam Theme (Blue/Black)";
        } else {
            btnTheme.textContent = '🧶';
            btnTheme.title = "Switch to Pharloom Theme (Red/Black)";
        }
    }
}

// 3. Eye Toggle
function setupEyeToggle() {
    const btnEye = document.getElementById('btnEyeToggle');
    if(!btnEye) return;

    const isHidden = localStorage.getItem('ssHideCompleted') === 'true';
    if(isHidden) document.body.classList.add('hide-completed');
    updateEyeIcon(isHidden);

    btnEye.addEventListener('click', () => {
        const currentlyHidden = document.body.classList.contains('hide-completed');
        const newState = !currentlyHidden;
        
        if(newState) {
            document.body.classList.add('hide-completed');
            checkAndCollapseLegs(true);
        } else {
            document.body.classList.remove('hide-completed');
            checkAndCollapseLegs(false);
        }
        
        localStorage.setItem('ssHideCompleted', newState);
        updateEyeIcon(newState);
    });

    function updateEyeIcon(hidden) {
        btnEye.textContent = hidden ? '🔒' : '👁️';
        btnEye.title = hidden ? "Auto-Collapse is ON" : "Auto-Collapse is OFF";
    }
}

function checkAndCollapseLegs(shouldCollapse) {
    const legs = document.querySelectorAll('.leg-section');
    legs.forEach(leg => {
        if (!shouldCollapse) {
            leg.classList.remove('collapsed');
            return;
        }
        const allBoxes = leg.querySelectorAll('.checkbox');
        const checkedBoxes = leg.querySelectorAll('.checkbox:checked');
        if (allBoxes.length > 0 && allBoxes.length === checkedBoxes.length) {
            leg.classList.add('collapsed');
        }
    });
}

// 4. Navigation Render
function renderNavigation() {
    const existingLinks = document.getElementById('dynamic-links');
    if (existingLinks) existingLinks.remove();

    const dynamicLinksDiv = document.createElement('div');
    dynamicLinksDiv.id = 'dynamic-links';

    routeData.forEach(part => {
        const link = document.createElement('a');
        link.href = `#${part.id}`;
        link.textContent = part.title.split(':')[0].trim();
        link.classList.add('nav-link');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(part.id);
            if (target) {
                const offset = window.innerWidth < 1280 ? -180 : -20;
                const y = target.getBoundingClientRect().top + window.pageYOffset + offset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        });
        dynamicLinksDiv.appendChild(link);
    });

    const actionsContainer = document.querySelector('.nav-actions');
    if (actionsContainer && actionsContainer.parentNode === navigationContainer) {
        navigationContainer.insertBefore(dynamicLinksDiv, actionsContainer);
    } else {
        navigationContainer.prepend(dynamicLinksDiv);
    }
}

// 5. Content Render
function renderFullRoute() {
    let html = '';
    routeData.forEach(part => {
        html += `<section id="${part.id}" class="route-part-section">`;
        html += `<h1 class="part-title">${part.title}</h1>`;
        part.legs.forEach(leg => {
            html += `<div class="leg-section">
                        <h3 onclick="this.parentElement.classList.toggle('collapsed')">${leg.title}</h3>
                        <div class="checklist">`;
            leg.content.forEach(item => {
                if (item.type === 'step') {
                    const isChecked = localStorage.getItem(item.id) === 'true';
                    html += `
                        <div class="checklist-item ${isChecked ? 'completed' : ''}" id="row-${item.id}">
                            <input type="checkbox" class="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
                            <span class="step-description">${item.text}</span>
                        </div>
                    `;
                } else if (item.type === 'img') {
                    if (item.src.includes('hr.png')) html += `<div class="hr-divider"></div>`;
                    else html += `<div class="image-gallery"><img src="${item.src}" loading="lazy"></div>`;
                } else if (item.type === 'note') {
                    html += `<div class="route-note">${item.text}</div>`;
                }
            });
            html += `</div></div>`;
        });
        html += `</section>`;
    });
    contentArea.innerHTML = html;
}

// 6. Event Listeners
function setupGlobalEventListeners() {
    contentArea.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox')) {
            const cb = e.target;
            const row = cb.closest('.checklist-item');
            localStorage.setItem(cb.id, cb.checked);
            
            if (cb.checked) row.classList.add('completed');
            else row.classList.remove('completed');
            
            updateProgressBar();

            if (document.body.classList.contains('hide-completed')) {
                const leg = row.closest('.leg-section');
                if(leg) {
                    const all = leg.querySelectorAll('.checkbox');
                    const checked = leg.querySelectorAll('.checkbox:checked');
                    if (all.length === checked.length) leg.classList.add('collapsed');
                }
            }
        }
    });
}

function updateProgressBar() {
    const all = document.querySelectorAll('.checkbox');
    const checked = document.querySelectorAll('.checkbox:checked');
    if (all.length === 0) return;
    const percent = Math.round((checked.length / all.length) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% Completed`;
}

// 7. Map Modal
function setupMapModal() {
    const modal = document.getElementById("mapModal");
    const openBtn = document.getElementById("btnMapIcon");
    const closeBtn = document.getElementById("closeMapBtn");
    const viewport = document.getElementById("mapViewport");
    
    const wrapper = document.getElementById("mapWrapper"); 
    const mapImg = document.getElementById("mapImage");
    
    // Example Map Data (You can expand this later)
    const mapMarkers = [
        { x: 45.5, y: 30.2, title: "Moss Grotto Bench", type: "bench" },
        { x: 12.5, y: 60.1, title: "Moss Mother", type: "boss" }
    ];

    let scale = 0.5, pointX = 0, pointY = 0;
    let isDragging = false, startX = 0, startY = 0;

    function renderPins() {
        const container = document.getElementById('mapWrapper'); 
        // Note: We append to wrapper, but we need to clear OLD pins first.
        // Since wrapper contains IMG, we select only elements with class .map-pin
        const oldPins = wrapper.querySelectorAll('.map-pin');
        oldPins.forEach(p => p.remove());

        mapMarkers.forEach(marker => {
            const pin = document.createElement('div');
            pin.className = `map-pin pin-${marker.type}`;
            pin.style.left = `${marker.x}%`;
            pin.style.top = `${marker.y}%`;

            const tip = document.createElement('div');
            tip.className = 'map-tooltip';
            tip.innerText = marker.title;
            pin.appendChild(tip);

            wrapper.appendChild(pin);
        });
    }

    function updateTransform() {
        if(wrapper) wrapper.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    if (openBtn) openBtn.addEventListener("click", () => {
        modal.style.display = "block";
        renderPins();
        updateTransform();
    });
    if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");

    if (viewport) {
        viewport.addEventListener("mousedown", (e) => {
            e.preventDefault(); isDragging = true;
            startX = e.clientX - pointX; startY = e.clientY - pointY;
            viewport.style.cursor = "grabbing";
        });
        window.addEventListener("mouseup", () => { isDragging = false; if(viewport) viewport.style.cursor = "grab"; });
        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return; e.preventDefault();
            pointX = e.clientX - startX; pointY = e.clientY - startY;
            updateTransform();
        });
        
        viewport.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.1;
            scale = Math.min(Math.max(0.1, scale + delta), 4);
            updateTransform();
        });
    }
}

// 8. Resume
function jumpToProgress() {
    const unchecked = document.querySelector('.checkbox:not(:checked)');
    if (unchecked) {
        const row = unchecked.closest('.checklist-item');
        const leg = row.closest('.leg-section');
        if(leg && leg.classList.contains('collapsed')) leg.classList.remove('collapsed');
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.remove('row-highlight');
        void row.offsetWidth; 
        row.classList.add('row-highlight');
    }
}

function setupResumeButton() {
    const btn = document.getElementById('resumeBtn');
    if (!btn) return;
    btn.addEventListener('click', jumpToProgress);
}

function setupScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-nav'));
                const active = document.querySelector(`a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active-nav');
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('section.route-part-section').forEach(s => observer.observe(s));
}

function setupResetButton() {
    const btn = document.getElementById('resetBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (confirm('Reset ALL Silksong progress?')) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('ss_') || key.startsWith('ssTheme') || key.startsWith('ssHide')) {
                    localStorage.removeItem(key);
                }
            });
            location.reload();
        }
    });
}
