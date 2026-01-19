let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let currentSlideIndex = 0;
// totalSlides will be calculated dynamically


// Utility function to get first name only
function getFirstName(fullName) {
    if (!fullName) return 'User';
    // Split by space and take first part only
    return fullName.split(' ')[0];
}

// Carousel functionality
function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;

    if (totalSlides === 0) return;

    slides[currentSlideIndex].classList.remove('active');
    if (indicators[currentSlideIndex]) indicators[currentSlideIndex].classList.remove('active');

    currentSlideIndex += direction;

    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }

    slides[currentSlideIndex].classList.add('active');
    if (indicators[currentSlideIndex]) indicators[currentSlideIndex].classList.add('active');
}

function currentSlide(slideIndex) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;

    if (slideIndex > totalSlides || slideIndex < 1) return;

    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    currentSlideIndex = slideIndex - 1;

    if (slides[currentSlideIndex]) slides[currentSlideIndex].classList.add('active');
    if (indicators[currentSlideIndex]) indicators[currentSlideIndex].classList.add('active');
}

function startCarouselAutoPlay() {
    setInterval(() => {
        changeSlide(1);
    }, 1000);
}

// Enhanced page navigation with history management
function showPage(pageId) {
    console.log('Showing page:', pageId);

    // Add to browser history
    if (history.pushState) {
        history.pushState({ page: pageId }, '', `#${pageId}`);
    }

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block';

        // Scroll to top when changing pages
        window.scrollTo(0, 0);

        // Load specific page content
        if (pageId === 'cart') {
            loadCart();
        } else if (pageId === 'profile') {
            loadUserProfile();
        } else if (pageId === 'orders') {
            loadUserOrders();
        } else if (pageId === 'home') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
            }
            showAllSections();
        }
    }
}

// Handle browser back button
window.addEventListener('popstate', function (event) {
    const pageId = event.state ? event.state.page : 'home';
    showPage(pageId);
});

// Handle initial page load with hash
function handleInitialPageLoad() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'cart', 'profile', 'orders'];

    if (hash && validPages.includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
        // Set initial history state
        if (history.replaceState) {
            history.replaceState({ page: 'home' }, '', '#home');
        }
    }
}

// Back navigation function
function goBack() {
    // Use history back or navigate to home
    if (history.length > 1) {
        history.back();
    } else {
        showPage('home');
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.classList.remove('opacity-0', 'invisible');
        modal.classList.add('opacity-100', 'visible');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.classList.remove('opacity-100', 'visible');
        modal.classList.add('opacity-0', 'invisible');
    }
}

// User dropdown functionality
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    const profileDropdown = document.querySelector('.user-profile-dropdown');

    if (dropdown && profileDropdown) {
        // Toggle visibility classes for dropdown
        if (dropdown.classList.contains('opacity-0')) {
            dropdown.classList.remove('opacity-0', 'invisible', 'translate-y-2');
            dropdown.classList.add('opacity-100', 'visible', 'translate-y-0');
        } else {
            dropdown.classList.add('opacity-0', 'invisible', 'translate-y-2');
            dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
        }

        // Toggle active state for profile item styling
        profileDropdown.classList.toggle('bg-gray-100');
    }
}

// Enhanced Authentication functions
function setupAuthForms() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    if (signinForm) {
        signinForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            if (email && password) {
                try {
                    const result = await loginUser({ email, password });

                    // Store user data and token
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    localStorage.setItem('token', result.token);

                    currentUser = result.user;
                    updateAuthUI();
                    closeModal('signin');
                    showNotification(`Welcome back, ${getFirstName(result.user.name)}!`);

                    // Clear form
                    signinForm.reset();
                } catch (error) {
                    showNotification(error.message || 'Login failed. Please try again.');
                }
            }
        });
    }


    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            if (name && email && password) {
                try {
                    const result = await registerUser({ name, email, password });

                    // Store user data and token
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    localStorage.setItem('token', result.token);

                    currentUser = result.user;
                    updateAuthUI();
                    closeModal('signup');
                    showNotification(`Welcome to 𝗕𝗶𝘁𝘆 𝗞𝗮𝗿𝘁, ${getFirstName(result.user.name)}!`);

                    // Clear form
                    signupForm.reset();
                } catch (error) {
                    showNotification(error.message || 'Registration failed. Please try again.');
                }
            }
        });
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    updateAuthUI();
    updateCartCount();
    loadCart();
    updateAllProductButtons();
    showNotification('Logged out successfully!');

    const currentPage = document.querySelector('.page.active');
    if (currentPage && (currentPage.id === 'profile' || currentPage.id === 'orders')) {
        showPage('home');
    }
}

