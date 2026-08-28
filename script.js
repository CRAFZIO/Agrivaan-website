// Loading Screen Animation
const startLoaderTransition = () => {
    const loader = document.getElementById('loader');
    const loaderLogo = document.getElementById('loader-logo');
    const navLogo = document.getElementById('nav-logo');

    if (loader && loaderLogo && navLogo && !loader.classList.contains('opacity-0')) {
        // Get target position (Navbar Logo)
        const targetRect = navLogo.getBoundingClientRect();
        const loaderRect = loaderLogo.getBoundingClientRect();

        // Calculate scales and translations
        const scaleX = targetRect.width / loaderRect.width;
        const scaleY = targetRect.height / loaderRect.height;
        const translateX = targetRect.left - loaderRect.left + (targetRect.width - loaderRect.width) / 2;
        const translateY = targetRect.top - loaderRect.top + (targetRect.height - loaderRect.height) / 2;

        // Perform the animation
        loaderLogo.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX})`;
        loader.classList.add('opacity-0');
        loader.style.pointerEvents = 'none';

        // Reveal the actual nav logo and remove loader
        setTimeout(() => {
            navLogo.classList.remove('opacity-0');
            navLogo.style.opacity = '1';
            loader.style.display = 'none';
        }, 800); // 800ms transition duration
    }
};

// Force start transition after 1.2 seconds, or immediately on window load (whichever is faster)
const loaderTimeout = setTimeout(startLoaderTransition, 1200);

window.addEventListener('load', () => {
    clearTimeout(loaderTimeout);
    setTimeout(startLoaderTransition, 100);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile Menu Overlay & Drawer Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

const openMenu = () => {
    if (mobileMenu && mobileOverlay) {
        mobileMenu.classList.remove('translate-x-full');
        mobileOverlay.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
    }
};

const closeMenu = () => {
    if (mobileMenu && mobileOverlay) {
        mobileMenu.classList.add('translate-x-full');
        mobileOverlay.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'auto';
    }
};

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// Reveal Animations on Scroll
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

const revealOnScroll = () => {
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight * 0.85) {
            el.classList.add('revealed');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check



// About Section Video Autoplay and Autostop
const aboutVideo = document.getElementById('about-video');

if (aboutVideo) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Play with audio unmuted when it enters viewport
                aboutVideo.muted = false;
                aboutVideo.play().catch(err => {
                    console.log("Autoplay with audio blocked, playing muted as fallback:", err);
                    aboutVideo.muted = true;
                    aboutVideo.play().catch(err2 => console.error("Playback failed:", err2));
                });
            } else {
                // Pause video when scrolled out of viewport
                aboutVideo.pause();
            }
        });
    }, {
        threshold: 0.25 // Triggers when 25% of the video is visible
    });

    observer.observe(aboutVideo);

    // Unmute on first user interaction if it was muted by autoplay rules
    const unmuteOnInteraction = () => {
        if (aboutVideo.muted && !aboutVideo.paused) {
            aboutVideo.muted = false;
        }
        document.removeEventListener('click', unmuteOnInteraction);
        document.removeEventListener('touchstart', unmuteOnInteraction);
    };
    document.addEventListener('click', unmuteOnInteraction);
    document.addEventListener('touchstart', unmuteOnInteraction);
}

// Active Nav helper functions
const updateActiveNav = (targetHref) => {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuLinks = document.querySelectorAll('.mobile-link');

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === targetHref);
    });
    mobileMenuLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === targetHref);
    });
};

// Single Page Application (SPA) Router
const handleRouting = () => {
    const hash = window.location.hash || '#hero';
    const mainView = document.getElementById('main-content-view');
    const teamView = document.getElementById('team-content-view');

    if (!mainView || !teamView) return;

    if (hash === '#team') {
        // Swap views
        mainView.classList.add('hidden');
        teamView.classList.remove('hidden');
        window.scrollTo({ top: 0 });

        // Highlight active navbar link
        updateActiveNav('#team');

        // Update Swiper layout inside team view
        if (techTeamSwiper) {
            setTimeout(() => {
                techTeamSwiper.update();
            }, 100);
        }
    } else {
        // Swap views back to main
        mainView.classList.remove('hidden');
        teamView.classList.add('hidden');

        // Scroll to the anchor if it exists
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }, 50);
        }

        // Highlight based on current anchor
        updateActiveNav(hash);
    }
};

// Listen to Hash Changes
window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);

// Scroll Spy for Main View sections (only active when not on team page)
const runScrollSpy = () => {
    if (window.location.hash === '#team') return;

    const sections = document.querySelectorAll('#main-content-view section');
    const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

    sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        if (!sectionId) return;

        const offsetTop = section.offsetTop - 120;
        const offsetHeight = section.offsetHeight;

        if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            updateActiveNav(`#${sectionId}`);
        }
    });
};

window.addEventListener('scroll', runScrollSpy);

