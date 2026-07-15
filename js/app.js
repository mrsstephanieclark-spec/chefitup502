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
        // Force muted programmatically to guarantee Safari recognizes the video is muted
        heroVideo.muted = true;

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionPreference = (e) => {
            if (e.matches) {
                heroVideo.pause();
            } else {
                // If motion is enabled and it is currently paused, try playing
                if (heroVideo.paused) {
                    heroVideo.play().catch(err => {
                        console.log('Autoplay was prevented by browser security:', err);
                    });
                }
            }
        };

        // Pause initially only if prefers-reduced-motion is active.
        // Otherwise, let the native HTML 'autoplay' attribute start the video.
        if (motionQuery.matches) {
            heroVideo.pause();
        } else {
            // Optional: try a safe play() call in case browser native autoplay didn't start it.
            // Some browsers require a user gesture or trigger.
            heroVideo.play().catch(() => {
                // Native browser autoplay policy will catch this if blocked, showing the poster.
            });
        }

        // Listen for changes in accessibility settings
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

    // --- 6. LIGHTBOX FUNCTIONALITY ---
    const lightboxModal = document.getElementById('site-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    window.openLightbox = (src) => {
        if (lightboxModal && lightboxImg) {
            lightboxImg.src = src;
            lightboxModal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Stop background scrolling
        }
    };

    window.closeLightbox = () => {
        if (lightboxModal) {
            lightboxModal.classList.remove('open');
            document.body.style.overflow = 'auto'; // Restore background scrolling
        }
    };

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeLightbox();
        }
    });

    // --- 7. DYNAMIC IMAGES & MANIFEST LOADER ---
    const candidGrid = document.getElementById('candid-gallery-grid');
    const menusGrid = document.getElementById('menus-grid');

    if (candidGrid || menusGrid) {
        fetch('assets/manifest.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch manifest.json');
                }
                return response.json();
            })
            .then(data => {
                // Populate Candid Gallery Grid
                if (candidGrid && data.table) {
                    candidGrid.innerHTML = data.table.map((src, idx) => `
                        <div class="gallery-item-candid" onclick="openLightbox('${src}')">
                            <div class="candid-img-wrapper">
                                <img src="${src}" alt="Chef Casey At the Table Candid Shot ${idx + 1}" loading="lazy">
                                <div class="candid-overlay-hover">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }

                // Populate Custom Menus Grid
                if (menusGrid && data.menus) {
                    menusGrid.innerHTML = data.menus.map((src, idx) => `
                        <div class="menu-card" onclick="openLightbox('${src}')">
                            <div class="menu-card-image">
                                <img src="${src}" alt="Custom Sample Menu ${idx + 1}" loading="lazy">
                                <div class="menu-card-overlay">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                    <span>Enlarge Menu</span>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            })
            .catch(err => {
                console.error('Error loading dynamic galleries:', err);
                if (candidGrid) {
                    candidGrid.innerHTML = '<p class="error-msg">Error loading candid photos. Please refresh or try again later.</p>';
                }
                if (menusGrid) {
                    menusGrid.innerHTML = '<p class="error-msg">Error loading sample menus. Please refresh or try again later.</p>';
                }
            });
    }
});