function updateAuthUI() {
    // Re-fetch current user to ensure we have the latest state
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    } else {
        currentUser = null;
    }

    // Debug log to help track auth state
    console.log('Updating Auth UI. User:', currentUser ? currentUser.name : 'Guest');

    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');

    // Mobile elements
    const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
    const mobileUserMenu = document.getElementById('mobile-user-menu');

    if (currentUser) {
        // Desktop
        if (authButtons) {
            authButtons.style.setProperty('display', 'none', 'important');
            authButtons.classList.add('hidden');
            authButtons.classList.remove('flex');
        }
        if (userMenu) {
            userMenu.style.display = 'block';
            userMenu.classList.remove('hidden');
        }
        if (userName) {
            const firstName = getFirstName(currentUser.name);
            userName.textContent = `Hi, ${firstName}!`;
        }

        // Mobile
        if (mobileAuthButtons) {
            mobileAuthButtons.style.setProperty('display', 'none', 'important');
            mobileAuthButtons.classList.add('hidden');
            mobileAuthButtons.classList.remove('flex');
        }
        if (mobileUserMenu) {
            mobileUserMenu.classList.remove('hidden');
        }

        updateProfileInfo(currentUser);
    } else {
        // Desktop
        if (authButtons) {
            authButtons.style.display = 'flex';
            authButtons.classList.remove('hidden');
            authButtons.classList.add('flex');
        }
        if (userMenu) {
            userMenu.style.display = 'none';
            userMenu.classList.add('hidden');
        }

        // Mobile
        if (mobileAuthButtons) {
            mobileAuthButtons.style.display = 'flex';
            mobileAuthButtons.classList.remove('hidden');
            mobileAuthButtons.classList.add('flex');
        }
        if (mobileUserMenu) {
            mobileUserMenu.classList.add('hidden');
        }
    }
}

function updateProfileInfo(user) {
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayEmail = document.getElementById('profile-display-email');
    const detailName = document.getElementById('detail-name');
    const detailEmail = document.getElementById('detail-email');

    // Show only first name in profile display
    const firstName = getFirstName(user.name);
    if (profileDisplayName) profileDisplayName.textContent = firstName;
    if (profileDisplayEmail) profileDisplayEmail.textContent = user.email;
    if (detailName) detailName.textContent = user.name; // Keep full name in details
    if (detailEmail) detailEmail.textContent = user.email;

    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');

    // Show only first name in dropdown
    if (profileName) profileName.textContent = firstName;
    if (profileEmail) profileEmail.textContent = user.email;
}

// Load user profile from backend
async function loadUserProfile() {
    // Show loading state
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayEmail = document.getElementById('profile-display-email');
    const detailName = document.getElementById('detail-name');
    const detailEmail = document.getElementById('detail-email');

    // Helper to set loading
    const setLoading = (el) => { if (el) el.innerHTML = '<span class="animate-pulse">Loading...</span>'; };
    setLoading(profileDisplayName);
    setLoading(profileDisplayEmail);
    setLoading(detailName);
    setLoading(detailEmail);

    try {
        const user = await getUserProfile();
        updateProfileInfo(user);

        // Update profile stats if needed
        const statNumber = document.querySelector('.stat-number');
        if (statNumber) {
            // You can fetch actual order count from backend here, for now placeholder
            statNumber.textContent = '0';
        }
    } catch (error) {
        showNotification(error.message || 'Failed to load profile data');
        console.error('Profile load error:', error);

        // Use local data as fallback if available, but communicate the error
        if (currentUser) {
            updateProfileInfo(currentUser);
            showNotification('Using offline data: ' + error.message);
        } else {
            if (profileDisplayName) profileDisplayName.textContent = 'Error: ' + error.message;
            if (profileDisplayEmail) profileDisplayEmail.textContent = 'Please sign in again';
            if (detailName) detailName.textContent = 'Failed to load';
            if (detailEmail) detailEmail.textContent = 'Failed to load';
        }
    }
}