// Smooth Scroll for local anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        // Close mobile menu if open
        closeMenu();

        const currentHash = window.location.hash || '#hero';
        const isGoingToTeam = targetId === '#team';
        const isComingFromTeam = currentHash === '#team';

        // If transitioning across views, let the hashchange handle routing
        if (isGoingToTeam || isComingFromTeam) {
            return;
        }

        // If staying within the main view sections, smooth scroll
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            // Update URL hash without reload and highlight active link
            history.pushState(null, null, targetId);
            updateActiveNav(targetId);
        }
    });
});

// --- EmailJS & Form Submission Logic ---
// How EmailJS Works:
// EmailJS is a client-side library that connects directly to the EmailJS APIs to send emails without a backend.
// It parses form values by target element name attributes (e.g. name="user_name"), matches them with template parameters
// in your EmailJS dashboard, and sends the compiled template to your designated email.
//
// Where to add EmailJS Keys:
// 1. Initialized with Public Key: In index.html inside the script block initializing emailjs.
// 2. Used in script.js: Replace the placeholders 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' inside the sendForm call.
//
// How to change destination email later:
// You do NOT need to change your frontend code! Go to your EmailJS Dashboard -> Email Templates -> Edit your Template.
// Under the "To Email" field of your Template, enter the destination email (e.g., contact@agrivaan.in).
// Alternatively, if you want dynamic routing, you can add a hidden field in the HTML (e.g., <input type="hidden" name="to_email" value="contact@agrivaan.in">) 
// and map it as {{to_email}} in the EmailJS Template dashboard.

const contactForm = document.getElementById('contact-form');

if (contactForm) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnIcon = document.getElementById('btn-icon');

    const nameInput = document.getElementById('user_name');
    const phoneInput = document.getElementById('user_phone');
    const emailInput = document.getElementById('user_email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    // Helper functions for custom field errors
    const showError = (input, message) => {
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
        input.classList.remove('border-transparent', 'focus:border-primary/20');
        input.classList.add('border-red-500', 'focus:border-red-500');
    };

    const clearError = (input) => {
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.classList.add('hidden');
            errorSpan.textContent = '';
        }
        input.classList.remove('border-red-500', 'focus:border-red-500');
        input.classList.add('border-transparent', 'focus:border-primary/20');
    };

    // Attach input listeners to clear errors on typing
    const formFields = [nameInput, phoneInput, emailInput, subjectInput, messageInput];
    formFields.forEach(field => {
        if (field) {
            field.addEventListener('input', () => clearError(field));
        }
    });

    // Custom dialog notification popup
    const showNotification = (isSuccess, title, message) => {
        const modal = document.getElementById('contact-notification');
        const iconContainer = document.getElementById('notification-icon-container');
        const icon = document.getElementById('notification-icon');
        const titleEl = document.getElementById('notification-title');
        const msgEl = document.getElementById('notification-message');
        const closeBtn = document.getElementById('notification-close-btn');

        if (!modal || !iconContainer || !icon || !titleEl || !msgEl || !closeBtn) return;

        // Reset classes
        iconContainer.className = 'w-16 h-16 rounded-full flex items-center justify-center mb-6';
        closeBtn.className = 'w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
        
        if (isSuccess) {
            iconContainer.classList.add('bg-green-100', 'text-green-600');
            icon.setAttribute('data-lucide', 'check-circle');
            closeBtn.classList.add('bg-gradient-to-r', 'from-primary', 'to-secondary', 'focus:ring-primary');
            titleEl.className = 'text-2xl font-bold text-primary mb-2';
        } else {
            iconContainer.classList.add('bg-red-100', 'text-red-600');
            icon.setAttribute('data-lucide', 'alert-circle');
            closeBtn.classList.add('bg-red-500', 'hover:bg-red-600', 'focus:ring-red-500');
            titleEl.className = 'text-2xl font-bold text-red-600 mb-2';
        }

        titleEl.textContent = title;
        msgEl.textContent = message;

        // Render Lucide icon inside modal dynamically
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Display modal
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.querySelector('.relative').classList.remove('scale-95');
        modal.querySelector('.relative').classList.add('scale-100');
        document.body.style.overflow = 'hidden';

        const closeModal = () => {
            modal.querySelector('.relative').classList.remove('scale-100');
            modal.querySelector('.relative').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = 'auto';
            }, 300);
            closeBtn.removeEventListener('click', closeModal);
        };

        closeBtn.addEventListener('click', closeModal);
    };

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // 1. Validate Full Name
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Full Name is required');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        // 2. Validate Phone Number (Indian/International digit validations)
        const phoneValue = phoneInput.value.trim();
        const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;
        if (!phoneValue) {
            showError(phoneInput, 'Phone Number is required');
            isValid = false;
        } else if (!phoneRegex.test(phoneValue)) {
            showError(phoneInput, 'Please enter a valid phone number (at least 10 digits)');
            isValid = false;
        } else {
            clearError(phoneInput);
        }

        // 3. Validate Email Address
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValue) {
            showError(emailInput, 'Email Address is required');
            isValid = false;
        } else if (!emailRegex.test(emailValue)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailInput);
        }

        // 4. Validate Subject
        if (!subjectInput.value.trim()) {
            showError(subjectInput, 'Subject is required');
            isValid = false;
        } else {
            clearError(subjectInput);
        }

        // 5. Validate Message
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Message is required');
            isValid = false;
        } else {
            clearError(messageInput);
        }

        // Stop submission if form is invalid
        if (!isValid) return;

        // Toggle Loading UI State
        btnText.textContent = 'Sending...';
        btnSpinner.classList.remove('hidden');
        btnIcon.classList.add('hidden');
        submitBtn.disabled = true;

        // Use EmailJS sendForm integration
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with actual EmailJS Dashboard variables.
        emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', contactForm)
            .then(() => {
                // Success state
                showNotification(true, 'Message Sent!', 'Your message has been sent successfully. We will get back to you shortly.');
                contactForm.reset();
            })
            .catch((error) => {
                // Error state
                console.error('EmailJS Error:', error);
                showNotification(
                    false, 
                    'Failed to Send', 
                    `We encountered an error while sending your message. Please try again later. (Details: ${error?.text || error?.message || 'Unknown error'})`
                );
            })
            .finally(() => {
                // Reset submit button state
                btnText.textContent = 'Send Message';
                btnSpinner.classList.add('hidden');
                btnIcon.classList.remove('hidden');
                submitBtn.disabled = false;
            });
    });
}

