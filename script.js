/* ============================================================
   PORTFOLIO SCRIPT — Minimalist Edition
   - Mobile nav toggle
   - Smooth scroll
   - Scroll reveal
   - Contact form submission
   - Toast notifications
============================================================ */

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