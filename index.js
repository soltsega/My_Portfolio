document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Touch detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Toggle mobile menu
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            
            // Add haptic feedback on touch devices
            if (isTouchDevice && navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
        
        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
                mobileMenuBtn.focus();
            }
        });
        
        // Add touch gesture support for swipe to close
        if (isTouchDevice) {
            let touchStartX = 0;
            let touchEndX = 0;
            
            navLinks.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            navLinks.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeDistance = touchStartX - touchEndX;
                
                // Swipe left to close menu
                if (swipeDistance > 50 && navLinks.classList.contains('active')) {
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, { passive: true });
        }
    }
    
    // Project Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectsGrid = document.getElementById('projects-grid');
    
    if (filterButtons.length > 0 && projectCards.length > 0) {
        // Initialize all projects as visible
        projectCards.forEach(card => {
            card.classList.add('visible');
        });
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                
                // Update active button state
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                
                // Filter projects with smooth animation
                filterProjects(category);
                
                // Add haptic feedback on touch devices
                if (isTouchDevice && navigator.vibrate) {
                    navigator.vibrate(30);
                }
            });
            
            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
        
        function filterProjects(category) {
            const visibleCards = [];
            const hiddenCards = [];
            
            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const shouldShow = category === 'all' || cardCategory === category;
                
                if (shouldShow) {
                    visibleCards.push(card);
                    card.classList.remove('hidden');
                    card.classList.add('visible');
                } else {
                    hiddenCards.push(card);
                    card.classList.remove('visible');
                    card.classList.add('hidden');
                }
            });
            
            // Reveal animation for visible cards
            visibleCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1) translateY(0)';
                }, index * 100);
            });
            
            // Hide animation for hidden cards
            hiddenCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8) translateY(20px)';
            });
            
            // Update grid layout after animation
            setTimeout(() => {
                if (visibleCards.length === 0) {
                    // Show no results message
                    showNoResultsMessage();
                } else {
                    hideNoResultsMessage();
                }
            }, 300);
        }
        
        function showNoResultsMessage() {
            let noResultsMsg = document.getElementById('no-results');
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-results';
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.innerHTML = `
                    <div class="glass" style="padding: 3rem; text-align: center; border-radius: 20px;">
                        <h3 style="color: var(--text-main); margin-bottom: 1rem;">No projects found</h3>
                        <p style="color: var(--text-dim);">Try selecting a different category to see more projects.</p>
                    </div>
                `;
                projectsGrid.appendChild(noResultsMsg);
            }
        }
        
        function hideNoResultsMessage() {
            const noResultsMsg = document.getElementById('no-results');
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = isTouchDevice ? 60 : 80; // Smaller offset for mobile
                const targetPosition = target.offsetTop - offset;
                
                // Smooth scroll with mobile optimization
                if (isTouchDevice) {
                    // Use instant scroll on mobile for better performance
                    window.scrollTo(0, targetPosition);
                } else {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Mobile performance optimizations
    if (isTouchDevice) {
        // Disable hover effects on touch devices
        document.body.classList.add('touch-device');
        
        // Optimize scroll performance
        let ticking = false;
        function updateOnScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveNav();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', updateOnScroll, { passive: true });
        
        // Add pull-to-refresh hint (visual feedback)
        let startY = 0;
        let isPulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (isPulling && window.scrollY === 0) {
                const currentY = e.touches[0].pageY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > 80) {
                    // Visual feedback for pull-to-refresh
                    document.body.style.transform = `translateY(${Math.min(pullDistance - 80, 20)}px)`;
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (isPulling) {
                document.body.style.transform = '';
                isPulling = false;
            }
        }, { passive: true });
    }
    
    // Contact Form Validation and Submission
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            // Validate form
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim()
            };
            
            let isValid = true;
            
            // Validate name
            if (!formData.name) {
                showError('name', 'Please enter your name');
                isValid = false;
            } else if (formData.name.length < 2) {
                showError('name', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.email) {
                showError('email', 'Please enter your email');
                isValid = false;
            } else if (!emailRegex.test(formData.email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate message
            if (!formData.message) {
                showError('message', 'Please enter your message');
                isValid = false;
            } else if (formData.message.length < 10) {
                showError('message', 'Message must be at least 10 characters');
                isValid = false;
            }
            
            if (!isValid) {
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                // Simulate form submission (replace with actual endpoint)
                await simulateFormSubmission(formData);
                
                // Show success message
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.style.display = 'block';
                    formSuccess.style.display = 'none';
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 5000);
                
            } catch (error) {
                showError('submit', 'Failed to send message. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                // Clear error when user starts typing
                const errorElement = document.getElementById(`${input.id}-error`);
                if (errorElement && input.value.trim()) {
                    errorElement.textContent = '';
                    input.classList.remove('error');
                }
            });
        });
    }
    
    // Helper functions
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const errorFields = document.querySelectorAll('.error');
        
        errorElements.forEach(element => element.textContent = '');
        errorFields.forEach(field => field.classList.remove('error'));
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldId = field.id;
        
        clearErrors();
        
        switch (fieldId) {
            case 'name':
                if (!value) {
                    showError(fieldId, 'Please enter your name');
                    return false;
                } else if (value.length < 2) {
                    showError(fieldId, 'Name must be at least 2 characters');
                    return false;
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    showError(fieldId, 'Please enter your email');
                    return false;
                } else if (!emailRegex.test(value)) {
                    showError(fieldId, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'message':
                if (!value) {
                    showError(fieldId, 'Please enter your message');
                    return false;
                } else if (value.length < 10) {
                    showError(fieldId, 'Message must be at least 10 characters');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    async function simulateFormSubmission(formData) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real implementation, you would send this to your backend
                console.log('Form data:', formData);
                
                // Simulate success (90% success rate for demo)
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }
    
    // Reveal Animation on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
    
    // Add active navigation state based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinksMenu = document.querySelectorAll('.nav-links a[href^="#"]');
    
    function updateActiveNav() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinksMenu.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call
    
    // Keyboard navigation enhancement
    document.addEventListener('keydown', (e) => {
        // Tab navigation enhancement for better focus management
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    const debouncedScroll = debounce(updateActiveNav, 16); // ~60fps
    window.removeEventListener('scroll', updateActiveNav);
    window.addEventListener('scroll', debouncedScroll);
    
    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to dark mode
    const currentTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    
    // Apply the initial theme
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply new theme
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Add animation effect
            themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 300);
        });
        
        // Keyboard support for theme toggle
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                themeToggle.click();
            }
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
            themeIcon.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
});