// Initialize Swiper Carousels
let gallerySwiper;
let techTeamSwiper;

if (typeof Swiper !== 'undefined') {
    if (document.querySelector('.gallerySwiper')) {
        gallerySwiper = new Swiper('.gallerySwiper', {
            slidesPerView: 1.2,
            spaceBetween: 16,
            loop: true,
            speed: 1200,
            freeMode: {
                enabled: true,
                momentum: false,
            },
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            breakpoints: {
                480: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 28 },
                1024: { slidesPerView: 3.5, spaceBetween: 32 },
                1280: { slidesPerView: 4, spaceBetween: 40 },
            },
        });

        // Custom navigation button click handlers to solve issues with freeMode + continuous autoplay
        const nextBtns = document.querySelectorAll('.gallery-next');
        const prevBtns = document.querySelectorAll('.gallery-prev');
        let galleryAutoplayTimeout;

        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (gallerySwiper) {
                    gallerySwiper.autoplay.stop();
                    gallerySwiper.slideNext(600);
                    
                    clearTimeout(galleryAutoplayTimeout);
                    galleryAutoplayTimeout = setTimeout(() => {
                        gallerySwiper.autoplay.start();
                    }, 3000);
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (gallerySwiper) {
                    gallerySwiper.autoplay.stop();
                    gallerySwiper.slidePrev(600);
                    
                    clearTimeout(galleryAutoplayTimeout);
                    galleryAutoplayTimeout = setTimeout(() => {
                        gallerySwiper.autoplay.start();
                    }, 3000);
                }
            });
        });
    }

    if (document.querySelector('.techTeamSwiper')) {
        techTeamSwiper = new Swiper('.techTeamSwiper', {
            slidesPerView: 1.2,
            spaceBetween: 20,
            loop: false,
            centerInsufficientSlides: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
            },
        });
    }
}

// Lightbox Logic
const lightboxImages = [
    'assets/images/gallery/gallery1.png',
    'assets/images/gallery/gallery2.png',
    'assets/images/gallery/gallery3.png',
    'assets/images/gallery/gallery4.jpeg',
    'assets/images/gallery/gallery6.png',
    'assets/images/gallery/gallery7.png',
    'assets/images/gallery/gallery8.png',
    'assets/images/gallery/gallery9.png'
];
let currentLightboxIndex = 0;

window.openLightbox = (src, index) => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxContent = document.getElementById('lightbox-content');
    if (!lightbox || !lightboxImg || !lightboxContent) return;

    currentLightboxIndex = index;
    lightboxImg.src = src;
    lightbox.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        lightboxContent.classList.remove('scale-95');
        lightboxContent.classList.add('scale-100');
    }, 50);
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxContent = document.getElementById('lightbox-content');
    if (!lightbox || !lightboxImg || !lightboxContent) return;

    lightboxContent.classList.remove('scale-100');
    lightboxContent.classList.add('scale-95');
    setTimeout(() => {
        lightbox.classList.add('opacity-0', 'pointer-events-none');
        lightboxImg.src = '';
    }, 300);
    document.body.style.overflow = 'auto';
};

window.prevLightboxImage = (e) => {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightboxImage();
};

window.nextLightboxImage = (e) => {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
    updateLightboxImage();
};

const updateLightboxImage = () => {
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightboxImg) return;
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transition = 'opacity 0.2s';
    setTimeout(() => {
        lightboxImg.src = lightboxImages[currentLightboxIndex];
        lightboxImg.style.opacity = '1';
    }, 200);
};

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && !lightbox.classList.contains('opacity-0')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightboxImage();
        if (e.key === 'ArrowRight') nextLightboxImage();
    }
});
