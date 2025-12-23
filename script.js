document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));
    const saveWishlist = () => localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // --- UI Injection ---
    // Inject Sidebar HTML
    const sidebarHTML = `
        <div class="sidebar-overlay"></div>
        <div class="sidebar" id="cart-sidebar">
            <div class="sidebar-header">
                <h3 class="heading-md" style="margin:0">Your Cart</h3>
                <div class="sidebar-close"><i class="fas fa-times"></i></div>
            </div>
            <div class="sidebar-content" id="cart-items">
                <!-- Items go here -->
            </div>
            <div class="sidebar-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cart-total-price">₹ 0</span>
                </div>
                <button class="btn btn-primary" style="width: 100%;">Order Now</button>
            </div>
        </div>
        
        <div class="sidebar" id="wishlist-sidebar">
            <div class="sidebar-header">
                <h3 class="heading-md" style="margin:0">Wishlist</h3>
                <div class="sidebar-close"><i class="fas fa-times"></i></div>
            </div>
            <div class="sidebar-content" id="wishlist-items">
                <!-- Items go here -->
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    // --- DOM Elements ---
    const overlay = document.querySelector('.sidebar-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');
    const wishlistItemsContainer = document.getElementById('wishlist-items');

    // Setup Nav Icons with Badges if they exist, otherwise we need to rely on the updated HTML having them
    // or we can inject them too, but it's safer to update HTML. For now assuming HTML updates come next.

    // --- Functions ---

    const updateBadges = () => {
        const cartCount = document.getElementById('cart-count');
        const wishlistCount = document.getElementById('wishlist-count');
        if (cartCount) cartCount.textContent = cart.length;
        if (wishlistCount) wishlistCount.textContent = wishlist.length;
    };

    const openSidebar = (sidebar) => {
        overlay.classList.add('active');
        sidebar.classList.add('active');
    };

    const closeSidebars = () => {
        overlay.classList.remove('active');
        cartSidebar.classList.remove('active');
        wishlistSidebar.classList.remove('active');
    };

    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding-top:2rem; color:var(--text-secondary);">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                // Defensive check for invalid data
                if (!item) return;
                // Use Number() to safely parse both numbers and numeric strings
                const price = Number(item.price) || 0;
                total += price;
                const html = `
                    <div class="cart-item">
                        <img src="${item.image || 'assets/images/watch1.png'}" alt="${item.name || 'Product'}">
                        <div class="cart-item-info">
                            <h4 style="font-size:1rem; margin-bottom:0.2rem;">${item.name || 'Unknown Item'}</h4>
                            <p class="text-gold" style="font-size:0.9rem;">₹ ${price.toLocaleString()}</p>
                            <button class="remove-cart-btn" data-index="${index}" style="background:none; border:none; color:#666; font-size:0.8rem; cursor:pointer; margin-top:0.5rem; text-decoration:underline;">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', html);
            });
        }
        cartTotalEl.textContent = `₹ ${total.toLocaleString()}`;

        // Bind remove buttons
        document.querySelectorAll('.remove-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);
                saveCart();
                renderCart();
                updateBadges();
            });
        });
    };

    const renderWishlist = () => {
        wishlistItemsContainer.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = '<p style="text-align:center; padding-top:2rem; color:var(--text-secondary);">Your wishlist is empty.</p>';
        } else {
            wishlist.forEach((item, index) => {
                const html = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4 style="font-size:1rem; margin-bottom:0.2rem;">${item.name}</h4>
                            <p class="text-gold" style="font-size:0.9rem;">₹ ${item.price.toLocaleString()}</p>
                            <div style="display:flex; gap:1rem; margin-top:0.5rem;">
                                 <button class="move-to-cart-btn" data-index="${index}" style="background:none; border:none; color:var(--text-main); font-size:0.8rem; cursor:pointer;">Add to Cart</button>
                                 <button class="remove-wishlist-btn" data-index="${index}" style="background:none; border:none; color:#666; font-size:0.8rem; cursor:pointer;">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
                wishlistItemsContainer.insertAdjacentHTML('beforeend', html);
            });
        }

        // Bind buttons
        document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                wishlist.splice(index, 1);
                saveWishlist();
                renderWishlist();
                updateBadges();
                updateHeartIcons(); // Update the heart icons on the page
            });
        });

        document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                const item = wishlist[index];
                cart.push(item);
                wishlist.splice(index, 1);
                saveCart();
                saveWishlist();
                renderWishlist();
                renderCart();
                updateBadges();
                updateHeartIcons();
                openSidebar(cartSidebar);
            });
        });
    };

    // --- Interaction Logic ---

    // Add to Cart Buttons in Grid
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const card = e.target.closest('.product-card');
            const name = card.querySelector('h3').textContent;

            // Use dataset for reliable price extraction (fixes NaN issue caused by selecting wrong element)
            const price = parseFloat(card.dataset.price);
            const image = card.querySelector('img').src;

            cart.push({ name, price, image });
            saveCart();
            renderCart();
            updateBadges();
            openSidebar(cartSidebar);
        }

        // Toggle Wishlist
        if (e.target.closest('.wishlist-btn')) {
            const btn = e.target.closest('.wishlist-btn');
            const card = btn.closest('.product-card');
            const name = card.querySelector('h3').textContent;

            const existingIndex = wishlist.findIndex(item => item.name === name);
            if (existingIndex > -1) {
                wishlist.splice(existingIndex, 1);
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            } else {
                // Use dataset for reliable price extraction
                const price = parseFloat(card.dataset.price);
                const image = card.querySelector('img').src;
                wishlist.push({ name, price, image });
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            saveWishlist();
            renderWishlist();
            updateBadges();
        }

        // Nav Icons (Delegated or bind later if static)
        if (e.target.closest('#cart-btn')) {
            renderCart();
            openSidebar(cartSidebar);
        }
        if (e.target.closest('#wishlist-btn')) {
            renderWishlist();
            openSidebar(wishlistSidebar);
        }

        // Close sidebar
        if (e.target.closest('.sidebar-close') || e.target === overlay) {
            closeSidebars();
        }
    });

    // Helper to update hearts on page load or change
    const updateHeartIcons = () => {
        document.querySelectorAll('.product-card').forEach(card => {
            const name = card.querySelector('h3').textContent;
            const btn = card.querySelector('.wishlist-btn');
            if (btn) {
                if (wishlist.some(item => item.name === name)) {
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                }
            }
        });
    };


    // Mobile Menu Logic (Existing)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = '#0a0a0a';
                navLinks.style.padding = '2rem';
                navLinks.style.zIndex = '99';
            }
        });
    }

    // Scroll Animations (Existing)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // --- Dynamic Product Generation & Rendering ---

    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const productGrid = document.getElementById('product-grid');

    // 1. Define Initial Manual Products (Data from original HTML)
    const manualProducts = [
        { name: "Midnight Chronograph", category: "premium", price: 24999, image: "assets/images/watch1.png", style: "" },
        { name: "Royal Merit", category: "premium", price: 18500, image: "assets/images/watch2.png", style: "" },
        { name: "Urban Daily", category: "budget", price: 4999, image: "assets/images/watch1.png", style: "filter: grayscale(100%);" },
        { name: "Classic Minimalist", category: "budget", price: 6500, image: "assets/images/watch2.png", style: "filter: sepia(50%);" },
        { name: "Celestial Voyager", category: "premium", price: 45000, image: "assets/images/watch3.png", style: "", isNew: true },
        { name: "Grand Master", category: "premium", price: 32000, image: "assets/images/watch4.png", style: "", isNew: true },
        { name: "Urban Scout", category: "budget", price: 3500, image: "assets/images/watch1.png", style: "filter: grayscale(100%) contrast(120%);", isNew: true },
        { name: "Metro Classic", category: "budget", price: 5500, image: "assets/images/watch2.png", style: "filter: sepia(30%) brightness(90%);", isNew: true },
        { name: "Abyss Diver", category: "premium", price: 28000, image: "assets/images/watch3.png", style: "filter: hue-rotate(45deg);", isNew: true },
        { name: "Silver Horizon", category: "budget", price: 5999, image: "assets/images/watch1.png", style: "filter: grayscale(100%);" },
        { name: "Gold Standard", category: "premium", price: 55000, image: "assets/images/watch4.png", style: "filter: sepia(20%) brightness(110%);" },
        { name: "Vintage Aviator", category: "budget", price: 7500, image: "assets/images/watch2.png", style: "filter: sepia(60%);" },
        { name: "Onyx Elite", category: "premium", price: 38000, image: "assets/images/watch3.png", style: "filter: contrast(130%);" },
        { name: "Solar Flare", category: "premium", price: 42000, image: "assets/images/watch4.png", style: "filter: hue-rotate(320deg);", isNew: true },
        { name: "Aqua Marine", category: "budget", price: 4500, image: "assets/images/watch1.png", style: "filter: hue-rotate(180deg) brightness(110%);" },
        { name: "Stealth Ops", category: "budget", price: 8200, image: "assets/images/watch2.png", style: "filter: brightness(60%);" },
        { name: "Lunar Phase", category: "premium", price: 60000, image: "assets/images/watch3.png", style: "filter: grayscale(50%) contrast(110%);" },
        { name: "Retro Racer", category: "budget", price: 6800, image: "assets/images/watch1.png", style: "filter: sepia(40%) hue-rotate(10deg);", isNew: true }
    ];

    // 2. Procedural Generation Config
    const prefixes = ["Cosmic", "Neo", "Vanguard", "Titan", "Aero", "Lumina", "Stellar", "Iron", "Shadow", "Pacific", "Alpine", "Desert", "Quantum", "Omega", "Prime", "Elite", "Nova", "Hyper", "Sonic", "Velvet"];
    const suffixes = ["Timer", "Master", "Guard", "Pilot", "Diver", "Racer", "Classic", "Sport", "Tourbillon", "Chrono", "Matic", "Quartz", "Geneva", "Legacy", "Vision", "Force", "Element", "Fusion", "Spark", "Pulse"];
    const baseImages = ["assets/images/watch1.png", "assets/images/watch2.png", "assets/images/watch3.png", "assets/images/watch4.png"];

    const generateNewProducts = (count) => {
        const generated = [];
        for (let i = 0; i < count; i++) {
            const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
            const isPremium = Math.random() > 0.5;
            const price = isPremium
                ? Math.floor(Math.random() * (80000 - 20000) + 20000)
                : Math.floor(Math.random() * (15000 - 3000) + 3000);

            // Random Filter Generation for Visual Uniqueness
            const hue = Math.floor(Math.random() * 360);
            const sepia = Math.floor(Math.random() * 50);
            const contrast = Math.floor(Math.random() * (150 - 90) + 90);
            const filter = `filter: hue-rotate(${hue}deg) sepia(${sepia}%) contrast(${contrast}%);`;

            generated.push({
                name: name,
                category: isPremium ? "premium" : "budget",
                price: price,
                image: baseImages[Math.floor(Math.random() * baseImages.length)],
                style: filter,
                isNew: Math.random() > 0.8 // 20% chance of being new
            });
        }
        return generated;
    };

    // 3. Combine All Products
    let allProducts = [...manualProducts, ...generateNewProducts(10)];

    // 4. Initialize Data (Ratings, Discounts, Index)
    allProducts.forEach((item, index) => {
        item.originalIndex = index;
        item.rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
        item.discount = Math.random() > 0.7 ? Math.floor(Math.random() * (30 - 5) + 5) : 0;
    });

    // 5. Render Function
    const renderProducts = (products) => {
        if (!productGrid) return;
        productGrid.innerHTML = '';

        products.forEach(item => {
            const el = document.createElement('div');
            el.className = `product-card product-item ${item.category} ${item.isNew ? 'new-arrival' : ''}`;
            // Add dataset for easy access (though we render from object now)
            el.dataset.category = item.category;
            el.dataset.price = item.price;
            el.dataset.rating = item.rating;
            el.dataset.discount = item.discount;
            el.dataset.originalIndex = item.originalIndex; // Important for relevance sort
            if (item.isNew) el.classList.add('new-arrival');

            el.style.backgroundColor = 'var(--bg-primary)';
            el.style.padding = 'var(--spacing-md)';
            el.style.position = 'relative';
            el.style.transition = 'all 0.5s ease';

            // Discount Badge
            const discountBadge = item.discount > 0 ?
                `<div style="position: absolute; top: 3.5rem; left: 1rem; background: var(--accent-gold); color: #000; padding: 0.2rem 0.5rem; font-size: 0.7rem; font-weight: bold; border-radius: 4px;">${item.discount}% OFF</div>`
                : '';

            // Rating Badge
            const ratingBadge = `<div style="position: absolute; top: 1rem; left: 1rem; background: rgba(0,0,0,0.8); color: #fff; padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; display: flex; align-items: center; gap: 4px;"><i class="fas fa-star text-gold" style="font-size: 0.6rem;"></i> ${item.rating}</div>`;

            // Wishlist Logic check
            const isInWishlist = wishlist && wishlist.some(w => w.name === item.name);
            const heartIcon = isInWishlist ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
            const heartClass = isInWishlist ? 'active' : '';

            el.innerHTML = `
                <button class="wishlist-btn ${heartClass}">${heartIcon}</button>
                ${ratingBadge}
                ${discountBadge}
                <div style="height: 300px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #222; margin-bottom: 1.5rem;">
                    <img src="${item.image}" alt="${item.name}" style="max-height: 90%; ${item.style}">
                </div>
                <div style="text-align: center;">
                    <span style="color: var(--text-secondary); text-transform: uppercase; font-size: 0.8rem;">${item.category === 'premium' ? 'Premium' : 'Everyday'}</span>
                    <h3 class="heading-md" style="margin-top: 0.5rem;">${item.name}</h3>
                    <p class="text-gold" style="font-weight: 700; font-size: 1.2rem; margin-bottom: 1rem;">₹ ${item.price.toLocaleString()}</p>
                    <button class="btn btn-primary add-to-cart-btn" style="padding: 0.5rem 1.5rem; font-size: 0.8rem;">Add to Cart</button>
                </div>
            `;
            productGrid.appendChild(el);

            // Re-observe for scroll animation
            if (typeof observer !== 'undefined') {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                observer.observe(el);
            } else {
                // Fallback if observer issue
                el.style.opacity = '1';
                el.style.transform = 'none';
            }

        });
    };


    // 6. Filter & Sort Logic (Updated to use Data)
    const applyFilterAndSort = () => {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const filterValue = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const sortValue = sortSelect ? sortSelect.value : 'relevance';

        // Filter
        let filtered = allProducts.filter(item => {
            if (filterValue === 'all') return true;
            if (filterValue === 'new-arrival') return item.isNew;
            return item.category === filterValue;
        });

        // Sort
        switch (sortValue) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'discount':
                filtered.sort((a, b) => b.discount - a.discount);
                break;
            case 'relevance':
            default:
                filtered.sort((a, b) => a.originalIndex - b.originalIndex);
                break;
        }

        renderProducts(filtered);
    };

    // Event Listeners
    if (filterButtons) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilterAndSort();
            });
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilterAndSort);
    }

    // Initial Render call
    if (productGrid) renderProducts(allProducts);

    // Re-initialize animations for the newly rendered items
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach(el => {
            // Force animation end state for better UX on initial load or let observer handle it
        });
    }, 100);

    // --- Account & Address Management ---
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    let userAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];

    const saveUserProfile = () => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    };

    const saveAddresses = () => localStorage.setItem('userAddresses', JSON.stringify(userAddresses));

    // Profile Form Logic
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        // Load existing data
        document.getElementById('profile-name').value = userProfile.name || '';
        document.getElementById('profile-email').value = userProfile.email || '';
        document.getElementById('profile-phone').value = userProfile.phone || '';

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            userProfile = {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value
            };
            saveUserProfile();
            alert('Profile saved successfully!');
        });
    }

    // Address Logic
    const addressListEl = document.getElementById('address-list');
    const addressForm = document.getElementById('address-form');

    const renderAddresses = () => {
        if (!addressListEl) return;
        addressListEl.innerHTML = '';
        if (userAddresses.length === 0) {
            addressListEl.innerHTML = '<p class="text-body">No addresses saved yet.</p>';
            return;
        }

        userAddresses.forEach((addr, index) => {
            const isDefault = index === 0; // Simple logic: first is default
            const div = document.createElement('div');
            div.className = `address-card ${isDefault ? 'default' : ''}`;
            div.innerHTML = `
                ${isDefault ? '<span class="badge-default">Default</span>' : ''}
                <h4 style="font-size:1rem; margin-bottom:0.5rem; color:var(--text-main);">${addr.label}</h4>
                <p class="text-secondary" style="white-space: pre-wrap;">${addr.text}</p>
                <button class="remove-addr-btn" data-index="${index}" style="margin-top:0.5rem; background:none; border:none; color:var(--accent-gold); cursor:pointer;">Remove</button>
            `;
            addressListEl.appendChild(div);
        });

        document.querySelectorAll('.remove-addr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                userAddresses.splice(idx, 1);
                saveAddresses();
                renderAddresses();
            });
        });
    };

    if (addressForm) {
        renderAddresses();
        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const label = document.getElementById('addr-label').value;
            const text = document.getElementById('addr-text').value;
            userAddresses.push({ label, text });
            saveAddresses();
            renderAddresses();
            document.getElementById('new-address-form').style.display = 'none';
            addressForm.reset();
        });
    }

    // Checkout Logic Update
    const checkoutBtn = document.querySelector('.sidebar-footer .btn-primary'); // More specific selector
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Refresh cart from local storage to ensure sync before checkout check
            cart = JSON.parse(localStorage.getItem('cart')) || [];

            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            if (userAddresses.length === 0) {
                const proceed = confirm('You have no saved addresses. Would you like to add one now?');
                if (proceed) {
                    window.location.href = 'account.html';
                }
            } else {
                const defaultAddr = userAddresses[0];
                alert(`Order successfully placed!\n\nShip to:\n${userProfile.name || 'Guest'}\n${defaultAddr.text}\n\nThank you for shopping with Zoro.`);
                cart = [];
                saveCart();
                renderCart();
                updateBadges();
                closeSidebars();
            }
        });
    }


    // --- Wallet Management ---
    let userWallet = JSON.parse(localStorage.getItem('userWallet')) || { balance: 0, transactions: [] };

    const saveWallet = () => localStorage.setItem('userWallet', JSON.stringify(userWallet));

    const renderWallet = () => {
        const balanceEl = document.getElementById('wallet-balance');
        const historyEl = document.getElementById('wallet-history');

        if (balanceEl) {
            balanceEl.textContent = `₹ ${userWallet.balance.toLocaleString()}`;
        }

        if (historyEl && userWallet.transactions.length > 0) {
            historyEl.innerHTML = '';
            // Show last 5 transactions reversed
            userWallet.transactions.slice().reverse().slice(0, 5).forEach(tx => {
                const li = document.createElement('li');
                li.style.cssText = 'padding: 1rem; border-bottom: 1px solid #333; display: flex; justify-content: space-between;';
                li.innerHTML = `
                    <span>${tx.type}</span>
                    <span class="${tx.amount > 0 ? 'text-gold' : 'text-body'}">${tx.amount > 0 ? '+' : ''} ₹ ${Math.abs(tx.amount).toLocaleString()}</span>
                `;
                historyEl.appendChild(li);
            });
        }
    };

    const addFundsForm = document.getElementById('add-funds-form');
    if (addFundsForm) {
        renderWallet();
        addFundsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amountInput = document.getElementById('fund-amount');
            const amount = parseInt(amountInput.value);

            if (amount > 0) {
                userWallet.balance += amount;
                userWallet.transactions.push({
                    type: 'Funds Added',
                    amount: amount,
                    date: new Date().toISOString()
                });
                saveWallet();
                renderWallet();
                amountInput.value = '';
                alert(`Successfully added ₹ ${amount.toLocaleString()} to your wallet!`);
            }
        });
    }

    // Initial Render
    updateBadges();
    updateHeartIcons();
});