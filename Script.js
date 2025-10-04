// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.updateCartCount();
        this.initializeEventListeners();
        this.loadCartItems();
    }

    initializeEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.addToCart(e.target);
            }
            
            if (e.target.classList.contains('customize')) {
                this.openCustomizationModal(e.target);
            }
            
            if (e.target.classList.contains('remove-item')) {
                this.removeItem(e.target.dataset.id);
            }
            
            if (e.target.classList.contains('qty-btn')) {
                this.updateQuantity(e.target);
            }
        });

        // Theme switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-btn')) {
                this.switchTheme(e.target.dataset.theme);
            }
        });

        // Color customization
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-dot') || e.target.classList.contains('color-option')) {
                this.selectColor(e.target);
            }
        });

        // Modal controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                this.closeModal(e.target.closest('.modal'));
            }
            
            if (e.target.id === 'apply-customization') {
                this.applyCustomization();
            }
            
            if (e.target.id === 'checkout-btn') {
                this.openCheckoutModal();
            }
            
            if (e.target.id === 'apply-promo') {
                this.applyPromoCode();
            }
        });

        // Checkout form
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processCheckout();
            });
        }

        // Hamburger menu
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', this.toggleMobileMenu);
        }
    }

    addToCart(button) {
        const product = button.closest('.product');
        const productData = {
            id: Date.now() + Math.random(),
            name: button.dataset.name || product.querySelector('h3').textContent,
            price: parseFloat(button.dataset.price || product.querySelector('.price').textContent.replace('$', '')),
            image: button.dataset.image || product.querySelector('img').src,
            color: this.getSelectedColor(product) || '#8B4513',
            quantity: 1
        };

        // Check if item already exists with same color
        const existingItem = this.items.find(item => 
            item.name === productData.name && item.color === productData.color
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(productData);
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${productData.name} added to cart!`, 'success');
        this.animateCartIcon();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id != itemId);
        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
        this.updateCartSummary();
        this.showNotification('Item removed from cart', 'info');
    }

    updateQuantity(button) {
        const itemId = button.closest('.cart-item').dataset.id;
        const item = this.items.find(item => item.id == itemId);
        
        if (!item) return;

        if (button.textContent === '+') {
            item.quantity += 1;
        } else if (button.textContent === '-' && item.quantity > 1) {
            item.quantity -= 1;
        }

        this.saveCart();
        this.loadCartItems();
        this.updateCartSummary();
    }

    getSelectedColor(product) {
        const selectedColor = product.querySelector('.color-dot.selected');
        return selectedColor ? selectedColor.dataset.color : null;
    }

    selectColor(colorElement) {
        // Remove previous selection
        const container = colorElement.closest('.product, .customization-options');
        container.querySelectorAll('.color-dot, .color-option').forEach(dot => {
            dot.classList.remove('selected');
        });
        
        // Add selection to clicked color
        colorElement.classList.add('selected');
        
        // Update product image tint (visual feedback)
        this.updateProductPreview(colorElement.dataset.color);
    }

    updateProductPreview(color) {
        // Add visual feedback for color selection
        const modal = document.getElementById('customization-modal');
        if (modal && modal.style.display === 'block') {
            modal.style.setProperty('--selected-color', color);
        }
    }

    openCustomizationModal(button) {
        const modal = document.getElementById('customization-modal');
        const product = button.closest('.product');
        
        modal.dataset.productElement = product.dataset.id;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    applyCustomization() {
        const modal = document.getElementById('customization-modal');
        const selectedColor = modal.querySelector('.color-option.selected');
        
        if (!selectedColor) {
            this.showNotification('Please select a color', 'warning');
            return;
        }

        const productId = modal.dataset.productElement;
        const product = document.querySelector(`[data-id="${productId}"]`);
        const addToCartBtn = product.querySelector('.add-to-cart');
        
        // Simulate adding customized product
        const productData = {
            id: Date.now() + Math.random(),
            name: addToCartBtn.dataset.name,
            price: parseFloat(addToCartBtn.dataset.price),
            image: addToCartBtn.dataset.image,
            color: selectedColor.dataset.color,
            quantity: 1,
            customized: true
        };

        this.items.push(productData);
        this.saveCart();
        this.updateCartCount();
        this.closeModal(modal);
        this.showNotification('Customized product added to cart!', 'success');
    }

    switchTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
        
        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        this.showNotification(`Switched to ${theme} theme`, 'info');
    }

    loadCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        cartItemsContainer.style.display = 'block';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item slide-up" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Color: <span style="display: inline-block; width: 15px; height: 15px; background: ${item.color}; border-radius: 50%; vertical-align: middle;"></span></p>
                    ${item.customized ? '<p><em>Customized</em></p>' : ''}
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" readonly>
                    <button class="qty-btn">+</button>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        
        if (!subtotalElement) return;

        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 9.99 : 0;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
        
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.style.display = 'inline-block';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promo-input');
        const promoCode = promoInput.value.trim().toLowerCase();
        
        const validCodes = {
            'welcome10': 0.10,
            'save20': 0.20,
            'birks15': 0.15
        };

        if (validCodes[promoCode]) {
            const discount = validCodes[promoCode];
            this.applyDiscount(discount);
            this.showNotification(`Promo code applied! ${(discount * 100)}% off`, 'success');
            promoInput.value = '';
        } else {
            this.showNotification('Invalid promo code', 'error');
        }
    }

    applyDiscount(discountPercent) {
        // Apply discount logic here
        const subtotalElement = document.getElementById('subtotal');
        const currentSubtotal = parseFloat(subtotalElement.textContent.replace('$', ''));
        const discountAmount = currentSubtotal * discountPercent;
        const newSubtotal = currentSubtotal - discountAmount;
        
        // Update display with discount
        subtotalElement.textContent = `$${newSubtotal.toFixed(2)}`;
        this.updateCartSummary();
    }

    openCheckoutModal() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty', 'warning');
            return;
        }
        
        const modal = document.getElementById('checkout-modal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add event listener for Paystack callback
        window.addEventListener('payment:success', (e) => {
            this.handlePaymentSuccess(e.detail);
        });
    }
    
    async handlePaymentSuccess(paymentData) {
        try {
            // Verify payment with our backend
            const response = await fetch(`http://localhost:5000/api/paystack/verify/${paymentData.reference}`);
            const data = await response.json();
            
            if (data.status && data.data.status === 'success') {
                // Clear cart on successful payment
                this.items = [];
                this.saveCart();
                this.loadCartItems();
                this.updateCartCount();
                this.closeModal(document.getElementById('checkout-modal'));
                
                // Show success message
                this.showNotification('Payment successful! Your order has been placed.', 'success');
                
                // Redirect to thank you page or home
                setTimeout(() => {
                    window.location.href = 'Home.html?order=success';
                }, 2000);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            this.showNotification('Payment verification failed. Please contact support.', 'error');
        }
    }

    async processCheckout() {
        try {
            const email = document.getElementById('checkout-email').value;
            const phone = document.getElementById('checkout-phone').value;
            const address = document.getElementById('checkout-address').value;
            const city = document.getElementById('checkout-city').value;
            const postalCode = document.getElementById('checkout-postal').value;
            const totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);

            if (!email || !phone || !address || !city || !postalCode) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }

            const orderId = 'BIRK' + Date.now();
            const metadata = {
                orderId,
                items: this.items,
                shippingAddress: `${address}, ${city}, ${postalCode}`,
                phone
            };

            // Show loading state
            const submitBtn = document.getElementById('place-order-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            try {
                // Initialize Paystack payment
                const response = await fetch('http://localhost:5000/api/paystack/initialize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        amount: totalAmount,
                        metadata
                    })
                });

                const data = await response.json();

                if (data.status) {
                    // Redirect to Paystack payment page
                    window.location.href = data.data.authorization_url;
                } else {
                    throw new Error(data.message || 'Failed to initialize payment');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                this.showNotification('Failed to process payment: ' + error.message, 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            this.showNotification('An unexpected error occurred. Please try again.', 'error');
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('mobile-active');
    }

    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    animateCartIcon() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 200);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '3000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the shopping cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cart = new ShoppingCart();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme') || 'blue';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeBtn = document.querySelector(`[data-theme="${savedTheme}"]`);
    if (themeBtn) {
        themeBtn.classList.add('active');
    }

    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all products for animation
    document.querySelectorAll('.product').forEach(product => {
        observer.observe(product);
    });

    // Add loading states to buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart') || 
            e.target.classList.contains('checkout-btn') || 
            e.target.classList.contains('place-order-btn')) {
            
            const originalText = e.target.textContent;
            e.target.textContent = 'Loading...';
            e.target.disabled = true;
            
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.disabled = false;
            }, 1000);
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            cart.closeModal(e.target);
        }
    });

    // Handle escape key for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                cart.closeModal(openModal);
            }
        }
    });
});
