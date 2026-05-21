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

// Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerText = 'Message Sent Successfully!';
            btn.classList.add('bg-green-600');
            contactForm.reset();

            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-green-600');
                btn.disabled = false;
            }, 3000);
        }, 1500);
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
            speed: 2000,
            freeMode: {
                enabled: true,
                momentum: false,
            },
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            navigation: {
                nextEl: '.gallery-next',
                prevEl: '.gallery-prev',
            },
            breakpoints: {
                480: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 28 },
                1024: { slidesPerView: 3.5, spaceBetween: 32 },
                1280: { slidesPerView: 4, spaceBetween: 40 },
            },
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
    'assets/images/gallery/gallery4.png'
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
