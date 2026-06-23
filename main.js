gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

document.addEventListener("DOMContentLoaded", () => {
    
    // ============================================================
    // 1. INTRO INITIALIZATION & HARDWARE ACCELERATED FLY-IN
    // ============================================================
    gsap.set("#nav", { opacity: 0, y: -24 });
    gsap.set("#subline", { opacity: 0, y: 24 });
    gsap.set("#flyInPortrait", { x: "170%", opacity: 0, scale: 0.85 });

    const initTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    initTimeline
      .to("#nav", { opacity: 1, y: 0, duration: 1.0 }, 0.2)
      .to("#flyInPortrait", { x: "0%", opacity: 1, scale: 1, duration: 1.4, ease: "power4.out" }, 0.3)
      .to("#subline", { opacity: 1, y: 0, duration: 1.0 }, 0.8);

    // ============================================================
    // 2. INTER-SECTION LINK METRICS GLIDE SMOOTH SCROLLS
    // ============================================================
    const menuLinks = document.querySelectorAll(".nav-links a, .logo, #navContactBtn");

    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            let destinationPath;
            if(link.id === 'navContactBtn') {
                destinationPath = '#contact';
            } else {
                destinationPath = link.getAttribute("href");
            }
            
            if (destinationPath && destinationPath.startsWith("#")) {
                e.preventDefault();
                const nodeElement = document.querySelector(destinationPath);
                if (nodeElement) {
                    gsap.to(window, {
                        duration: 1.2,
                        scrollTo: { y: nodeElement, offsetY: 75 },
                        ease: "power4.inOut"
                    });
                }
            }
        });
    });

    // ============================================================
    // 3. RUNTIME ACTIVE SECTION BOUNDS VIEWPORT TRACKER
    // ============================================================
    const contentSections = document.querySelectorAll("section, header");
    const headerNavPills = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        let activeSectionId = "";
        const scrollingPositionThreshold = window.scrollY + 140;

        contentSections.forEach(section => {
            const sectionOffsetTop = section.offsetTop;
            const sectionTotalHeight = section.offsetHeight;
            if (scrollingPositionThreshold >= sectionOffsetTop && scrollingPositionThreshold < sectionOffsetTop + sectionTotalHeight) {
                activeSectionId = section.getAttribute("id");
            }
        });

        headerNavPills.forEach(pill => {
            pill.classList.remove("active");
            if (pill.getAttribute("href") === `#${activeSectionId}`) {
                pill.classList.add("active");
            }
        });
    });

    // ============================================================
    // 4. ANIMATED ON-SCROLL REVEAL ARRAYS METRICS
    // ============================================================
    const revealTargets = document.querySelectorAll(".gs-reveal");
    
    revealTargets.forEach((element) => {
        gsap.fromTo(element, 
            { opacity: 0, y: 35 }, 
            {
                scrollTrigger: {
                    trigger: element,
                    start: "top 92%",
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            }
        );
    });

    // ============================================================
    // 5. 3D HOVER PARALLAX PARSE TRRIGERS
    // ============================================================
    const functionalTiltCards = document.querySelectorAll(".tilt-card");

    functionalTiltCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const bounds = card.getBoundingClientRect();
            const axisX = (e.clientX - bounds.left) / bounds.width - 0.5;
            const axisY = (e.clientY - bounds.top) / bounds.height - 0.5;
            
            gsap.to(card, {
                rotateX: -axisY * 12, 
                rotateY: axisX * 12,
                duration: 0.35,
                ease: "power2.out",
                transformPerspective: 900,
                overwrite: "auto"
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.6)",
                overwrite: "auto"
            });
        });
    });

    // ============================================================
    // 6. HIGH WORKFLOW RE-ARCHITECTED FILTER CONTROLLERS
    // ============================================================
    
    // A. Skills Matrix Filter Logic
    const skillButtons = document.querySelectorAll('#skills .pill-btn');
    const skillCards = document.querySelectorAll('.skill-node-card');

    skillButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            skillButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const showCards = [];
            const hideCards = [];

            skillCards.forEach(card => {
                if(filterValue === 'all' || card.getAttribute('data-skill-cat') === filterValue) {
                    showCards.push(card);
                } else {
                    hideCards.push(card);
                }
            });

            gsap.set(hideCards, { display: 'none', opacity: 0 });
            gsap.set(showCards, { display: 'block' });
            gsap.fromTo(showCards, 
                { opacity: 0, y: 15 }, 
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out", overwrite: "auto" }
            );
        });
    });

    // B. Certificate Registry Filter Logic
    const certButtons = document.querySelectorAll('.cert-pill');
    const certCards = document.querySelectorAll('.cert-grid-card');

    certButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            certButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const showCards = [];
            const hideCards = [];

            certCards.forEach(card => {
                if(filterValue === 'all' || card.getAttribute('data-cert-cat') === filterValue) {
                    showCards.push(card);
                } else {
                    hideCards.push(card);
                }
            });

            gsap.set(hideCards, { display: 'none', opacity: 0, scale: 0.95 });
            gsap.set(showCards, { display: 'flex' });
            gsap.fromTo(showCards, 
                { opacity: 0, y: 20, scale: 0.95 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.04, ease: "power3.out", overwrite: "auto" }
            );
        });
    });

    // ============================================================
    // 7. LIGHTBOX MAGNIFYING GLASS LOGIC
    // ============================================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.getElementById('closeLightbox');
    const certImagesContainers = document.querySelectorAll('.symptom-row-img');

    certImagesContainers.forEach(container => {
        container.addEventListener('click', () => {
            const imgEl = container.querySelector('img');
            if(imgEl) {
                lightboxImg.src = imgEl.src;
                lightbox.classList.remove('hidden');
                // Timeout allows display:block to render before opacity transition triggers
                setTimeout(() => {
                    lightbox.classList.remove('opacity-0');
                    lightboxImg.classList.remove('scale-95');
                }, 10);
            }
        });
    });

    const closeLightboxFunc = () => {
        lightbox.classList.add('opacity-0');
        lightboxImg.classList.add('scale-95');
        setTimeout(() => {
            lightbox.classList.add('hidden');
        }, 300); // Wait for CSS transition to finish
    };

    closeLightbox.addEventListener('click', closeLightboxFunc);
    lightbox.addEventListener('click', (e) => {
        if(e.target === lightbox) {
            closeLightboxFunc();
        }
    });

});