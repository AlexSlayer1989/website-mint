function initMobileSlider() {
    const slides = document.querySelectorAll('.mobile-slider .slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = (i === index) ? 'block' : 'none';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    document.querySelector('.next').addEventListener('click', nextSlide);
    document.querySelector('.prev').addEventListener('click', prevSlide);

    showSlide(currentSlide);
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.style.display = 'none');
            tabContents[index].style.display = 'block';
        });
    });
}

function initModal() {
    const modal = document.querySelector('.modal');
    const openModalBtn = document.querySelector('.open-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function applyPromoCode() {
    const promoInput = document.querySelector('#promo-code');
    const applyBtn = document.querySelector('#apply-promo');
    const discountMessage = document.querySelector('#discount-message');

    applyBtn.addEventListener('click', () => {
        const promoCode = promoInput.value;
        if (promoCode === 'SAVE10') {
            discountMessage.textContent = 'Promo code applied! You saved 10%.';
        } else {
            discountMessage.textContent = 'Invalid promo code.';
        }
    });
}

function initQuantityControls() {
    const quantityInput = document.querySelector('#quantity');
    const increaseBtn = document.querySelector('#increase');
    const decreaseBtn = document.querySelector('#decrease');

    increaseBtn.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    decreaseBtn.addEventListener('click', () => {
        quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
    });
}

function initBuyNow() {
    const buyNowBtn = document.querySelector('#buy-now');
    
    buyNowBtn.addEventListener('click', () => {
        alert('Thank you for your purchase!');
    });
}

function initVariants() {
    const variantButtons = document.querySelectorAll('.variant-button');

    variantButtons.forEach(button => {
        button.addEventListener('click', () => {
            variantButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Update the product image or details based on the selected variant
        });
    });
}

// Initialize all features
initMobileSlider();
initTabs();
initModal();
applyPromoCode();
initQuantityControls();
initBuyNow();
initVariants();