// Load user orders from backend
async function loadUserOrders() {
    const ordersContainer = document.querySelector('.orders-container');
    if (ordersContainer) {
        ordersContainer.innerHTML = `
            <div class="text-center py-20 flex flex-col items-center justify-center">
                <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-gray-400">Loading your orders... Please wait...</p>
            </div>
        `;
    }

    try {
        const orders = await getUserOrders();
        displayOrders(orders);
    } catch (error) {
        showNotification(error.message || 'Failed to load orders');
        console.error('Orders load error:', error);

        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="text-center py-16 bg-white rounded-3xl shadow-sm border border-red-100">
                    <div class="mb-4 text-red-300 text-6xl"><i class="fas fa-exclamation-circle"></i></div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Could not load orders</h3>
                    <p class="text-gray-500 mb-6 font-mono text-sm bg-gray-50 inline-block px-2 py-1 rounded">Error: ${error.message}</p>
                    <div>
                        <button class="btn btn-outline mx-auto" onclick="loadUserOrders()">
                            <i class="fas fa-sync-alt"></i> Try Again
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

function displayOrders(orders) {
    const ordersContainer = document.querySelector('.orders-container');
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div class="mb-4 text-gray-300 text-6xl"><i class="fas fa-box-open"></i></div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
                <p class="text-gray-500 mb-6">Looks like you haven't placed an order yet.</p>
                <button class="btn btn-primary mx-auto" onclick="showPage('home')">Start Shopping</button>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => {
        let orderItemsHtml = '';

        if (order.orderItems && order.orderItems.length > 0) {
            orderItemsHtml = order.orderItems.map(item => {
                console.log('Order Item:', item); // Debugging

                // Flexible Price Logic
                let unitPrice = item.price;
                if (unitPrice === undefined || unitPrice === null) unitPrice = item.unitPrice;
                if ((unitPrice === undefined || unitPrice === null) && item.product) unitPrice = item.product.price;
                unitPrice = parseFloat(unitPrice) || 0;

                const itemTotal = unitPrice * item.quantity;

                // Flexible Image Logic
                let imageUrl = item.imageUrl;
                if (!imageUrl && item.product) imageUrl = item.product.imageUrl;
                if (!imageUrl) imageUrl = 'img/placeholder.png';

                // Flexible Name Logic
                let productName = item.productName;
                if (!productName && item.product) productName = item.product.name;
                if (!productName) productName = 'Product';

                return `
                <div class="flex items-start gap-4 mb-4 pb-4 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                    <div class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border border-gray-100 flex-shrink-0">
                        <img src="${imageUrl}" class="w-full h-full object-contain" onerror="this.src='img/placeholder.png'">
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 text-base mb-1">${productName}</h4>
                        <p class="text-xs text-gray-500 mb-1">Unit Price: ₹${unitPrice} × ${item.quantity}</p>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-gray-800">₹${itemTotal}</div>
                    </div>
                </div>
                `;
            }).join('');
        } else {
            orderItemsHtml = `<p class="text-gray-400 italic">No items found for this order.</p>`;
        }

        return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all mb-6">
            <div class="p-5 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
                <div class="flex gap-4 items-center">
                    <div>
                        <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order ID</div>
                        <div class="font-mono font-bold text-gray-800 text-lg">#BK${order.id}</div>
                    </div>
                    <div class="hidden sm:block w-px h-8 bg-gray-200"></div>
                     <div class="hidden sm:block">
                        <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Date</div>
                        <div class="text-gray-700 text-sm"><i class="far fa-calendar-alt mr-1"></i> ${new Date(order.orderDate).toLocaleDateString()}</div>
                    </div>
                </div>
                <div>
                     <span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
            }">
                        ${order.status || 'Processing'}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <div class="mb-4">
                    ${orderItemsHtml}
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                    <div class="text-sm text-gray-500">${order.orderItems ? order.orderItems.length : 0} item(s)</div>
                    <div class="text-right flex items-center gap-3">
                        <span class="text-gray-500 text-sm font-medium">Total:</span>
                        <span class="text-2xl font-black text-primary">₹${order.totalAmount}</span>
                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <button class="btn btn-outline py-2 px-6 text-sm flex items-center gap-2" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn btn-primary py-2 px-6 text-sm flex items-center gap-2" onclick="reorder(${order.id})">
                        <i class="fas fa-redo"></i> Reorder
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function viewOrderDetails(orderId) {
    showNotification('Order details functionality coming soon!');
}

function reorder(orderId) {
    showNotification('Reorder functionality coming soon!');
}

function showSettings() {
    showNotification('Settings functionality coming soon!');
    toggleUserDropdown();
}

function editProfile() {
    showNotification('Edit profile functionality coming soon!');
}

// Enhanced mobile menu functionality
// Enhanced mobile menu functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');

    function toggleMenu() {
        if (!mobileMenu || !mobileOverlay) return;

        const isClosed = mobileMenu.classList.contains('-translate-x-full');

        if (isClosed) {
            // Open menu
            mobileMenu.classList.remove('-translate-x-full');
            mobileOverlay.classList.remove('opacity-0', 'invisible');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            // Close menu
            mobileMenu.classList.add('-translate-x-full');
            mobileOverlay.classList.add('opacity-0', 'invisible');
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            toggleMenu();
        });
    }

    // Close menu when clicking links
    if (mobileMenu) {
        const links = mobileMenu.querySelectorAll('a, button');
        links.forEach(link => {
            if (!link.classList.contains('close-menu-btn')) {
                link.addEventListener('click', () => {
                    // Slight delay to allow animations/handlers to run
                    setTimeout(() => {
                        mobileMenu.classList.add('-translate-x-full');
                        mobileOverlay.classList.add('opacity-0', 'invisible');
                        document.body.style.overflow = '';
                    }, 100);
                });
            }
        });
    }
}

// Enhanced mobile search functionality
function setupMobileSearch() {
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');

    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', function () {
            showMobileSearch();
        });
    }
}

