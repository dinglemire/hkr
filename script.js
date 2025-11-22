let routeData = [];
const contentArea = document.getElementById('route-content');
const navigationContainer = document.getElementById('navigation');
const resetButton = document.getElementById('resetBtn');
const resumeButton = document.getElementById('resumeBtn');

// 1. Load Route Data
async function loadRouteData() {
    const jsonPath = './route_data.json';

    try {
        const response = await fetch(jsonPath, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        routeData = data.route;
        
        // Initialize UI
        renderNavigation();
        renderFullRoute();
        setupResetButton();
        setupResumeButton();
        setupMapModal(); // <--- NEW FUNCTION CALL
        setupScrollSpy();

    } catch (error) {
        contentArea.innerHTML = `<h2 style="color:red; text-align:center">Error loading data: ${error.message}</h2>`;
        console.error(error);
    }
}

// --- NEW: Map Modal Logic ---
function setupMapModal() {
    const modal = document.getElementById("mapModal");
    const btn = document.getElementById("mapBtn"); // The nav button
    const span = document.getElementsByClassName("close-modal")[0]; // The X button

    if (!btn || !modal) return;

    // Open Modal
    btn.addEventListener('click', () => {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    });

    // Close Modal (X button)
    span.addEventListener('click', () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Re-enable scrolling
    });

    // Close Modal (Click outside image)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // Close Modal (Escape Key)
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });
}

// 2. Setup "Resume Run" Button
function setupResumeButton() {
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            restoreProgress();
        });
    }
}

// 3. Logic to find position and scroll
function restoreProgress() {
    const checkboxes = Array.from(document.querySelectorAll('.checkbox'));
    const hasAnyProgress = checkboxes.some(cb => cb.checked);

    if (!hasAnyProgress) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const firstUnchecked = checkboxes.find(cb => !cb.checked);

    if (firstUnchecked) {
        const row = document.getElementById(`row-${firstUnchecked.id}`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.style.transition = "background 0.5s";
            row.style.backgroundColor = "rgba(240, 192, 90, 0.2)";
            setTimeout(() => { row.style.backgroundColor = "transparent"; }, 1000);
        }
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
}

// 4. Render Navigation (Sidebar)
function renderNavigation() {
    if (navigationContainer.querySelector('#dynamic-links')) {
        navigationContainer.querySelector('#dynamic-links').remove();
    }

    const dynamicLinksDiv = document.createElement('div');
    dynamicLinksDiv.id = 'dynamic-links';

    routeData.forEach(part => {
        const link = document.createElement('a');
        link.href = `#${part.id}`;
        link.textContent = part.title.split(':')[0].trim();
        link.classList.add('nav-link');
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = part.id;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const yOffset = window.innerWidth < 1280 ? -110 : -20; // Adjusted for new sticky height
                const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
                history.pushState(null, '', `#${targetId}`);
            }
        });
        
        dynamicLinksDiv.appendChild(link);
    });

    // Ensure buttons stay in order
    const resumeBtn = document.getElementById('resumeBtn');
    navigationContainer.insertBefore(dynamicLinksDiv, resumeBtn);
}

// 5. Render Full Route
function renderFullRoute() {
    let html = '';

    routeData.forEach(part => {
        html += `<section id="${part.id}" class="route-part-section">`;
        html += `<h1 class="part-title">${part.title}</h1>`;

        part.legs.forEach(leg => {
            html += `
                <div class="leg-section">
                    <h3>${leg.title}</h3>
                    <div class="checklist">
            `;

            leg.content.forEach(item => {
                if (item.type === 'step') {
                    const isChecked = localStorage.getItem(item.id) === 'true';
                    const completedClass = isChecked ? 'completed' : '';
                    html += `
                        <div class="checklist-item ${completedClass}" id="row-${item.id}">
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
                </div>`;
        });

        html += `</section>`;
    });

    contentArea.innerHTML = html;

    document.querySelectorAll('.checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
            localStorage.setItem(this.id, this.checked);
            this.closest('.checklist-item').classList.toggle('completed', this.checked);
        });
    });
}

// 6. Scroll Spy
function setupScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.setAttribute('aria-current', 'false');
                    link.classList.remove('active-nav');
                });
                const activeLink = document.querySelector(`a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.setAttribute('aria-current', 'page');
                    activeLink.classList.add('active-nav');
                }
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });

    document.querySelectorAll('section.route-part-section').forEach(section => {
        observer.observe(section);
    });
}

// 7. Reset Button
function setupResetButton() {
    resetButton.addEventListener('click', () => {
        if (confirm('Reset ALL 112% progress?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', loadRouteData);
