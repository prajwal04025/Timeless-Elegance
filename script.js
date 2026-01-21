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
                const id = parseInt(card.dataset.id);
                wishlist.push({ id, name, price, image });
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            saveWishlist();
            renderWishlist();
            updateBadges();
        }

        // Nav Icons - Redirect to New Tab
        if (e.target.closest('#cart-btn')) {
            window.open('account.html?tab=cart', '_blank');
        }
        if (e.target.closest('#wishlist-btn')) {
            window.open('account.html?tab=wishlist', '_blank');
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

    // --- Dynamic Product Generation & Rendering ---

    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const productGrid = document.getElementById('product-grid');

    let allProducts = [];

    // Fetch Products from JSON
    const loadProducts = async () => {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Failed to load products');
            allProducts = await response.json();

            // Initial Add Data (Ratings, etc. - in a real app this would be in DB)
            allProducts.forEach((item, index) => {
                item.originalIndex = index;
                if (!item.rating) item.rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
                if (item.discount === undefined) item.discount = Math.random() > 0.7 ? Math.floor(Math.random() * (30 - 5) + 5) : 0;
            });

            if (productGrid) renderProducts(allProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback content or error message
            if (productGrid) productGrid.innerHTML = '<p class="text-body" style="text-align:center;">Unable to load products. Please try again later.</p>';
        }
    };

    // Call load
    loadProducts();

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
            el.dataset.id = item.id;
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

            // Render Product Card
            el.innerHTML = `
                ${discountBadge}
                ${ratingBadge}
                <div style="overflow: hidden; border-radius: 4px; margin-bottom: 1rem; cursor: pointer;" onclick="openProductModal(${item.id})">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" style="width: 100%; height: 250px; object-fit: cover; transition: transform 0.5s ease;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                   <div>
                        <h3 class="heading-md" style="font-size: 1.1rem; margin-bottom: 0.2rem; min-height: 2.2em;">${item.name}</h3>
                        <p class="text-secondary" style="font-size: 0.9rem; margin-bottom: 0.5rem;">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</p>
                   </div>
                   <button class="wishlist-btn ${heartClass}" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--accent-gold); transition: transform 0.2s;">
                        ${heartIcon}
                   </button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                         <span class="text-gold" style="font-size: 1.2rem; font-weight: bold;">₹ ${item.price.toLocaleString()}</span>
                         ${item.discount > 0 ? `<span style="text-decoration: line-through; color: #666; font-size: 0.9rem; margin-left: 0.5rem;">₹ ${Math.round(item.price * (100 / (100 - item.discount))).toLocaleString()}</span>` : ''}
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Add to Cart</button>
                </div>
            `;

            // Hover effect for image zoom
            const imgContainer = el.querySelector('div[style*="overflow: hidden"]');
            const img = el.querySelector('img');

            imgContainer.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.1)';
            });
            imgContainer.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });

            productGrid.appendChild(el);

            // Observe for scroll animation
            observer.observe(el);
        });
    };

    // --- Product Details Modal Logic ---

    // Inject Modal HTML if not exists
    if (!document.getElementById('product-details-modal')) {
        const modalHtml = `
        <div id="product-details-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; justify-content: center; align-items: center; padding: 1rem;">
            <div style="background: var(--bg-secondary); width: 100%; max-width: 900px; max-height: 90vh; border: 1px solid var(--accent-gold); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; position: relative; animation: fadeIn 0.3s ease;">
                
                <button onclick="closeProductModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; z-index: 10;"><i class="fas fa-times"></i></button>

                <div style="display: flex; flex-direction: column; md:flex-row; height: 100%; overflow-y: auto;">
                    
                    <div class="modal-body-content" style="display:flex; flex-wrap:wrap;">
                        <!-- Image Section -->
                        <div style="flex: 1; min-width: 300px; padding: 2rem; display: flex; align-items: center; justify-content: center; background: #fff;">
                            <img id="modal-img" src="" alt="Watch" style="max-width: 100%; max-height: 400px; object-fit: contain;">
                        </div>

                        <!-- Details Section -->
                        <div style="flex: 1; min-width: 300px; padding: 2rem; display: flex; flex-direction: column; justify-content: center;">
                            <span id="modal-category" class="text-secondary" style="text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; margin-bottom: 0.5rem;">Category</span>
                            <h2 id="modal-title" class="heading-lg" style="margin-bottom: 1rem;">Watch Name</h2>
                            <p id="modal-price" class="text-gold" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">₹ 0</p>
                            
                            <p id="modal-desc" class="text-body" style="margin-bottom: 2rem; line-height: 1.6;"></p>

                           <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                                <h4 style="color: var(--text-main); margin-bottom: 1rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem;">Specifications</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
                                    <div>
                                        <span class="text-secondary">Material:</span><br>
                                        <span id="modal-material" class="text-main">Stainless Steel</span>
                                    </div>
                                    <div>
                                        <span class="text-secondary">Water Resistance:</span><br>
                                        <span id="modal-water" class="text-main">30m</span>
                                    </div>
                                     <div>
                                        <span class="text-secondary">Usage:</span><br>
                                        <span id="modal-usage" class="text-main">Universal</span>
                                    </div>
                                     <div>
                                        <span class="text-secondary">Features:</span><br>
                                        <span id="modal-features" class="text-main">Standard Timekeeping</span>
                                    </div>
                                </div>
                           </div>

                           <button id="modal-add-btn" class="btn btn-primary" style="width: 100%; padding: 1rem;">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @media (max-width: 768px) { .modal-body-content { flex-direction: column; } }
        </style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    window.openProductModal = (id) => {
        const product = allProducts.find(p => p.id === id);
        if (!product) return;

        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-img').alt = product.name;
        document.getElementById('modal-category').textContent = product.category;
        document.getElementById('modal-title').textContent = product.name;
        document.getElementById('modal-price').textContent = `₹ ${product.price.toLocaleString()}`;
        document.getElementById('modal-desc').textContent = product.description;

        // Detailed Specs (with fallbacks)
        const details = product.details || {};
        document.getElementById('modal-material').textContent = details.Material || 'Standard Alloy';
        document.getElementById('modal-water').textContent = details.WaterResistance || 'Water Resistant';
        document.getElementById('modal-usage').textContent = details.Usage || 'Universal';
        document.getElementById('modal-features').textContent = details.Features || 'Standard Timekeeping';

        // Add to cart button logic override for this instance
        const addBtn = document.getElementById('modal-add-btn');
        addBtn.onclick = () => {
            cart.push({ name: product.name, price: Number(product.price), image: product.image });
            saveCart();
            renderCart();
            updateBadges();
            openSidebar(cartSidebar);
            closeProductModal();
        };

        document.getElementById('product-details-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    window.closeProductModal = () => {
        const modal = document.getElementById('product-details-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Close modal on outside click
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('product-details-modal');
        if (e.target === modal) {
            closeProductModal();
        }
    });


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
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;
    let userAddresses = JSON.parse(localStorage.getItem('userAddresses')) || null;
    let userWallet = JSON.parse(localStorage.getItem('userWallet')) || null;

    // Helper: Load Initial User Data from JSON if LocalStorage is empty
    const initUserData = async () => {
        if (!userProfile || !userAddresses || !userWallet) {
            try {
                const response = await fetch('data/users.json');
                if (response.ok) {
                    const users = await response.json();
                    const testUser = users[0]; // Load the first mock user

                    if (!userProfile) {
                        userProfile = { name: testUser.name, email: testUser.email, phone: testUser.phone };
                        localStorage.setItem('userProfile', JSON.stringify(userProfile));
                    }
                    if (!userAddresses) {
                        userAddresses = testUser.addresses || [];
                        localStorage.setItem('userAddresses', JSON.stringify(userAddresses));
                    }
                    if (!userWallet) {
                        userWallet = testUser.wallet || { balance: 0, transactions: [] };
                        localStorage.setItem('userWallet', JSON.stringify(userWallet));
                    }

                    // Re-render dependent components
                    renderProfile();
                    renderAddresses();
                    renderWallet();
                }
            } catch (e) {
                console.error("Failed to load user mock data", e);
                // Fallback defaults
                if (!userProfile) userProfile = {};
                if (!userAddresses) userAddresses = [];
                if (!userWallet) userWallet = { balance: 0, transactions: [] };
            }
        }
    };
    initUserData();

    const saveUserProfile = () => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    };

    const saveAddresses = () => localStorage.setItem('userAddresses', JSON.stringify(userAddresses));

    // Profile Form Logic
    const profileForm = document.getElementById('profile-form');

    // Extracted render function
    const renderProfile = () => {
        const displaySection = document.getElementById('profile-display');
        const displayName = document.getElementById('display-name');
        const displayEmail = document.getElementById('display-email');
        const displayPhone = document.getElementById('display-phone');

        if (displaySection && userProfile && (userProfile.name || userProfile.email)) {
            displaySection.style.display = 'block';
            if (displayName) displayName.textContent = userProfile.name || 'N/A';
            if (displayEmail) displayEmail.textContent = userProfile.email || 'N/A';
            if (displayPhone) displayPhone.textContent = userProfile.phone || 'N/A';
        } else if (displaySection) {
            displaySection.style.display = 'none';
        }

        // Note: We deliberately DO NOT pre-fill the form inputs here anymore
        // as per the user's request to keep them empty for new entries.
    }

    if (profileForm) {
        renderProfile(); // Initial render
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            userProfile = {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value
            };
            saveUserProfile();
            renderProfile(); // Update the display section
            alert('Profile saved successfully!');
            profileForm.reset(); // Clear inputs
        });
    }

    // Address Logic
    const addressListEl = document.getElementById('address-list');
    const addressForm = document.getElementById('address-form');

    const renderAddresses = () => {
        if (!addressListEl || !userAddresses) return;
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

    // --- Order & Checkout Logic ---
    let userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const saveOrders = () => localStorage.setItem('userOrders', JSON.stringify(userOrders));

    const renderOrders = () => {
        const ordersTab = document.getElementById('tab-orders');
        if (!ordersTab) return;

        // Find the container list inside relevant tab or clear if needed
        // Assuming the tab has simple content, we might wipe it slightly incorrectly if we are not careful
        // Let's target a specific container or create one if not exists
        let orderListContainer = document.getElementById('order-list-container');
        if (!orderListContainer) {
            // Clear default text if any
            const defaultText = ordersTab.querySelector('.text-body');
            if (defaultText) defaultText.style.display = 'none';

            orderListContainer = document.createElement('div');
            orderListContainer.id = 'order-list-container';
            ordersTab.appendChild(orderListContainer);
        }

        orderListContainer.innerHTML = '';

        if (userOrders.length === 0) {
            orderListContainer.innerHTML = '<p class="text-body">You haven\'t placed any orders yet.</p>';
            return;
        }

        // Sort by date desc
        const sortedOrders = [...userOrders].reverse();

        sortedOrders.forEach(order => {
            const dateStr = new Date(order.date).toLocaleDateString();

            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="order-item-row">
                        <span>${item.name} (x1)</span> 
                        <span class="text-gold">₹ ${item.price.toLocaleString()}</span>
                    </div>
                `;
            });

            const card = document.createElement('div');
            card.className = 'order-card';

            // Add Cancel Button if status is Processing
            let actionHtml = '';
            if (order.status === 'Processing') {
                actionHtml = `<div style="text-align: right; border-top: 1px solid #333; padding-top: 1rem; margin-top: 1rem;">
                    <button class="btn btn-outline cancel-order-btn" data-id="${order.id}" style="font-size: 0.8rem; border-color: #ff4444; color: #ff4444;">Cancel Order</button>
                </div>`;
            }

            card.innerHTML = `
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.id}</div>
                        <div class="order-date">${dateStr}</div>
                    </div>
                    <div class="order-status ${order.status === 'Processing' ? 'status-processing' : 'status-completed'}" 
                         style="${order.status === 'Cancelled' ? 'background: rgba(255, 68, 68, 0.1); color: #ff4444;' : ''}">
                        ${order.status}
                    </div>
                </div>
                <div class="order-items-list">
                    ${itemsHtml}
                </div>
                <div class="order-total">
                    Total: <span class="text-gold">₹ ${order.total.toLocaleString()}</span>
                </div>
                ${actionHtml}
            `;
            orderListContainer.appendChild(card);
        });

        // Add Listeners to Cancel Buttons
        document.querySelectorAll('.cancel-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-id');
                openCancelModal(orderId);
            });
        });
    };

    // --- Cancel Order Logic ---
    let currentCancellingOrderId = null;
    const cancelModal = document.getElementById('cancel-modal');
    const cancelForm = document.getElementById('cancel-form');

    // Expose close function globally or attach to window for HTML onclick
    window.closeCancelModal = () => {
        if (cancelModal) {
            cancelModal.style.display = 'none';
            currentCancellingOrderId = null;
            cancelForm.reset();
        }
    };

    const openCancelModal = (orderId) => {
        currentCancellingOrderId = orderId;
        if (cancelModal) {
            cancelModal.style.display = 'flex';
        }
    };

    if (cancelForm) {
        cancelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentCancellingOrderId) return;

            const reason = document.getElementById('cancel-reason').value;
            const comments = document.getElementById('cancel-comments').value;

            // Find order
            const orderIndex = userOrders.findIndex(o => o.id === currentCancellingOrderId);
            if (orderIndex > -1) {
                const order = userOrders[orderIndex];

                // Update Status
                order.status = 'Cancelled';
                order.cancellationReason = reason;
                order.cancellationComments = comments;

                // Refund to Wallet
                userWallet.balance += order.total;
                userWallet.transactions.push({
                    type: `Refund for Order #${order.id}`,
                    amount: order.total,
                    date: new Date().toISOString()
                });

                // Save All
                saveOrders();
                saveWallet();

                // UI Updates
                renderOrders();
                renderWallet();

                alert(`Order #${order.id} cancelled successfully.\n₹ ${order.total.toLocaleString()} has been refunded to your wallet.`);
                closeCancelModal();
            }
        });
    }

    // Call renderOrders on init if we have data
    renderOrders();

    // --- Checkout Tab Logic ---
    const renderCheckoutTab = () => {
        const checkoutItemsContainer = document.getElementById('checkout-items-container');
        const checkoutAddress = document.getElementById('checkout-address');
        const checkoutTotal = document.getElementById('checkout-total');
        const checkoutWalletBalance = document.getElementById('checkout-wallet-balance');

        if (!checkoutItemsContainer) return; // Not on account page or elements missing

        // Render Summary Items
        checkoutItemsContainer.innerHTML = '';
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;

        if (currentCart.length === 0) {
            checkoutItemsContainer.innerHTML = '<p class="text-secondary">Your cart is empty.</p>';
        } else {
            currentCart.forEach(item => {
                const price = Number(item.price) || 0;
                total += price;
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.marginBottom = '0.5rem';
                div.style.borderBottom = '1px solid #333';
                div.style.paddingBottom = '0.5rem';
                div.innerHTML = `
                    <span>${item.name}</span>
                    <span class="text-gold">₹ ${price.toLocaleString()}</span>
                `;
                checkoutItemsContainer.appendChild(div);
            });
        }

        if (checkoutTotal) checkoutTotal.textContent = `₹ ${total.toLocaleString()}`;
        if (checkoutWalletBalance && userWallet) checkoutWalletBalance.textContent = `₹ ${userWallet.balance.toLocaleString()}`;

        // Render Address Preview
        if (checkoutAddress) {
            const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
            if (addresses.length > 0) {
                checkoutAddress.innerHTML = `
                    <h4 style="color: var(--text-main); margin-bottom: 0.5rem;">${addresses[0].label} <span class="badge-default">Default</span></h4>
                    <p class="text-secondary" style="white-space: pre-wrap;">${addresses[0].text}</p>
                `;
            } else {
                checkoutAddress.innerHTML = '<p class="text-body" style="color: #ff4444;">No valid shipping address found. Please add one.</p>';
            }
        }
    };

    // --- Tab Rendering Logic (Cart & Wishlist) ---
    const renderCartTab = () => {
        const container = document.getElementById('account-cart-container');
        const footer = document.getElementById('account-cart-footer');
        const totalEl = document.getElementById('account-cart-total');

        if (!container) return;

        container.innerHTML = '';
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;

        if (currentCart.length === 0) {
            container.innerHTML = '<p class="text-secondary">Your cart is empty.</p>';
            if (footer) footer.style.display = 'none';
        } else {
            currentCart.forEach((item, index) => {
                total += Number(item.price) || 0;
                const html = `
                    <div class="order-card" style="display:flex; gap:1rem; align-items:center;">
                        <img src="${item.image}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">
                        <div style="flex:1;">
                            <h4 style="color:var(--text-main); margin-bottom:0.5rem;">${item.name}</h4>
                            <p class="text-gold">₹ ${Number(item.price).toLocaleString()}</p>
                        </div>
                        <button class="btn btn-outline" onclick="removeItemFromCart(${index})" style="padding:0.5rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
            if (footer) {
                footer.style.display = 'block';
                if (totalEl) totalEl.textContent = `₹ ${total.toLocaleString()}`;
            }
        }
    };

    // Global helper for inline onclick removal
    window.removeItemFromCart = (index) => {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        currentCart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(currentCart));
        // Update both tab and any sidebar logic if present
        if (typeof cart !== 'undefined') cart.splice(index, 1); // update in-memory global if exists
        renderCartTab();
        updateBadges();
    };


    const renderWishlistTab = () => {
        const container = document.getElementById('account-wishlist-container');
        if (!container) return;

        container.innerHTML = '';
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

        if (currentWishlist.length === 0) {
            container.innerHTML = '<p class="text-secondary">Your wishlist is empty.</p>';
        } else {
            currentWishlist.forEach((item, index) => {
                // Determine ID: check if item has ID, if not try to find it in allProducts
                let itemId = item.id;
                if (!itemId && typeof allProducts !== 'undefined') {
                    const match = allProducts.find(p => p.name === item.name);
                    if (match) itemId = match.id;
                }
                const clickAttr = itemId ? `onclick="openProductModal(${itemId})"` : '';
                const pointerStyle = itemId ? 'cursor: pointer;' : '';

                const html = `
                    <div class="order-card" style="display:flex; gap:1rem; align-items:center;">
                        <div style="${pointerStyle}" ${clickAttr}>
                            <img src="${item.image}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">
                        </div>
                        <div style="flex:1;">
                            <h4 style="color:var(--text-main); margin-bottom:0.5rem;">${item.name}</h4>
                            <p class="text-gold">₹ ${Number(item.price).toLocaleString()}</p>
                        </div>
                         <div style="display:flex; gap:1rem;">
                              <button class="btn btn-primary" onclick="moveToCart(${index})" style="padding:0.5rem 1rem; font-size:0.8rem;">Add to Cart</button>
                              <button class="btn btn-outline" onclick="removeItemFromWishlist(${index})" style="padding:0.5rem;">
                                  <i class="fas fa-trash"></i>
                              </button>
                         </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        }
    };

    window.removeItemFromWishlist = (index) => {
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        currentWishlist.splice(index, 1);
        localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
        if (typeof wishlist !== 'undefined') wishlist.splice(index, 1);
        renderWishlistTab();
        updateBadges();
        updateHeartIcons();
    };

    window.moveToCart = (index) => {
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const item = currentWishlist[index];
        if (!item) return;

        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        currentCart.push(item);

        currentWishlist.splice(index, 1);

        localStorage.setItem('cart', JSON.stringify(currentCart));
        localStorage.setItem('wishlist', JSON.stringify(currentWishlist));

        if (typeof cart !== 'undefined') cart.push(item);
        if (typeof wishlist !== 'undefined') wishlist.splice(index, 1);

        renderWishlistTab();
        updateBadges();
        updateHeartIcons();
        alert('Moved to cart!');
    };


    // URL Tab Switching Logic (e.g. account.html?tab=checkout)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        // Simulating switchTab logic for external script context
        const triggerTab = (tName) => {
            // Hide all tabs
            const tabs = document.querySelectorAll('.account-content > div');
            if (tabs.length > 0) {
                tabs.forEach(div => div.style.display = 'none');
                const target = document.getElementById('tab-' + tName);
                if (target) target.style.display = 'block';

                // Render specific tab content if needed
                if (tName === 'checkout') renderCheckoutTab();
                if (tName === 'cart') renderCartTab();
                if (tName === 'wishlist') renderWishlistTab();
            }
        };
        setTimeout(() => triggerTab(tabParam), 100);
    }


    // Confirm Order Button Logic (Inside Checkout Tab)
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
            const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];

            if (currentCart.length === 0) {
                alert('Your cart is empty.');
                return;
            }

            if (addresses.length === 0) {
                alert('Please add a shipping address first.');
                // Try to switch tab using global function if available or just alert
                const addrBtn = document.querySelector('button[onclick="switchTab(\'addresses\')"]');
                if (addrBtn) addrBtn.click();
                return;
            }

            // Payment Method Validation
            const selectedPayment = document.querySelector('input[name="payment_method"]:checked');
            if (!selectedPayment) {
                alert('Please select a payment method.');
                return;
            }
            const paymentMethod = selectedPayment.value;
            // Calculate total
            const total = currentCart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

            // Wallet Balance Check
            if (paymentMethod === 'wallet') {
                if (userWallet.balance < total) {
                    alert(`Insufficient wallet balance. You need ₹ ${total.toLocaleString()} but have ₹ ${userWallet.balance.toLocaleString()}. Please add funds or choose another method.`);
                    return;
                }
                // Deduct Balance
                userWallet.balance -= total;
                userWallet.transactions.push({
                    type: 'Purchase',
                    amount: -total,
                    date: new Date().toISOString()
                });
                saveWallet();
                renderWallet(); // Update UI in background
            }

            // Proceed to Place Order
            const newOrder = {
                id: Math.floor(100000 + Math.random() * 900000).toString(),
                date: new Date().toISOString(),
                status: 'Processing',
                items: [...currentCart],
                total: total,
                shippingAddress: addresses[0],
                paymentMethod: paymentMethod
            };

            userOrders.push(newOrder);
            saveOrders();

            // Clear Cart
            cart = [];
            saveCart(); // Updates the state variable and localStorage
            renderCart(); // Update sidebar UI
            updateBadges();

            alert(`Order Confirmed! \nOrder #${newOrder.id} has been placed successfully.`);

            // Redirect to Orders tab
            window.location.href = 'account.html?tab=orders';
        });
    }

    // Checkout Logic Update (Sidebar Button)
    const checkoutBtn = document.querySelector('.sidebar-footer .btn-primary');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            cart = JSON.parse(localStorage.getItem('cart')) || [];

            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            // Redirect to Checkout Tab
            window.location.href = 'account.html?tab=checkout';

            closeSidebars();
        });
    }


    // --- Wallet Management ---

    // userWallet loaded at top
    const saveWallet = () => localStorage.setItem('userWallet', JSON.stringify(userWallet));

    const renderWallet = () => {
        if (!userWallet) return;
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

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                // Here you would typically clear session tokens like:
                // localStorage.removeItem('authToken');
                // But since we are mocking auth with these persistent stores, we might optional clear them:
                // localStorage.removeItem('userProfile');
                // localStorage.removeItem('userAddresses');
                // localStorage.removeItem('userWallet');

                window.location.href = 'login.html';
            }
        });
    }

    // --- Contact Form Logic ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            if (name && email && message) {
                const newMessage = {
                    id: Date.now().toString(),
                    name,
                    email,
                    message,
                    date: new Date().toISOString()
                };

                const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                messages.push(newMessage);
                localStorage.setItem('contactMessages', JSON.stringify(messages));

                alert('Thank you for contacting us! We have received your message and will get back to you shortly.');
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // --- Search Functionality ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            const isProductsPage = window.location.pathname.includes('products.html');

            if (isProductsPage) {
                // Filter current page
                const filtered = allProducts.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    (p.details && Object.values(p.details).some(val => val.toLowerCase().includes(query)))
                );

                const grid = document.getElementById('product-grid');
                if (grid) {
                    if (filtered.length > 0) {
                        grid.innerHTML = ''; // Clear current
                        renderProducts(filtered);
                    } else {
                        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                            <h3 class="text-secondary">No products found for "${query}"</h3>
                            <button class="btn btn-primary" onclick="window.location.reload()" style="margin-top:1rem;">Clear Search</button>
                        </div>`;
                    }
                }
            } else {
                // Redirect to products page with query
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
    }

    // Check for search param on load (for products page)
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');

    if (searchQuery && window.location.pathname.includes('products.html')) {
        if (searchInput) searchInput.value = searchQuery;

        // Wait for products to load (init call) then filter
        // Since allProducts is sync loaded from JSON at start (or mostly), we can filter immediately after init
        setTimeout(() => {
            const query = searchQuery.toLowerCase();
            const filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                (p.details && Object.values(p.details).some(val => val.toLowerCase().includes(query)))
            );
            const grid = document.getElementById('product-grid');
            if (grid) {
                if (filtered.length > 0) {
                    grid.innerHTML = '';
                    renderProducts(filtered);
                    // Update header text to show search context
                    const heading = document.querySelector('.heading-lg');
                    if (heading) heading.innerHTML = `Search Results: "${searchQuery}"`;
                } else {
                    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                        <h3 class="text-secondary">No products found for "${searchQuery}"</h3>
                        <a href="products.html" class="btn btn-primary" style="margin-top:1rem;">View All</a>
                    </div>`;
                }
            }
        }, 500); // Small delay to ensure init data is ready
    }

    // Initial Render calls
    updateBadges();
    updateHeartIcons();
});