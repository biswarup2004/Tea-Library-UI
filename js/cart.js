
function addToCart(id, name, price, imageUrl) {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        showModal('signin');
        showNotification('Please sign in to add items to cart');
        return;
    }

    console.log("Adding product to cart", id, name, price, imageUrl);
    price = parseFloat(price);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    updateProductButton(id);

    showNotification('Product added to cart!');
}

// Update product button to show quantity controls
function updateProductButton(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItem = cart.find(item => item.id === productId);

    // Find all buttons with this product ID
    const buttons = document.querySelectorAll(`[data-product-id="${productId}"]`);

    buttons.forEach(button => {
        if (cartItem && cartItem.quantity > 0) {
            // Show quantity controls
            button.className = "add-to-cart px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[110px] bg-gray-100 text-gray-800";
            button.innerHTML = `
                <div class="flex items-center justify-between w-full h-full gap-3 quantity-controls">
                    <div class="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center cursor-pointer transition-colors btn-quantity" onclick="event.stopPropagation(); decrementCart(${productId})">−</div>
                    <span class="font-bold text-gray-800 quantity-display">${cartItem.quantity}</span>
                    <div class="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center cursor-pointer transition-colors btn-quantity" onclick="event.stopPropagation(); incrementCart(${productId})">+</div>
                </div>
            `;
        } else {
            // Show add to cart button
            button.className = "add-to-cart px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[110px] bg-primary text-white hover:bg-primary-dark hover:shadow-primary/30";
            button.innerHTML = `<i class="fas fa-plus"></i> Add to Cart`;
        }
    });
}

// Increment quantity in cart
function incrementCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        updateProductButton(productId);
        loadCart();
    }
}

// Decrement quantity in cart
function decrementCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity -= 1;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
            showNotification('Item removed from cart!');
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        updateProductButton(productId);
        loadCart();
    }
}

// Load cart page
function loadCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItems = document.getElementById("cart-items");
    let totalAmount = 0;

    if (!cartItems) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-16 flex flex-col items-center justify-center">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300 text-4xl">
                    <i class="fas fa-shopping-basket"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p class="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <button onclick="showPage('home')" class="btn btn-primary px-8">Start Shopping</button>
            </div>
        `;
        const totalAmountElement = document.getElementById("total-amount");
        if (totalAmountElement) totalAmountElement.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        cartItems.innerHTML += `
            <div class="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-8 transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 group">
                <div class="w-full md:w-32 h-32 flex-shrink-0 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-100 relative overflow-hidden">
                    <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500">
                </div>
                
                <div class="flex-1 w-full text-center md:text-left">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4">
                        <div>
                            <h3 class="font-extrabold text-gray-800 text-xl leading-tight mb-1 font-sans">${item.name}</h3>
                            <p class="text-sm font-medium text-gray-400">Unit Price: <span class="text-gray-600">₹${item.price}</span></p>
                        </div>
                        <div class="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            ₹${itemTotal}
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                         <div class="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                            <button class="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors flex items-center justify-center" onclick="changeQuantity(${index}, -1)">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="font-bold text-gray-800 w-8 text-center text-lg">${item.quantity}</span>
                            <button class="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors flex items-center justify-center" onclick="changeQuantity(${index}, 1)">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                        
                        <button class="text-gray-400 hover:text-red-500 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all text-sm font-semibold group/btn" onclick="removeItem(${index})">
                            <i class="fas fa-trash-alt group-hover/btn:animate-bounce"></i> 
                            <span>Remove</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    const totalAmountElement = document.getElementById("total-amount");
    if (totalAmountElement) {
        totalAmountElement.textContent = totalAmount;
    }
}

// Update cart count badge
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartBadge = document.getElementById("cart-count"); // Updated selector ID based on index.html

    if (cartBadge) {
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        cartBadge.textContent = totalQuantity;

        // Add minimal animation
        cartBadge.classList.remove('scale-100');
        cartBadge.classList.add('scale-125');
        setTimeout(() => {
            cartBadge.classList.remove('scale-125');
            cartBadge.classList.add('scale-100');
        }, 200);
    }
}

// Change quantity from cart page
function changeQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart[index]) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        loadCart();

        // Update all product buttons
        updateAllProductButtons();
    }
}

// Remove item from cart
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = cart[index].id;
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCart();
    updateProductButton(productId);

    showNotification('Item removed from cart!');
}

// Update all product buttons on the page
function updateAllProductButtons() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.forEach(item => {
        updateProductButton(item.id);
    });
}

// Enhanced Checkout function - Redirects to payment page
async function checkout() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        showModal('signin');
        showNotification('Please sign in to proceed with checkout');
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    // Check if we're on a separate cart.html page or SPA
    if (window.location.pathname.includes('cart.html') ||
        window.location.pathname.endsWith('cart.html')) {
        // Redirect to payment page for separate HTML files
        window.location.href = 'payment.html';
    } else {
        // For SPA, check if payment.html exists or use SPA navigation
        try {
            // Try to redirect to payment.html
            window.location.href = 'payment.html';
        } catch (error) {
            // Fallback: show payment modal or use SPA approach
            showNotification('Proceeding to payment...');
            // You can implement a payment modal here as fallback
            console.log('Payment page not found, implement fallback payment modal');
        }
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    loadCart();
    updateCartCount();
    updateAllProductButtons();
});
// [file content end]