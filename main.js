/* ============================================================
   CYRUS.W — INTERACTION LAYER (Motion + GSAP hybrid)
   - GSAP：平滑滾動、Hero 入場序列、燈箱淡出、3D tilt
   - Motion：滾動彈出／收回、逐字標題、卡片交錯
   - 篩選器：純 class 切換，零 DOM 重排，即時反應
   ============================================================ */

const { animate, inView } = window.Motion || {};

(function () {
    'use strict';

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* ------------------------------------------------------------
       0. 環境檢測
       ------------------------------------------------------------ */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* ------------------------------------------------------------
       1. HERO 入場（GSAP timeline）
       ------------------------------------------------------------ */
    function initHero() {
        const nav = document.getElementById('nav');
        const portrait = document.getElementById('flyInPortrait');
        const heroChildren = document.querySelectorAll('.hero .grid > div');

        gsap.set(nav, { opacity: 0, y: -24 });
        gsap.set(portrait, { x: '170%', opacity: 0, scale: 0.85 });
        gsap.set(heroChildren, { opacity: 0, y: 35 });

        if (prefersReducedMotion) {
            gsap.set([nav, portrait, ...heroChildren], { opacity: 1, x: 0, y: 0, scale: 1 });
            return;
        }

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.to(nav, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
          .to(portrait, { x: '0%', opacity: 1, scale: 1, duration: 1.2 }, 0.2)
          .to(heroChildren, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.4);
    }

    /* ------------------------------------------------------------
       2. 平滑滾動
       ------------------------------------------------------------ */
    function initSmoothScroll() {
        const links = document.querySelectorAll('.nav-links a, .logo, .mobile-link');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                gsap.to(window, {
                    duration: prefersReducedMotion ? 0 : 1.1,
                    scrollTo: { y: target, offsetY: href === '#contact-footer' ? 0 : 75 },
                    ease: 'power4.inOut'
                });
            });
        });
    }

    /* ------------------------------------------------------------
       3. NAV 當前區塊追蹤（rAF 節流）
       ------------------------------------------------------------ */
    function initNavTracker() {
        const sections = document.querySelectorAll('section[id], header[id]');
        const pills = document.querySelectorAll('.nav-links a');
        let ticking = false;

        function update() {
            const threshold = window.scrollY + 140;
            let activeId = '';

            sections.forEach(sec => {
                if (threshold >= sec.offsetTop && threshold < sec.offsetTop + sec.offsetHeight) {
                    activeId = sec.id;
                }
            });

            pills.forEach(pill => {
                pill.classList.toggle('active', pill.getAttribute('href') === `#${activeId}`);
            });

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ------------------------------------------------------------
       4. SECTION 彈出／收回（Motion inView）
       ------------------------------------------------------------ */
    function initSectionReveal() {
        if (prefersReducedMotion || !inView) return;

        const wrappers = document.querySelectorAll(
            'section#about > div, section#hobbies > div, section#skills > div, ' +
            'section#experiences > div, section#certificate > div, section#projects > div'
        );

        wrappers.forEach(wrapper => {
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateY(80px) scale(0.96)';

            inView(wrapper, (element) => {
                animate(
                    element,
                    { opacity: [0, 1], transform: ['translateY(80px) scale(0.96)', 'translateY(0px) scale(1)'] },
                    { duration: 1.0, easing: [0.17, 0.55, 0.55, 1] }
                );

                return () => {
                    animate(
                        element,
                        { opacity: [1, 0], transform: ['translateY(0px) scale(1)', 'translateY(80px) scale(0.96)'] },
                        { duration: 0.45, easing: [0.5, 0, 0.75, 0] }
                    );
                };
            }, { amount: 0.25 });
        });
    }

    /* ------------------------------------------------------------
       5. 卡片彈出／收回（Motion inView，每張獨立）
       ------------------------------------------------------------ */
    function initCardReveal() {
        if (prefersReducedMotion || isTouch || !inView) return;

        const cardSelector = [
            '#about .glass-card',
            '#hobbies .tilt-card',
            '#skills .skill-node-card',
            '#experiences .timeline-node-item',
            '#certificate .cert-grid-card',
            '#projects article'
        ].join(', ');

        const cards = document.querySelectorAll(cardSelector);

        cards.forEach((card, index) => {
            const dirX = index % 2 === 0 ? -60 : 60;

            card.style.opacity = '0';
            card.style.transform = `translate(${dirX}px, 50px) scale(0.8) rotateY(${dirX > 0 ? 12 : -12}deg)`;

            inView(card, (element) => {
                const rect = element.getBoundingClientRect();
                const viewportH = window.innerHeight;
                const progress = 1 - Math.min(1, Math.max(0, rect.top / viewportH));
                const delay = progress * 0.12;

                animate(
                    element,
                    {
                        opacity: [0, 1],
                        transform: [
                            `translate(${dirX}px, 50px) scale(0.8) rotateY(${dirX > 0 ? 12 : -12}deg)`,
                            'translate(0px, 0px) scale(1) rotateY(0deg)'
                        ]
                    },
                    { duration: 0.9, delay, easing: [0.34, 1.56, 0.64, 1] }
                );

                return () => {
                    animate(
                        element,
                        {
                            opacity: [1, 0],
                            transform: [
                                'translate(0px, 0px) scale(1) rotateY(0deg)',
                                `translate(${dirX}px, 50px) scale(0.8) rotateY(${dirX > 0 ? 12 : -12}deg)`
                            ]
                        },
                        { duration: 0.4, easing: [0.5, 0, 0.75, 0] }
                    );
                };
            }, { amount: 0.2 });
        });
    }

    /* ------------------------------------------------------------
       6. 標題逐字動畫（Motion inView）
       ------------------------------------------------------------ */
    function splitTextNodes(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.trim().length > 0) textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const frag = document.createDocumentFragment();
            text.split('').forEach(ch => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = ch === ' ' ? '\u00A0' : ch;
                frag.appendChild(span);
            });
            textNode.parentNode.replaceChild(frag, textNode);
        });

        return root.querySelectorAll('.char');
    }

    function initHeadingReveal() {
        if (prefersReducedMotion || !inView) return;

        const headings = document.querySelectorAll(
            'section#about h2, section#hobbies h2, section#skills h2, ' +
            'section#experiences h2, section#certificate h2, section#projects h2'
        );

        headings.forEach(heading => {
            const chars = splitTextNodes(heading);
            if (chars.length === 0) return;

            chars.forEach(char => {
                char.style.opacity = '0';
                char.style.display = 'inline-block';
                char.style.transform = 'translateY(30px) rotateX(-60deg)';
                char.style.filter = 'blur(6px)';
            });

            inView(heading, () => {
                animate(
                    chars,
                    {
                        opacity: [0, 1],
                        transform: ['translateY(30px) rotateX(-60deg)', 'translateY(0px) rotateX(0deg)'],
                        filter: ['blur(6px)', 'blur(0px)']
                    },
                    { duration: 0.7, delay: (i) => i * 0.025, easing: [0.34, 1.56, 0.64, 1] }
                );

                return () => {
                    animate(
                        chars,
                        {
                            opacity: [1, 0],
                            transform: ['translateY(0px) rotateX(0deg)', 'translateY(30px) rotateX(-60deg)'],
                            filter: ['blur(0px)', 'blur(6px)']
                        },
                        { duration: 0.4, delay: (i) => i * 0.01, easing: [0.5, 0, 0.75, 0] }
                    );
                };
            }, { amount: 0.5 });
        });
    }

    /* ------------------------------------------------------------
       7. 3D TILT（GSAP，rAF 節流）
       ------------------------------------------------------------ */
    function initTilt() {
        if (prefersReducedMotion || isTouch) return;

        const cards = document.querySelectorAll('.tilt-card');

        cards.forEach(card => {
            let raf = null;

            card.addEventListener('mousemove', (e) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    const bounds = card.getBoundingClientRect();
                    const axisX = (e.clientX - bounds.left) / bounds.width - 0.5;
                    const axisY = (e.clientY - bounds.top) / bounds.height - 0.5;

                    gsap.to(card, {
                        rotateX: -axisY * 12,
                        rotateY: axisX * 12,
                        duration: 0.35,
                        ease: 'power2.out',
                        transformPerspective: 900,
                        overwrite: 'auto'
                    });
                    raf = null;
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.6)',
                    overwrite: 'auto'
                });
            });
        });
    }

    /* ------------------------------------------------------------
       8. 篩選器 — 零 DOM 重排版本
       核心改動：
       - 不再呼叫 sortCertificates()（DOM 順序已在 HTML 中固定）
       - 只切換 .is-hidden class，不碰 inline style
       - 按鈕狀態同步切換（不延遲）
       - 動畫在下一幀用 Motion 執行，不阻塞點擊反饋
       ------------------------------------------------------------ */

    // 全域排序（只在頁面初始載入時呼叫一次）
    function sortCertificatesOnce() {
        const container = document.getElementById('certsContainer');
        if (!container) return;

        const categoryOrder = { it: 1, mos: 2, others: 3 };
        const cards = Array.from(container.children).filter(el => el.classList.contains('cert-grid-card'));

        cards.sort((a, b) => {
            const catA = categoryOrder[a.dataset.certCat] || 99;
            const catB = categoryOrder[b.dataset.certCat] || 99;
            if (catA !== catB) return catA - catB;

            const pa = parseInt(a.dataset.priority, 10);
            const pb = parseInt(b.dataset.priority, 10);
            return (Number.isFinite(pa) ? pa : 999) - (Number.isFinite(pb) ? pb : 999);
        });

        const frag = document.createDocumentFragment();
        cards.forEach(c => frag.appendChild(c));
        container.appendChild(frag);
    }

    function filterCertificates(targetCategory) {
        // ---- 1. 同步切換按鈕狀態（立即視覺反饋）----
        const pills = document.querySelectorAll('.cert-pill');
        for (let i = 0; i < pills.length; i++) {
            const btn = pills[i];
            const onclickAttr = btn.getAttribute('onclick') || '';
            btn.classList.toggle('active', onclickAttr.includes(`'${targetCategory}'`));
        }

        // ---- 2. 同步切換卡片可見性（class 切換，比 inline style 快 10 倍）----
        const container = document.getElementById('certsContainer');
        if (!container) return;

        const children = container.children;
        const visible = [];

        for (let i = 0; i < children.length; i++) {
            const card = children[i];
            if (!card.classList.contains('cert-grid-card')) continue;

            const show = targetCategory === 'all' || card.dataset.certCat === targetCategory;
            card.classList.toggle('is-hidden', !show);
            if (show) visible.push(card);
        }

        // ---- 3. 動畫（下一幀執行，不阻塞點擊）----
        if (prefersReducedMotion) {
            visible.forEach(c => {
                c.style.opacity = '1';
                c.style.transform = 'none';
            });
            return;
        }

        requestAnimationFrame(() => {
            if (animate) {
                // Motion 版：一次處理所有卡片，用 delay 函式做 stagger
                animate(
                    visible,
                    { opacity: [0, 1], scale: [0.95, 1], y: [12, 0] },
                    {
                        duration: 0.35,
                        delay: (i) => i * 0.02,
                        easing: [0.34, 1.56, 0.64, 1]
                    }
                );
            } else {
                // Fallback：原生 WAAPI
                visible.forEach((card, i) => {
                    card.animate(
                        [
                            { opacity: 0, transform: 'translateY(12px) scale(0.95)' },
                            { opacity: 1, transform: 'translateY(0) scale(1)' }
                        ],
                        {
                            duration: 350,
                            delay: i * 20,
                            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            fill: 'both'
                        }
                    );
                });
            }
        });
    }

    function filterSkills(targetCategory) {
        // ---- 1. 同步切換按鈕狀態 ----
        const pills = document.querySelectorAll('#skills .pill-btn');
        for (let i = 0; i < pills.length; i++) {
            const btn = pills[i];
            const onclickAttr = btn.getAttribute('onclick') || '';
            btn.classList.toggle('active', onclickAttr.includes(`'${targetCategory}'`));
        }

        // ---- 2. 同步切換卡片可見性 ----
        const cards = document.querySelectorAll('.skill-node-card');
        const visible = [];

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const show = targetCategory === 'all' || card.dataset.skillCat === targetCategory;
            card.classList.toggle('is-hidden', !show);
            if (show) visible.push(card);
        }

        // ---- 3. 動畫 ----
        if (prefersReducedMotion) {
            visible.forEach(c => {
                c.style.opacity = '1';
                c.style.transform = 'none';
            });
            return;
        }

        requestAnimationFrame(() => {
            if (animate) {
                animate(
                    visible,
                    { opacity: [0, 1], scale: [0.95, 1], y: [12, 0] },
                    {
                        duration: 0.35,
                        delay: (i) => i * 0.03,
                        easing: [0.34, 1.56, 0.64, 1]
                    }
                );
            } else {
                visible.forEach((card, i) => {
                    card.animate(
                        [
                            { opacity: 0, transform: 'translateY(12px) scale(0.95)' },
                            { opacity: 1, transform: 'translateY(0) scale(1)' }
                        ],
                        {
                            duration: 350,
                            delay: i * 30,
                            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            fill: 'both'
                        }
                    );
                });
            }
        });
    }

    window.filterCertificates = filterCertificates;
    window.filterSkills = filterSkills;

    /* ------------------------------------------------------------
       9. 燈箱
       ------------------------------------------------------------ */
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        const closeBtn = document.getElementById('closeLightbox');
        if (!lightbox || !img) return;

        let lastFocused = null;

        function open(src, alt) {
            lastFocused = document.activeElement;
            img.src = src;
            img.alt = alt || 'Certificate preview';
            lightbox.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');

            if (animate) {
                animate(img, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] });
                animate(lightbox, { opacity: [0, 1] }, { duration: 0.3, easing: 'ease-out' });
            } else {
                lightbox.style.opacity = '1';
            }

            if (closeBtn) closeBtn.focus();
        }

        function close() {
            if (animate) {
                animate(
                    lightbox,
                    { opacity: [1, 0] },
                    {
                        duration: 0.3,
                        easing: 'ease-in',
                        onComplete: () => {
                            lightbox.classList.add('hidden');
                            img.src = '';
                            document.body.classList.remove('overflow-hidden');
                            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
                        }
                    }
                );
            } else {
                lightbox.classList.add('hidden');
                img.src = '';
                document.body.classList.remove('overflow-hidden');
                if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
            }
        }

        window.openLightbox = function (container) {
            const target = container.querySelector('img');
            if (target) open(target.src, target.alt);
        };

        window.closeLightboxFunc = close;

        document.addEventListener('click', (e) => {
            const container = e.target.closest('.symptom-row-img');
            if (container && !container.closest('#lightbox')) {
                const target = container.querySelector('img');
                if (target) open(target.src, target.alt);
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                close();
            });
        }

        img.addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) close();
        });
    }

    /* ------------------------------------------------------------
       10. 手機選單
       ------------------------------------------------------------ */
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const closeBtn = document.getElementById('close-menu');
        const menu = document.getElementById('mobile-menu');
        if (!hamburger || !menu) return;

        function open() {
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            document.body.classList.add('overflow-hidden');
            if (animate) animate(menu, { opacity: [0, 1] }, { duration: 0.3, easing: 'ease-out' });
            else menu.style.opacity = '1';
        }

        function close() {
            document.body.classList.remove('overflow-hidden');
            if (animate) {
                animate(
                    menu,
                    { opacity: [1, 0] },
                    {
                        duration: 0.3,
                        easing: 'ease-in',
                        onComplete: () => {
                            menu.classList.add('hidden');
                            menu.classList.remove('flex');
                        }
                    }
                );
            } else {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }
        }

        hamburger.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', close);
        });
    }

    /* ------------------------------------------------------------
       11. BOOT
       ------------------------------------------------------------ */
    function boot() {
        // 初始排序只做一次
        sortCertificatesOnce();

        initHero();
        initSmoothScroll();
        initNavTracker();
        initSectionReveal();
        initHeadingReveal();
        initCardReveal();
        initTilt();
        initLightbox();
        initMobileMenu();

        // 初始篩選（僅切換 class）
        filterCertificates('all');

        window.addEventListener('load', () => {
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