function showMobileSearch() {
    // Create mobile search overlay using Tailwind classes
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'fixed inset-0 bg-black/95 z-[60] flex flex-col p-6 animate-[fadeIn_0.3s_ease] mobile-search-overlay';

    searchOverlay.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h3 class="text-white text-2xl font-bold">Search Products</h3>
            <button class="text-gray-400 hover:text-white text-3xl transition-colors close-search">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="flex gap-3 mb-6">
            <input type="text" class="flex-1 p-4 rounded-2xl border-2 border-gray-700 bg-gray-800 text-white focus:border-primary focus:outline-none transition-all text-lg" placeholder="Search products..." id="mobile-search-input">
            <button class="p-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20" id="mobile-search-confirm">
                <i class="fas fa-search text-xl"></i>
            </button>
        </div>
        
        <div id="mobile-search-results" class="flex-1 overflow-y-auto bg-gray-900 rounded-2xl p-4 border border-gray-800 custom-scrollbar"></div>
    `;

    document.body.appendChild(searchOverlay);

    const searchInput = searchOverlay.querySelector('#mobile-search-input');
    const closeBtn = searchOverlay.querySelector('.close-search');
    const searchBtn = searchOverlay.querySelector('#mobile-search-confirm');
    const resultsContainer = searchOverlay.querySelector('#mobile-search-results');

    // Focus on input
    setTimeout(() => searchInput.focus(), 100);

    // Event handlers
    function closeSearch() {
        searchOverlay.classList.add('opacity-0');
        setTimeout(() => searchOverlay.remove(), 300);
    }

    closeBtn.addEventListener('click', closeSearch);

    searchBtn.addEventListener('click', function () {
        performMobileSearch(searchInput.value, resultsContainer);
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performMobileSearch(searchInput.value, resultsContainer);
        }
    });

    // Close on overlay background click
    searchOverlay.addEventListener('click', function (e) {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
}

function performMobileSearch(searchTerm, resultsContainer) {
    if (!searchTerm.trim()) {
        resultsContainer.innerHTML = '<div class="text-center text-gray-500 py-10">Please enter a search term</div>';
        return;
    }

    const allProducts = document.querySelectorAll('.product-card');
    const matchedProducts = [];

    allProducts.forEach(card => {
        const title = card.querySelector('.product-title');
        const description = card.querySelector('.product-description');

        if (title && description) {
            const titleText = title.textContent.toLowerCase();
            const descText = description.textContent.toLowerCase();

            if (titleText.includes(searchTerm.toLowerCase()) || descText.includes(searchTerm.toLowerCase())) {
                const clone = card.cloneNode(true);
                // Adjust properties for mobile list view: horizontal layout, smaller image
                clone.className = "bg-white p-3 rounded-xl flex gap-3 items-center mb-3 shadow-sm";

                // Style image
                const img = clone.querySelector('img');
                if (img) {
                    img.className = "w-16 h-16 object-contain bg-gray-50 rounded-lg p-1";
                }

                // Style content container
                const info = clone.querySelector('.product-info');
                if (info) {
                    info.className = "flex-1 min-w-0";
                }

                // Style title
                const prodTitle = clone.querySelector('.product-title');
                if (prodTitle) {
                    prodTitle.className = "font-bold text-gray-800 text-sm truncate";
                }

                // Hide description for compactness
                const prodDesc = clone.querySelector('.product-description');
                if (prodDesc) {
                    prodDesc.style.display = 'none';
                }

                // Style bottom section (price + button)
                const bottom = clone.querySelector('.product-bottom-section');
                if (bottom) {
                    bottom.className = "flex justify-between items-center mt-1";
                }

                const price = clone.querySelector('.product-price');
                if (price) {
                    price.className = "font-black text-primary";
                }

                matchedProducts.push(clone);
            }
        }
    });

    if (matchedProducts.length === 0) {
        resultsContainer.innerHTML = '<div class="text-center text-gray-500 py-10">No products found matching your search.</div>';
    } else {
        resultsContainer.innerHTML = `
            <h4 class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Found ${matchedProducts.length} results</h4>
            <div class="space-y-2"></div>
        `;
        const listContainer = resultsContainer.querySelector('div.space-y-2');
        matchedProducts.forEach(product => listContainer.appendChild(product));

        // Reattach event listeners to the cloned product cards
        setTimeout(() => {
            if (typeof updateAllProductButtons === 'function') {
                updateAllProductButtons();
            }
        }, 100);
    }
}

// Search functionality
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        showAllSections();
        return;
    }

    hideAllSections();
    showSearchResults(searchTerm);
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        carousel.style.display = 'none';
    }

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.display = 'none';
    }
}

function showAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'block';
    });

    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        carousel.style.display = 'block';
    }

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.display = 'block';
    }

    const searchResults = document.getElementById('search-results-section');
    if (searchResults) {
        searchResults.remove();
    }
}

function showSearchResults(searchTerm) {
    const existingResults = document.getElementById('search-results-section');
    if (existingResults) {
        existingResults.remove();
    }

    const allProducts = document.querySelectorAll('.product-card');
    const matchedProducts = [];

    allProducts.forEach(card => {
        const title = card.querySelector('.product-title');
        const description = card.querySelector('.product-description');

        if (title && description) {
            const titleText = title.textContent.toLowerCase();
            const descText = description.textContent.toLowerCase();

            if (titleText.includes(searchTerm) || descText.includes(searchTerm)) {
                let category = 'Trending';
                const parent = card.closest('[id*="products"]');
                if (parent) {
                    if (parent.id.includes('tea')) category = 'Tea';
                    else if (parent.id.includes('coffee')) category = 'Coffee';
                    else if (parent.id.includes('chips')) category = 'Snacks';
                    else if (parent.id.includes('colddrinks')) category = 'Beverages';
                    else if (parent.id.includes('dryfruits')) category = 'Dry Fruits';
                    else if (parent.id.includes('salt')) category = 'Salt';
                    else if (parent.id.includes('sugar')) category = 'Sugar';
                }

                matchedProducts.push({
                    element: card.cloneNode(true),
                    category: category
                });
            }
        }
    });

    const searchSection = document.createElement('section');
    searchSection.className = 'py-16 bg-white min-h-[60vh]';
    searchSection.id = 'search-results-section';

    const container = document.createElement('div');
    container.className = 'container mx-auto px-4';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = `Search Results for "${searchTerm}"`;

    const subtitle = document.createElement('p');
    subtitle.className = 'text-center text-gray-500 mb-12 -mt-8';
    subtitle.textContent = `${matchedProducts.length} products found`;

    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8';

    matchedProducts.forEach(product => {
        const productWrapper = document.createElement('div');
        productWrapper.className = 'relative group';

        const categoryLabel = document.createElement('div');
        categoryLabel.textContent = product.category;
        categoryLabel.className = 'absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md';

        const clonedCard = product.element.cloneNode(true);
        // Ensure card fills wrapper
        clonedCard.classList.remove('h-full');
        clonedCard.classList.add('h-full');

        productWrapper.appendChild(categoryLabel);
        productWrapper.appendChild(clonedCard);
        resultsGrid.appendChild(productWrapper);
    });

    if (matchedProducts.length === 0) {
        resultsGrid.innerHTML = `
            <div class="col-span-full text-center py-10">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                <p class="text-gray-500">Try searching for something else like "Tea" or "Coffee"</p>
                <button onclick="showAllSections()" class="mt-6 btn btn-outline mx-auto">Clear Search</button>
            </div>
        `;
        // Make sure the grid display is cleaner for single item
        resultsGrid.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
        resultsGrid.classList.add('flex', 'justify-center', 'items-center', 'w-full');
    }

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(resultsGrid);
    searchSection.appendChild(container);

    const homePage = document.getElementById('home');
    if (homePage) {
        homePage.insertBefore(searchSection, homePage.firstChild);
    }

    // Update buttons in search results
    updateAllProductButtons();
}

// Notification system
function showNotification(message) {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'custom-notification fixed top-24 right-4 bg-emerald-500 text-white px-6 py-4 rounded-xl z-[100] shadow-xl shadow-emerald-500/30 flex items-center gap-3 animate-[slideInRight_0.3s_ease] max-w-sm';

    notification.innerHTML = `
        <div class="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-check"></i>
        </div>
        <p class="font-medium text-sm leading-tight">${message}</p>
    `;

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0', 'transition-all', 'duration-300');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('user-dropdown');
    const profileDropdown = document.querySelector('.user-profile-dropdown');

    if (dropdown && profileDropdown && !profileDropdown.contains(e.target) && !dropdown.contains(e.target)) {
        if (dropdown.classList.contains('visible')) {
            dropdown.classList.add('opacity-0', 'invisible', 'translate-y-2');
            dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
            profileDropdown.classList.remove('bg-gray-100');
        }
    }

    // Close modal if clicked on backdrop
    if (e.target.id && e.target.id.endsWith('-modal')) {
        e.target.classList.remove('opacity-100', 'visible');
        e.target.classList.add('opacity-0', 'invisible');
    }
});

// Handle escape key for navigation and closing modals
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        // Close any open modals
        const openModals = document.querySelectorAll('[id$="-modal"].visible');
        openModals.forEach(modal => {
            modal.classList.remove('opacity-100', 'visible');
            modal.classList.add('opacity-0', 'invisible');
        });

        goBack();
    }
});

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setupAuthForms();
    updateAuthUI();
    updateCartCount();
    setupMobileMenu();
    setupMobileSearch();
    handleInitialPageLoad();

    startCarouselAutoPlay();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });

        searchInput.addEventListener('input', function (e) {
            if (e.target.value.trim() === '') {
                showAllSections();
            }
        });
    }

    // Load initial data
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
    if (typeof loadCart === 'function') {
        loadCart();
    }

    console.log('Mobile navigation initialized');
});