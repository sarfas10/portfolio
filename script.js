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
    function drawGlossyBlob(ctx, cx, cy, radius, rotation, globalAlpha, alpha3D, color, time = 0, wobbleAmp = 1) {
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
            // Asymmetric drop shape with animated wobble based on time
            const w1 = 0.12 * wobbleAmp * Math.cos(angle + time);
            const w2 = 0.08 * wobbleAmp * Math.sin(2 * angle - time * 1.5);
            const r = radius * (1 + w1 + w2);
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // 2. Base solid color
        ctx.fillStyle = color;
        
        // Add subtle drop shadow to make the 3D blob pop
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;
        ctx.fill();
        
        // Reset shadow so it doesn't apply to the gloss/highlights
        ctx.shadowColor = 'transparent';

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

        }

        ctx.restore();
    }

    function setupBlobCanvas(wrapper) {
        const canvas  = wrapper.querySelector('.blob-canvas');
        const btn     = wrapper.querySelector('.cta-btn');
        if (!canvas || !btn) return;

        const color   = wrapper.dataset.color  || '#EBA92B';
        const delay   = parseInt(wrapper.dataset.delay, 10) || 0;

        // Set canvas pixel resolution = 200% of the button, centred on it
        function resize() {
            const bSize   = wrapper.offsetWidth;          // button = wrapper size
            const cSize   = Math.round(bSize * 2.0);      // canvas 200% to allow margin orbits
            canvas.width  = cSize;
            canvas.height = cSize;
        }
        resize();

        const ctx = canvas.getContext('2d');
        
        // Remove flat CSS styling; the canvas handles rendering permanently
        btn.style.backgroundColor = 'transparent';
        btn.style.boxShadow       = 'none';
        btn.style.color           = 'transparent';
        btn.style.transition      = 'color 0.4s ease, transform 0.22s ease';

        let phase = 'WAITING'; // WAITING -> SPIRAL -> RESTING
        let phaseStart = 0;
        let isHover = false;
        let hoverWobble = 0; // smoothly animates from 0 to 1
        
        // Physics state for smooth transitions
        let blobTime = 0;
        let lastTs = 0;
        let currentWobble = 1.0; 

        const T_SPIRAL = 1200;  // spiral inward from margin
        const T_SPREAD = 500;   // splashing out from center
        const heroDelay = 800;
        const W = canvas.width;
        const H = canvas.height;
        const CX = W / 2;
        const CY = H / 2;
        const R = wrapper.offsetWidth / 2;

        function step(ts) {
            const delta = ts - (lastTs || ts);
            lastTs = ts;
            ctx.clearRect(0, 0, W, H);
            
            // Hover easing for water droplet effect
            if (isHover) {
                hoverWobble += (1 - hoverWobble) * 0.12;
            } else {
                hoverWobble += (0 - hoverWobble) * 0.08;
            }

            if (phase === 'WAITING') {
                blobTime += delta * 0.002;
                if (ts > phaseStart + heroDelay + delay) {
                    phase = 'SPIRAL';
                    phaseStart = ts;
                }
            } else if (phase === 'SPIRAL') {
                blobTime += delta * 0.004;
                const elapsed = ts - phaseStart;
                
                if (elapsed < T_SPIRAL) {
                    const p       = elapsed / T_SPIRAL;
                    const ep      = easeIn(p); // accelerates as it falls inward

                    // 4 full rotations for a hypnotic motion
                    const orbitAngle = Math.PI * 2 * p * 4 - Math.PI / 2;
                    
                    // Starts from margin (1.4 * R) and collapses to 0 (centre)
                    const orbitR = R * 1.4 * (1 - ep);

                    // Shrinks while traveling: starts thick, shrinks to tiny 0.05*R at centre
                    const blobR  = R * 0.35 * (1 - p) + R * 0.05 * p;

                    const bx = CX + orbitR * Math.cos(orbitAngle);
                    const by = CY + orbitR * Math.sin(orbitAngle);

                    // Dim glow trail linking to center
                    ctx.save();
                    ctx.globalAlpha = 0.04 * (1 - p);
                    ctx.fillStyle   = color;
                    ctx.beginPath();
                    ctx.arc(CX, CY, R, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Main blob
                    drawGlossyBlob(ctx, bx, by, blobR, orbitAngle, 1, 1, color, blobTime, 1);
                    
                    // Tiny trailer droplet following the spiral
                    const tailAng = orbitAngle - 0.25;
                    const tx = CX + (orbitR * 1.05) * Math.cos(tailAng);
                    const ty = CY + (orbitR * 1.05) * Math.sin(tailAng);
                    drawGlossyBlob(ctx, tx, ty, blobR * 0.6, orbitAngle, 0.8, 0.8, color, blobTime, 1);

                } else if (elapsed < T_SPIRAL + T_SPREAD) {
                    const p   = (elapsed - T_SPIRAL) / T_SPREAD;
                    const ep  = easeOut(p);

                    // At midway of spread, make the button text appear
                    if (p > 0.3 && btn.style.color === 'transparent') {
                        btn.style.color = '#FFFFFF';
                    }

                    // Spread outward filling the circular rim
                    const blobR  = R * 0.05 + R * 0.95 * ep;
                    
                    // Keep spinning as it spreads 
                    const startSpreadAng = Math.PI * 2 * 4 - Math.PI / 2;
                    const spin   = startSpreadAng + Math.PI * p * 2.5;

                    // Fade wobble down to 0.15 so the ending frame is organic, not a sterile circle
                    const wobble = 0.15 + 0.85 * (1.0 - Math.pow(p, 1.5));

                    drawGlossyBlob(ctx, CX, CY, blobR, spin, 1, 1, color, blobTime, wobble);

                } else {
                    phase = 'RESTING';
                    currentWobble = 0.15; // Lock to exactly 0.15 to match the final frame smoothly
                }
            } else if (phase === 'RESTING') {
                // Wobble stays at a gentle 0.15 breathing state unless hovered
                const targetWobble = isHover ? 0.8 : 0.15; 
                currentWobble += (targetWobble - currentWobble) * 0.1;
                
                // Time advances incredibly slowly when resting (organic breath), speeds up when hovered
                const speed = 0.001 + 0.003 * currentWobble;
                blobTime += delta * speed;

                if (btn.style.color === 'transparent') {
                    btn.style.color = '#FFFFFF';
                }
                
                // Perfectly matches the exact state at the end of the loading animation
                const blobScale = 1.0 + 0.05 * hoverWobble;
                const blobR = R * blobScale;
                
                drawGlossyBlob(ctx, CX, CY, blobR, 0, 1, 1, color, blobTime, currentWobble);
            }

            requestAnimationFrame(step);
        }

        requestAnimationFrame((ts) => {
            phaseStart = ts;
            step(ts);
        });

        wrapper.addEventListener('mouseenter', () => {
            isHover = true;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            isHover = false;
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