/* ==================================================
 * Seowoo Construction Landing Page Interactive Engine
 * ================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initScrollReveal();
    init3DTilt();
    initContactForm();
});

/* -----------------------------------------
 * 1. Navigation & Scroll Effects
 * ----------------------------------------- */
function initNavigation() {
    const nav = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

/* -----------------------------------------
 * 2. Mobile Menu Toggle
 * ----------------------------------------- */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBackdrop = document.getElementById('menu-backdrop');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function openMenu() {
        mobileMenu.classList.remove('hidden');
        menuBackdrop.classList.remove('hidden');
        // Let browser register display change, then slide in
        setTimeout(() => {
            mobileMenu.classList.remove('translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden'; // Lock body scroll
    }

    function closeMenu() {
        mobileMenu.classList.add('translate-x-full');
        menuBackdrop.classList.add('hidden');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
        document.body.style.overflow = ''; // Unlock body scroll
    }

    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

/* -----------------------------------------
 * 3. 3D Scroll Reveal Animation (Intersection Observer)
 * ----------------------------------------- */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observerOptions = {
        root: null, // Viewport
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters screen
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/* -----------------------------------------
 * 4. Premium 3D Card Tilt Effect
 * ----------------------------------------- */
function init3DTilt() {
    // Disable 3D tilt on devices that support touch (mobile/tablet) to prevent layout issues
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Calculate mouse coordinates relative to the card center
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Maximum tilt angle (in degrees)
            const maxTilt = 12;
            
            // Compute rotation based on distance from center
            const rotateX = ((centerY - y) / centerY) * maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            // Apply 3D perspective rotation and scaling
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
            
            // Subtly adjust shadow direction for dynamic depth
            const shadowX = (centerX - x) * 0.15;
            const shadowY = (centerY - y) * 0.15;
            card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 30px rgba(0, 81, 87, 0.2)`;
        });

        // Reset card state when mouse leaves
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.boxShadow = '';
        });
    });
}

/* -----------------------------------------
 * 5. Web3Forms Email Submission Handler
 * ----------------------------------------- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('btn-spinner');
    const successModal = document.getElementById('success-modal');
    const successModalCard = successModal.querySelector('div.relative');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function showSuccessModal() {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
        // Tiny timeout to trigger CSS transition smoothly
        setTimeout(() => {
            successModal.classList.add('show');
            successModalCard.classList.remove('scale-95', 'opacity-0');
            successModalCard.classList.add('scale-100', 'opacity-100');
        }, 50);
    }

    function hideSuccessModal() {
        successModalCard.classList.remove('scale-100', 'opacity-100');
        successModalCard.classList.add('scale-95', 'opacity-0');
        successModal.classList.remove('show');
        setTimeout(() => {
            successModal.classList.remove('flex');
            successModal.classList.add('hidden');
        }, 300);
    }

    closeModalBtn.addEventListener('click', hideSuccessModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Enter Loading State
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.innerText;
        btnText.innerText = "전송 중...";

        // Get Form Data
        const formData = new FormData(form);
        const accessKey = formData.get('access_key');

        // 2. Access Key Check & Simulation Fallback for Local Testing
        if (accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE' || !accessKey) {
            console.warn("[Web3Forms Warning] Access Key가 세팅되지 않았습니다. 메일 발송 기능 시뮬레이션을 진행합니다.");
            setTimeout(() => {
                // Reset loading state
                spinner.classList.add('hidden');
                submitBtn.disabled = false;
                btnText.innerText = originalText;

                // Show visual success response
                showSuccessModal();
                form.reset();
            }, 1200);
            return;
        }

        // Convert Form Data to JSON object for Web3Forms API
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        // 3. Make real fetch request to Web3Forms API
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            let res = await response.json();
            if (response.status === 200) {
                showSuccessModal();
                form.reset();
            } else {
                console.error("Web3Forms API Error:", res);
                alert("문의 접수 중 오류가 발생했습니다: " + (res.message || "서버 응답 오류"));
            }
        })
        .catch(error => {
            console.error("Network Error:", error);
            alert("인터넷 연결이 불안정하거나 네트워크 오류가 발생했습니다.");
        })
        .finally(() => {
            // Restore button state
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
            btnText.innerText = originalText;
        });
    });
}
