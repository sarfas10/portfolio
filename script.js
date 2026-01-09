// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile navigation toggle
function setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
}

// Floating character interaction
function setupCharacterInteraction() {
    const floatingCharacter = document.querySelector('.floating-character');
    
    if (floatingCharacter) {
        floatingCharacter.addEventListener('click', () => {
            floatingCharacter.classList.add('wiggle');
            setTimeout(() => {
                floatingCharacter.classList.remove('wiggle');
            }, 500);
        });
    }
}

// Contact form submission
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            // Validate form
            if (!data.name || !data.email || !data.message) {
                showToast('Hold on, hero! 🛡️', 'Please fill in all fields before sending your message.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'SENDING...';
            submitBtn.disabled = true;
            
            try {
                // Simulate form submission (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulate success (in real implementation, check response)
                showToast('Message Sent! 🦸‍♂️', "Your heroic message has been received! I'll respond faster than a speeding bullet.", 'success');
                contactForm.reset();
                
            } catch (error) {
                showToast('Oops! Something went wrong! 😅', 'Failed to send message. Please try again.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Toast notification system
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
        toast.className = 'toast success';
    } else {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
        toast.className = 'toast error';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Intersection Observer for animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll([
        '.comic-panel',
        '.project-card',
        '.skill-category',
        '.contact-item'
    ].join(','));
    
    animateElements.forEach(el => observer.observe(el));
}

// Parallax effect for floating elements
function setupParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-character, .skills-character');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Dynamic color transitions for nav links
function setupNavLinkEffects() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const color = link.getAttribute('data-color');
            const rotation = Math.random() > 0.5 ? '1deg' : '-1deg';
            link.style.transform = `scale(1.1) rotate(${rotation})`;
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
        });
    });
}

// Project card interactions
function setupProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            const rotation = index % 2 === 0 ? '1deg' : '-1deg';
            card.style.transform = `scale(1.05) rotate(${rotation})`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Skill category hover effects
function setupSkillCategories() {
    const skillCategories = document.querySelectorAll('.skill-category');
    
    skillCategories.forEach((category, index) => {
        category.addEventListener('mouseenter', () => {
            const rotation = index % 2 === 0 ? '2deg' : '-2deg';
            category.style.transform = `scale(1.05) rotate(${rotation})`;
        });
        
        category.addEventListener('mouseleave', () => {
            category.style.transform = '';
        });
    });
}

// Button hover effects
function setupButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'rotate(0deg) scale(1.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'rotate(0deg) scale(1.1)';
        });
    });
}

// Dynamic background effects
function setupDynamicBackground() {
    // Add some sparkle effects to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        setInterval(() => {
            createSparkle(hero);
        }, 2000);
    }
}

function createSparkle(container) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'absolute';
    sparkle.style.width = '4px';
    sparkle.style.height = '4px';
    sparkle.style.background = 'white';
    sparkle.style.borderRadius = '50%';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animation = 'sparkle 1.5s ease-out forwards';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '5';
    
    container.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1500);
}

// Add sparkle animation to CSS dynamically
function addSparkleAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkle {
            0% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(0) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

// Navigation active state
function setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Responsive mobile menu
function setupResponsiveMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');
    
    // Add mobile menu styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 4px solid var(--gray-900);
                border-top: none;
                border-radius: 0 0 1rem 1rem;
                padding: 1rem;
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-links.show {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-link {
                display: block;
                padding: 0.5rem 0;
                text-align: center;
                border-bottom: 2px solid var(--gray-900);
            }
            
            .nav-link:last-child {
                border-bottom: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = navToggle.querySelector('i');
            if (navLinks.classList.contains('show')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu when clicking on a link
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                const icon = navToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            });
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();
    setupCharacterInteraction();
    setupContactForm();
    setupScrollAnimations();
    setupParallaxEffect();
    setupNavLinkEffects();
    setupProjectCards();
    setupSkillCategories();
    setupButtonEffects();
    setupDynamicBackground();
    setupActiveNavigation();
    setupResponsiveMobileMenu();
    addSparkleAnimation();
    
    // Add smooth reveal animation to page elements
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease-in';
    }, 100);
});

// Performance optimization: throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    setupParallaxEffect();
    setupActiveNavigation();
}, 16)); // ~60fps

// Add loading animation
function addLoadingAnimation() {
    document.body.style.opacity = '0';
    
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.8s ease-in';
    });
}

// Initialize loading animation
// Initialize loading animation
addLoadingAnimation();

// Interactive Villain Game Logic
function setupVillainGame() {
    const villain = document.getElementById('villain');
    const villainContainer = document.getElementById('villain-game');
    const hpBar = document.getElementById('villain-hp');
    const damageText = document.getElementById('damage-text');
    const victoryOverlay = document.getElementById('victory-overlay');
    
    let maxHP = 100;
    let currentHP = maxHP;
    let isDefeated = false;

    // Sound Effects (Web Audio API)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playHitSound() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    function playVictorySound() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const times = [0, 0.1, 0.2, 0.4];
        
        notes.forEach((note, index) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(note, audioCtx.currentTime + times[index]);
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime + times[index]);
            gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + times[index] + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + times[index] + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start(audioCtx.currentTime + times[index]);
            oscillator.stop(audioCtx.currentTime + times[index] + 0.4);
        });
    }

    if (villain) {
        villain.addEventListener('click', (e) => {
            if (isDefeated) return;
            
            // Calculate Damage
            const damage = 10;
            currentHP = Math.max(0, currentHP - damage);
            
            // Update HP Bar
            const hpPercent = (currentHP / maxHP) * 100;
            hpBar.style.width = `${hpPercent}%`;
            
            if (hpPercent < 30) {
                hpBar.classList.add('hp-low');
            }
            
            // Visual Feedback
            villain.classList.remove('villain-hit');
            void villain.offsetWidth; // Trigger reflow
            villain.classList.add('villain-hit');
            
            playHitSound();

            // Show Damage Text
            damageText.textContent = `-${damage}`;
            damageText.classList.remove('show-damage');
            void damageText.offsetWidth;
            damageText.classList.add('show-damage');
            
            // Check Defeat
            if (currentHP <= 0) {
                isDefeated = true;
                villain.classList.add('villain-defeated');
                playVictorySound();
                
                setTimeout(() => {
                    victoryOverlay.classList.add('show');
                    createConfetti();
                }, 1000);
            }
        });
    }

    // Reset Game Function
    window.resetVillainGame = function() {
        currentHP = maxHP;
        isDefeated = false;
        hpBar.style.width = '100%';
        hpBar.classList.remove('hp-low');
        villain.classList.remove('villain-defeated', 'villain-hit');
        victoryOverlay.classList.remove('show');
    };
}

// Confetti Effect
function createConfetti() {
    const victoryContent = document.querySelector('.victory-content');
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)];
        confetti.style.zIndex = '2001';
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 1}s linear forwards`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Add CSS for confetti
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes confetti-fall {
    to { transform: translateY(100vh) rotate(720deg); }
}`;
document.head.appendChild(styleSheet);

// Call setup
document.addEventListener('DOMContentLoaded', () => {
    setupVillainGame();
});