/* ============================================================
   PORTFOLIO SCRIPT — Minimalist Edition
   - Mobile nav toggle
   - Smooth scroll
   - Scroll reveal
   - Ink blob CTA animation
   - Contact form submission
   - Toast notifications
============================================================ */

/* ============================================================
   INK BLOB ANIMATION
   Each blob animates through 3 phases:
   1. ORBIT  — small organic blob races around the rim with a trail
   2. FALL   — blob spirals inward toward the centre
   3. SPREAD — blob expands out rapidly like splashing ink
   4. FADE   — canvas fades as the CSS button takes over
============================================================ */
(function () {
    // Easing helpers
    const easeInOut  = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easeOut    = t => 1 - Math.pow(1 - t, 3);
    const easeIn     = t => t * t * t;

    // Draw a glossy 3D pebble at (cx,cy) with given radius and wobble amount
    function drawGlossyBlob(ctx, cx, cy, radius, rotation, globalAlpha, alpha3D, color) {
        ctx.save();
        ctx.globalAlpha = globalAlpha;
        
        // Move to centre of drop
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // 1. Create the pebble path
        ctx.beginPath();
        const sides = 50;
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            // Asymmetric drop shape
            const r = radius * (1 + 0.12 * Math.cos(angle) + 0.08 * Math.sin(2 * angle - 0.5));
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // 2. Base solid color
        ctx.fillStyle = color;
        ctx.fill();

        // 3D Lighting layer
        if (alpha3D > 0) {
            ctx.save();
            ctx.globalAlpha = globalAlpha * alpha3D;
            ctx.clip(); // Mask lighting to exactly the pebble shape

            // Un-rotate so lighting stays fixed relative to the screen
            ctx.rotate(-rotation);

            // Shading (darker at bottom right)
            const shadowGrad = ctx.createLinearGradient(-radius, -radius, radius * 1.2, radius * 1.2);
            shadowGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
            shadowGrad.addColorStop(0.3, 'rgba(255,255,255,0)');
            shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0)');
            shadowGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = shadowGrad;
            ctx.fillRect(-radius*2, -radius*2, radius*4, radius*4);

            // Bright glossy crescent highlight at top-left
            const glossGrad = ctx.createRadialGradient(
                -radius * 0.35, -radius * 0.35, radius * 0.03,
                -radius * 0.15, -radius * 0.15, radius * 0.75
            );
            glossGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
            glossGrad.addColorStop(0.2, 'rgba(255,255,255,0.3)');
            glossGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
            ctx.fillStyle = glossGrad;
            ctx.fillRect(-radius*2, -radius*2, radius*4, radius*4);

            ctx.restore();

            // Inner rim light (very thin stroke on top-left edge aligned to shape)
            const cos = Math.cos(-rotation);
            const sin = Math.sin(-rotation);
            const x0 = -radius * cos - (-radius) * sin;
            const y0 = -radius * sin + (-radius) * cos;
            const x1 = radius * cos - radius * sin;
            const y1 = radius * sin + radius * cos;
            
            const rimGrad = ctx.createLinearGradient(x0, y0, x1*0.2, y1*0.2);
            rimGrad.addColorStop(0, 'rgba(255,255,255,0.85)');
            rimGrad.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.lineWidth = radius * 0.08;
            ctx.strokeStyle = rimGrad;
            ctx.stroke();
        }

        ctx.restore();
    }

    function setupBlobCanvas(wrapper) {
        const canvas  = wrapper.querySelector('.blob-canvas');
        const btn     = wrapper.querySelector('.cta-btn');
        if (!canvas || !btn) return;

        const color   = wrapper.dataset.color  || '#EBA92B';
        const delay   = parseInt(wrapper.dataset.delay, 10) || 0;

        // Set canvas pixel resolution = 140% of the button, centred on it
        function resize() {
            const bSize   = wrapper.offsetWidth;          // button = wrapper size
            const cSize   = Math.round(bSize * 1.5);      // canvas 150%
            canvas.width  = cSize;
            canvas.height = cSize;
        }
        resize();

        const ctx     = canvas.getContext('2d');
        let   raf     = null;
        let   playing = false;

        // Ensure buttons have a smooth fade text transition
        btn.style.transition = 'color 0.4s ease, transform 0.22s ease, box-shadow 0.22s ease';

        // ---- Run the full animation sequence ----
        function play(isHover) {
            if (playing) return;   // debounce
            playing = true;

            // Make the button background transparent so canvas shows through
            btn.style.backgroundColor = 'transparent';
            btn.style.boxShadow       = 'none';
            
            // If on load, hide the text so the ink blob materialises it
            if (!isHover) {
                btn.style.color = 'transparent';
            }

            const W    = canvas.width;
            const H    = canvas.height;
            const CX   = W / 2;
            const CY   = H / 2;
            const R    = wrapper.offsetWidth / 2;

            // Blob params
            const T_ORBIT  = isHover ? 320 : 800;   // orbit
            const T_FALL   = isHover ? 180 : 350;   // spiral quickly into center
            const T_SPREAD = isHover ? 260 : 450;   // splashing out
            const T_FADE   = isHover ? 150 : 250;   // canvas alpha-out

            let startTime = null;
            let textFadedIn = false;

            function step(ts) {
                if (!startTime) startTime = ts;
                const elapsed = ts - startTime;

                ctx.clearRect(0, 0, W, H);

                // --- PHASE 1: ORBIT (Circling the rim) ---
                if (elapsed < T_ORBIT) {
                    const p       = elapsed / T_ORBIT;
                    const ep      = easeInOut(p);

                    // fast spin, lap and a half
                    const orbitAngle = Math.PI * 2 * p * 1.5 - Math.PI / 2;
                    const orbitR = R * (1.18 - 0.18 * ep);

                    // ink starts as tiny drop, builds up
                    const blobR  = R * 0.12 + R * 0.16 * ep;

                    const bx = CX + orbitR * Math.cos(orbitAngle);
                    const by = CY + orbitR * Math.sin(orbitAngle);

                    // Dim glow trail
                    ctx.save();
                    ctx.globalAlpha = 0.03 * ep;
                    ctx.fillStyle   = color;
                    ctx.beginPath();
                    ctx.arc(CX, CY, R, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Main blob (3D glossy)
                    drawGlossyBlob(ctx, bx, by, blobR, orbitAngle, 1, 1, color);
                    // Tiny trailer droplet
                    const tailAng = orbitAngle - 0.22;
                    const tx = CX + orbitR * Math.cos(tailAng);
                    const ty = CY + orbitR * Math.sin(tailAng);
                    drawGlossyBlob(ctx, tx, ty, blobR * 0.4, orbitAngle, 0.9, 0.8, color);

                // --- PHASE 2: FALL (drop dives into centre) ---
                } else if (elapsed < T_ORBIT + T_FALL) {
                    const p   = (elapsed - T_ORBIT) / T_FALL;
                    const ep  = easeIn(p);

                    const startAngle = Math.PI * 2 * 1.5 - Math.PI / 2;
                    const orbitAngle = startAngle + Math.PI * 0.6 * ep;

                    // dives sharply from rim to centre
                    const orbitR = R * (1.0 - ep);
                    const blobR  = R * 0.28 + R * 0.25 * ep;        

                    const bx = CX + orbitR * Math.cos(orbitAngle);
                    const by = CY + orbitR * Math.sin(orbitAngle);

                    ctx.save();
                    ctx.globalAlpha = ep * 0.3 + 0.04;
                    ctx.fillStyle   = color;
                    ctx.beginPath();
                    ctx.arc(CX, CY, R, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    drawGlossyBlob(ctx, bx, by, blobR, orbitAngle * 2, 1, 1, color);

                // --- PHASE 3: SPREAD (splashes out to fill circle) ---
                } else if (elapsed < T_ORBIT + T_FALL + T_SPREAD) {
                    const p   = (elapsed - T_ORBIT - T_FALL) / T_SPREAD;
                    const ep  = easeOut(p);

                    // At midway of spread, make the button text appear
                    if (!isHover && p > 0.3 && !textFadedIn) {
                        btn.style.color = '#FFFFFF';
                        textFadedIn = true;
                    }

                    const blobR  = R * 0.53 + R * 0.70 * ep;
                    const spin   = Math.PI * p * 2.5;

                    // Fade out the 3D gloss as it fills the circle to match the flat UI seamlessly
                    const alpha3D = 1 - Math.pow(p, 1.5);

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(CX, CY, R, 0, Math.PI * 2);
                    ctx.clip();
                    drawGlossyBlob(ctx, CX, CY, blobR, spin, 1, alpha3D, color);
                    ctx.restore();

                // --- PHASE 4: FADE (seamless CSS transition back) ---
                } else if (elapsed < T_ORBIT + T_FALL + T_SPREAD + T_FADE) {
                    const p  = (elapsed - T_ORBIT - T_FALL - T_SPREAD) / T_FADE;
                    const ep = easeOut(p);
                    const alpha = 1 - ep;
                    
                    if (!isHover && !textFadedIn) {
                        btn.style.color = '#FFFFFF';
                        textFadedIn = true;
                    }

                    // Pre-apply to button so the layer beneath the fading canvas is complete
                    btn.style.backgroundColor = color;
                    btn.style.boxShadow       = '';

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(CX, CY, R, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle   = color;
                    ctx.fill();
                    ctx.restore();

                // --- DONE ---
                } else {
                    ctx.clearRect(0, 0, W, H);
                    btn.style.backgroundColor = color;
                    btn.style.boxShadow       = '';
                    if (!isHover) {
                        btn.style.color = ''; // clear overriding style so CSS var(--white) remains active
                    }
                    playing = false;
                    return;
                }

                raf = requestAnimationFrame(step);
            }

            raf = requestAnimationFrame(step);
        }

        const heroDelay = 800; // time offset before load anim plays
        setTimeout(() => {
            play(false);
        }, heroDelay + delay);

        wrapper.addEventListener('mouseenter', () => {
            if (playing) {
                cancelAnimationFrame(raf);
                playing = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                btn.style.backgroundColor = color;
                btn.style.boxShadow       = '';
                btn.style.color           = ''; // remove transparent color lock
            }
            play(true);
        });
    }

    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.blob-wrapper').forEach(setupBlobCanvas);
    });
})();

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------
       Mobile Nav Toggle
    -------------------------------------------------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
        });

        // Close nav when a link is clicked (mobile)
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });

        // Close nav on outside click
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    }

    /* --------------------------------------------------
       Scroll Reveal
    -------------------------------------------------- */
    const revealElements = document.querySelectorAll(
        '.resume-block, .project-row, .contact-info, .contact-form, .section-heading'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    /* --------------------------------------------------
       Skill Pills — Staggered Pop Reveal
    -------------------------------------------------- */
    const pillRows = document.querySelectorAll('.skill-pill-row');

    const pillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pills = entry.target.querySelectorAll('.skill-pill');
                pills.forEach((pill, i) => {
                    setTimeout(() => {
                        pill.classList.add('popped');
                    }, i * 60);
                });
                pillObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -32px 0px'
    });

    pillRows.forEach(row => pillObserver.observe(row));

    /* --------------------------------------------------
       Contact Form
    -------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    const submitBtn   = document.getElementById('submitBtn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending…';
            submitBtn.disabled = true;

            // Simulate async submission (replace with real endpoint as needed)
            await new Promise(resolve => setTimeout(resolve, 1400));

            // Reset form
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            showToast(
                'Message Sent!',
                'Thanks for reaching out. I\'ll get back to you soon.',
                'success'
            );
        });
    }

    /* --------------------------------------------------
       Toast Notification
    -------------------------------------------------- */
    function showToast(title, message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const titleEl   = toast.querySelector('.toast-title');
        const msgEl     = toast.querySelector('.toast-message');
        const iconEl    = toast.querySelector('.toast-icon');

        if (titleEl)   titleEl.textContent   = title;
        if (msgEl)     msgEl.textContent     = message;

        // Reset classes
        toast.className = 'toast';
        if (type === 'success') {
            toast.classList.add('success');
            if (iconEl) iconEl.className = 'toast-icon fas fa-check-circle';
        } else if (type === 'error') {
            toast.classList.add('error');
            if (iconEl) iconEl.className = 'toast-icon fas fa-exclamation-circle';
        } else {
            if (iconEl) iconEl.className = 'toast-icon fas fa-info-circle';
        }

        // Show
        toast.classList.add('show');

        // Auto-hide after 4 seconds
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

});