/* ==========================================================================
   CHEF IT UP - APPLICATION LOGIC
   Mobile navigation, gallery filtering, dynamic hero carousel, contact forms
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MOBILE NAVIGATION TOGGLE ---
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.getElementById('primary-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isOpened);
            primaryNav.classList.toggle('open');
            document.body.style.overflow = isOpened ? 'auto' : 'hidden'; // Prevent scrolling when open
        });

        // Close nav when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                primaryNav.classList.remove('open');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // --- 2. HERO VIDEO PLAYBACK CONTROL (REDUCED MOTION) ---
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionPreference = (e) => {
            if (e.matches) {
                heroVideo.removeAttribute('autoplay');
                heroVideo.pause();
            } else {
                heroVideo.setAttribute('autoplay', '');
                heroVideo.play().catch(err => {
                    console.log('Autoplay was prevented, wait for interaction', err);
                });
            }
        };

        // Initial check
        handleMotionPreference(motionQuery);

        // Listen for changes
        motionQuery.addEventListener('change', handleMotionPreference);
    }

    // --- 3. DYNAMIC SCROLL ACTIVE NAV LINK ---
    const sections = document.querySelectorAll('section[id]');
    
    const scrollSpy = () => {
        const scrollPosition = window.scrollY + 120; // offset header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (correspondingLink) {
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    };
    
    window.addEventListener('scroll', scrollSpy);
    scrollSpy(); // Run initially

    // --- 4. FILTERABLE GALLERY WITH SMOOTH ANIMATIONS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state on button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Add animate-out effects
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hide');
                        // Fade back in
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.classList.add('hide');
                    }
                }, 250); // Matches transition delays
            });
        });
    });

    // --- 5. CONTACT FORM VALIDATION & SUCCESS FEEDBACK ---
    const bookingForm = document.getElementById('booking-form');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Hide previous alerts
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
            
            let isFormValid = true;
            const formGroups = bookingForm.querySelectorAll('.form-group');

            // Simple validation check
            formGroups.forEach(group => {
                const input = group.querySelector('input, select, textarea');
                if (!input) return;

                let isValid = true;

                // Required check
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                }

                // Email validation check
                if (isValid && input.type === 'email') {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(input.value.trim())) {
                        isValid = false;
                    }
                }

                // Guest count check
                if (isValid && input.name === 'guests') {
                    const value = parseInt(input.value, 10);
                    if (isNaN(value) || value < 2 || value > 150) {
                        isValid = false;
                    }
                }

                if (!isValid) {
                    group.classList.add('invalid');
                    isFormValid = false;
                } else {
                    group.classList.remove('invalid');
                }
            });

            if (isFormValid) {
                // Mock Submitting State
                const submitBtn = bookingForm.querySelector('.btn-submit');
                submitBtn.classList.add('loading');
                submitBtn.setAttribute('disabled', 'true');

                // Simulate API post (1.5 seconds)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.removeAttribute('disabled');
                    
                    // Show Success
                    successMsg.style.display = 'block';
                    bookingForm.reset();
                    
                    // Smooth scroll to success message
                    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 1500);
            }
        });

        // Real-time error removal on typing/change
        bookingForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                const group = input.closest('.form-group');
                if (group && group.classList.contains('invalid')) {
                    group.classList.remove('invalid');
                }
            });

            input.addEventListener('change', () => {
                const group = input.closest('.form-group');
                if (group && group.classList.contains('invalid')) {
                    group.classList.remove('invalid');
                }
            });
        });
    }
});
