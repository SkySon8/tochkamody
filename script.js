// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
let currentUser = null;
let cart = [];
let favorites = [];
let products = [];
let currentCategory = 'all';
let currentSort = 'default';
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 12;
let appliedPromo = null;
let currentAuthMode = 'login'; // 'login' или 'register'

// Промокоды
const promoCodes = {
    'WELCOME20': { discount: 20, type: 'percent' },
    'SUMMER50': { discount: 50, type: 'percent' },
    'FREESHIP': { discount: 100, type: 'fixed', minAmount: 1000 }
};

// ============ ТОВАРЫ (синхронизация с админ-панелью) ============
function loadProductsFromStorage() {
    const savedProducts = localStorage.getItem('fashion_products');
    if (savedProducts && JSON.parse(savedProducts).length > 0) {
        products = JSON.parse(savedProducts);
    } else {
        products = [
            { id: 1, name: "Пальто шерстяное оливковое", price: 8990, category: "clothing", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["XS","S","M","L","XL"], colors: ["Оливковый","Бежевый","Черный"] },
            { id: 2, name: "Кожаная сумка через плечо", price: 5490, category: "bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: [], colors: ["Бежевый","Коричневый","Оливковый"] },
            { id: 3, name: "Ботильоны на каблуке", price: 7990, category: "shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["35","36","37","38","39","40"], colors: ["Бежевый","Черный"] },
            { id: 4, name: "Платье-футляр", price: 4990, category: "clothing", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["XS","S","M","L"], colors: ["Оливковый","Бежевый"] },
            { id: 5, name: "Клатч вечерний", price: 2990, category: "accessories", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: [], colors: ["Бежевый","Золотой"] },
            { id: 6, name: "Кроссовки кожаные", price: 6990, category: "shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["36","37","38","39","40","41"], colors: ["Бежевый","Оливковый"] },
            { id: 7, name: "Шарф кашемировый", price: 1990, category: "accessories", image: "https://images.unsplash.com/photo-1584036554391-bee2a8f1d336?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: [], colors: ["Бежевый","Оливковый","Серый"] },
            { id: 8, name: "Юбка-миди плиссированная", price: 3990, category: "clothing", image: "https://images.unsplash.com/photo-1583496661160-f8b0c1f5cec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["XS","S","M","L"], colors: ["Оливковый","Бежевый"] },
            { id: 9, name: "Рюкзак городской", price: 4490, category: "bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: [], colors: ["Оливковый","Черный"] },
            { id: 10, name: "Сандалии кожаные", price: 3990, category: "shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["35","36","37","38","39"], colors: ["Бежевый","Коричневый"] }
        ];
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('fashion_products', JSON.stringify(products));
}

// ============ ОБНОВЛЕНИЕ БЕЙДЖЕЙ ============
function updateCartBadge() {
    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function updateFavoritesBadge() {
    const favoritesBadge = document.getElementById('favoritesCount');
    if (favoritesBadge) {
        const count = favorites.length;
        favoritesBadge.textContent = count;
        favoritesBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function updateAllBadges() {
    updateCartBadge();
    updateFavoritesBadge();
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
function init() {
    loadProductsFromStorage();
    loadUserData();
    loadCartAndFavorites();
    renderProducts();
    setupEventListeners();
    updateAllBadges();
}

function loadUserData() {
    const savedUser = localStorage.getItem('fashion_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

function loadCartAndFavorites() {
    const savedCart = localStorage.getItem(`fashion_cart_${currentUser?.id || 'guest'}`);
    cart = savedCart ? JSON.parse(savedCart) : [];

    const savedFavorites = localStorage.getItem(`fashion_favorites_${currentUser?.id || 'guest'}`);
    favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
}

function saveCart() {
    localStorage.setItem(`fashion_cart_${currentUser?.id || 'guest'}`, JSON.stringify(cart));
    updateCartBadge();
}

function saveFavorites() {
    localStorage.setItem(`fashion_favorites_${currentUser?.id || 'guest'}`, JSON.stringify(favorites));
    updateFavoritesBadge();
}

function saveUser() {
    localStorage.setItem('fashion_user', JSON.stringify(currentUser));
}

// ============ РЕНДЕР ТОВАРОВ ============
function renderProducts() {
    let filtered = [...products];

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (paginated.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:60px;grid-column:1/-1;">Товары не найдены</div>';
        renderPagination(0);
        return;
    }

    grid.innerHTML = paginated.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <div class="product-actions">
                    <button onclick="event.stopPropagation(); addToCart(${product.id})"><i class="fas fa-shopping-cart"></i> В корзину</button>
                    <button onclick="event.stopPropagation(); toggleFavorite(${product.id})" style="${favorites.includes(product.id) ? 'background:#6B8C5C;color:white' : ''}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">&laquo;</button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button disabled>...</button>`;
        }
    }

    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">&raquo;</button>`;
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ КОРЗИНА ============
function addToCart(productId, size = null, color = null) {
    if (!currentUser) {
        showAuthModal();
        return;
    }

    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId && item.size === size && item.color === color);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            color: color,
            quantity: 1
        });
    }

    saveCart();
    showToast('Товар добавлен в корзину', false);
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    showToast('Товар удален из корзины', false);
}

function updateQuantity(index, quantity) {
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = quantity;
        saveCart();
        renderCart();
    }
}

function renderCart() {
    const container = document.getElementById('cartContent');
    const totalContainer = document.getElementById('cartTotal');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">Корзина пуста</div>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }

    let subtotal = 0;
    container.innerHTML = cart.map((item, idx) => {
        subtotal += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toLocaleString()} ₽</p>
                    ${item.size ? `<p>Размер: ${item.size}</p>` : ''}
                    ${item.color ? `<p>Цвет: ${item.color}</p>` : ''}
                </div>
                <div class="cart-item-actions">
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${idx}, this.value)">
                    <button onclick="removeFromCart(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');

    let total = subtotal;
    let discountText = '';

    if (appliedPromo && promoCodes[appliedPromo]) {
        const promo = promoCodes[appliedPromo];
        if (promo.type === 'percent') {
            const discount = subtotal * promo.discount / 100;
            total = subtotal - discount;
            discountText = `<p style="color:#22c55e;">Промокод ${appliedPromo}: -${promo.discount}% (${Math.round(discount)} ₽)</p>`;
        } else if (promo.type === 'fixed' && subtotal >= (promo.minAmount || 0)) {
            total = subtotal - promo.discount;
            discountText = `<p style="color:#22c55e;">Промокод ${appliedPromo}: -${promo.discount} ₽</p>`;
        }
    }

    if (totalContainer) {
        totalContainer.innerHTML = `
            ${discountText}
            <p><strong>Итого: ${Math.round(total)} ₽</strong></p>
        `;
    }
}

function applyPromoCode() {
    const input = document.getElementById('promoCodeInput');
    const code = input?.value.toUpperCase();

    if (!code) {
        showToast('Введите промокод', true);
        return;
    }

    if (promoCodes[code]) {
        appliedPromo = code;
        renderCart();
        showToast(`Промокод ${code} применен!`, false);
    } else {
        showToast('Неверный промокод', true);
    }
}

function checkout() {
    if (!currentUser) {
        showAuthModal();
        return;
    }

    if (cart.length === 0) {
        showToast('Корзина пуста', true);
        return;
    }

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (appliedPromo && promoCodes[appliedPromo]) {
        const promo = promoCodes[appliedPromo];
        if (promo.type === 'percent') {
            total = total - (total * promo.discount / 100);
        } else if (promo.type === 'fixed' && total >= (promo.minAmount || 0)) {
            total = total - promo.discount;
        }
    }

    const order = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        items: [...cart],
        total: Math.round(total),
        status: 'new',
        date: new Date().toLocaleString('ru-RU'),
        promoCode: appliedPromo
    };

    let orders = JSON.parse(localStorage.getItem('fashion_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('fashion_orders', JSON.stringify(orders));

    cart = [];
    saveCart();
    appliedPromo = null;
    renderCart();
    closeModal();
    showToast('Заказ оформлен! Спасибо за покупку!', false);

    const promoInput = document.getElementById('promoCodeInput');
    if (promoInput) promoInput.value = '';
}

// ============ ИЗБРАННОЕ ============
function toggleFavorite(productId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }

    const index = favorites.indexOf(productId);
    if (index === -1) {
        favorites.push(productId);
        showToast('Добавлено в избранное', false);
    } else {
        favorites.splice(index, 1);
        showToast('Удалено из избранного', false);
    }

    saveFavorites();
    renderProducts();
    renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favoritesContent');
    if (!container) return;

    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    if (favoriteProducts.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">Избранное пусто</div>';
        return;
    }

    container.innerHTML = favoriteProducts.map(product => `
        <div class="favorite-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="favorite-item-info">
                <h4>${product.name}</h4>
                <p>${product.price.toLocaleString()} ₽</p>
            </div>
            <button onclick="addToCart(${product.id}); closeModal();">В корзину</button>
            <button onclick="toggleFavorite(${product.id}); renderFavorites();" style="background:#C5D1B5; color:#4A5B3A;">Удалить</button>
        </div>
    `).join('');
}

// ============ АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ============
function showAuthModal() {
    currentAuthMode = 'login';
    renderAuthForm();
    const modal = document.getElementById('userModal');
    if (modal) modal.style.display = 'flex';
}

function renderAuthForm() {
    const container = document.getElementById('userContent');
    if (!container) return;

    if (currentAuthMode === 'login') {
        container.innerHTML = `
            <div class="auth-form">
                <h3>Вход в аккаунт</h3>
                <input type="email" id="loginEmail" placeholder="Email">
                <input type="password" id="loginPassword" placeholder="Пароль">
                <div class="forgot-link">
                    <span onclick="showResetModal()">Забыли пароль?</span>
                </div>
                <button class="btn-primary" onclick="login()">Войти</button>
                <hr>
                <div class="auth-link" onclick="switchToRegister()">
                    Нет аккаунта? <strong>Зарегистрироваться</strong>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="auth-form">
                <h3>Регистрация</h3>
                <input type="text" id="regName" placeholder="Имя">
                <input type="email" id="regEmail" placeholder="Email">
                <input type="password" id="regPassword" placeholder="Пароль">
                <input type="password" id="regConfirmPassword" placeholder="Подтвердите пароль">
                <button class="btn-primary" onclick="register()">Зарегистрироваться</button>
                <hr>
                <div class="auth-link" onclick="switchToLogin()">
                    Уже есть аккаунт? <strong>Войти</strong>
                </div>
            </div>
        `;
    }
}

function switchToRegister() {
    currentAuthMode = 'register';
    renderAuthForm();
}

function switchToLogin() {
    currentAuthMode = 'login';
    renderAuthForm();
}

function login() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    const users = JSON.parse(localStorage.getItem('fashion_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        saveUser();
        closeModal();
        loadCartAndFavorites();
        renderProducts();
        updateAllBadges();
        showToast(`Добро пожаловать, ${user.name}!`, false);
        renderProfile();
    } else {
        showToast('Неверный email или пароль', true);
    }
}

function register() {
    const name = document.getElementById('regName')?.value;
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;

    if (!name || !email || !password) {
        showToast('Заполните все поля', true);
        return;
    }

    if (password !== confirmPassword) {
        showToast('Пароли не совпадают', true);
        return;
    }

    const users = JSON.parse(localStorage.getItem('fashion_users') || '[]');

    if (users.find(u => u.email === email)) {
        showToast('Пользователь с таким email уже существует', true);
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        date: new Date().toLocaleString('ru-RU')
    };

    users.push(newUser);
    localStorage.setItem('fashion_users', JSON.stringify(users));

    currentUser = newUser;
    saveUser();
    closeModal();
    loadCartAndFavorites();
    renderProducts();
    updateAllBadges();
    showToast(`Регистрация прошла успешно! Добро пожаловать, ${name}!`, false);
    renderProfile();
}

function logout() {
    currentUser = null;
    cart = [];
    favorites = [];
    appliedPromo = null;
    localStorage.removeItem('fashion_user');
    localStorage.removeItem('fashion_cart_guest');
    localStorage.removeItem('fashion_favorites_guest');
    loadCartAndFavorites();
    renderProducts();
    updateAllBadges();
    showToast('Вы вышли из аккаунта', false);
    showAuthModal();
}

function renderProfile() {
    const container = document.getElementById('userContent');
    if (!container) return;

    if (!currentUser) {
        showAuthModal();
        return;
    }

    const userPromo = localStorage.getItem(`fashion_promo_${currentUser.id}`);

    container.innerHTML = `
        <div class="profile-info">
            <h3>${currentUser.name}</h3>
            <p>Email: ${currentUser.email}</p>
            <p>Дата регистрации: ${currentUser.date || '-'}</p>
            
            <div class="promo-section">
                <h4><i class="fas fa-tag"></i> Промокод</h4>
                ${userPromo ? `
                    <p style="color:#22c55e;">Ваш промокод: <strong>${userPromo}</strong></p>
                    <p>Скидка: ${promoCodes[userPromo]?.discount}%</p>
                ` : `
                    <p>У вас нет активных промокодов</p>
                `}
                <div class="promo-input-group">
                    <input type="text" id="profilePromoCode" placeholder="Введите промокод">
                    <button class="btn-primary" onclick="activatePromoCode()">Активировать</button>
                </div>
            </div>
            
            <button class="btn-outline" onclick="logout()" style="margin-top:20px;">Выйти</button>
        </div>
    `;
}

function activatePromoCode() {
    const input = document.getElementById('profilePromoCode');
    const code = input?.value.toUpperCase();

    if (!code) {
        showToast('Введите промокод', true);
        return;
    }

    if (promoCodes[code]) {
        localStorage.setItem(`fashion_promo_${currentUser.id}`, code);
        showToast(`Промокод ${code} активирован!`, false);
        renderProfile();
    } else {
        showToast('Неверный промокод', true);
    }
}

// ============ ВОССТАНОВЛЕНИЕ ПАРОЛЯ ============
function showResetModal() {
    const modal = document.getElementById('resetModal');
    const container = document.getElementById('resetContent');
    if (!modal || !container) return;

    container.innerHTML = `
        <div class="auth-form">
            <h3>Восстановление пароля</h3>
            <input type="email" id="resetEmail" placeholder="Введите ваш Email">
            <button class="btn-primary" onclick="resetPassword()">Восстановить</button>
            <div class="auth-link" onclick="closeModal(); showAuthModal();">
            Вернуться ко входу
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function resetPassword() {
    const email = document.getElementById('resetEmail')?.value;
    const users = JSON.parse(localStorage.getItem('fashion_users') || '[]');
    const user = users.find(u => u.email === email);

    if (user) {
        const newPassword = Math.random().toString(36).slice(-8);
        user.password = newPassword;
        localStorage.setItem('fashion_users', JSON.stringify(users));
        showToast(`Новый пароль: ${newPassword}`, false);
        closeModal();
        showAuthModal();
    } else {
        showToast('Пользователь с таким email не найден', true);
    }
}

// ============ МОДАЛЬНЫЕ ОКНА ============
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('productModal');
    const body = document.getElementById('productModalBody');
    if (!modal || !body) return;

    let sizesHtml = '';
    if (product.sizes && product.sizes.length > 0) {
        sizesHtml = `
            <div class="size-select">
                <label>Размер: </label>
                <select id="productSize">
                    ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
            </div>
        `;
    }

    let colorsHtml = '';
    if (product.colors && product.colors.length > 0) {
        colorsHtml = `
            <div class="color-select">
                <label>Цвет: </label>
                <select id="productColor">
                    ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                </select>
            </div>
        `;
    }

    body.innerHTML = `
        <div class="product-modal-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-modal-info">
            <h2>${product.name}</h2>
            <div class="product-price-large">${product.price.toLocaleString()} ₽</div>
            ${sizesHtml}
            ${colorsHtml}
            <div class="product-modal-buttons">
                <button class="btn-primary" onclick="addToCartWithOptions(${product.id})">Добавить в корзину</button>
                <button class="btn-outline" onclick="toggleFavorite(${product.id}); closeModal();">❤ Избранное</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function addToCartWithOptions(productId) {
    const size = document.getElementById('productSize')?.value;
    const color = document.getElementById('productColor')?.value;
    addToCart(productId, size, color);
    closeModal();
}

function openCartModal() {
    renderCart();
    const modal = document.getElementById('cartModal');
    if (modal) modal.style.display = 'flex';
}

function openFavoritesModal() {
    renderFavorites();
    const modal = document.getElementById('favoritesModal');
    if (modal) modal.style.display = 'flex';
}

function openUserModal() {
    if (currentUser) {
        renderProfile();
    } else {
        showAuthModal();
    }
    const modal = document.getElementById('userModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// ============ СОБЫТИЯ ============
function setupEventListeners() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.getAttribute('data-category');
            currentPage = 1;
            renderProducts();
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            renderProducts();
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            currentPage = 1;
            renderProducts();
        });
    }

    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCartModal);

    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) favoritesBtn.addEventListener('click', openFavoritesModal);

    const userBtn = document.getElementById('userBtn');
    if (userBtn) userBtn.addEventListener('click', openUserModal);

    const applyPromoBtn = document.getElementById('applyPromoBtn');
    if (applyPromoBtn) applyPromoBtn.addEventListener('click', applyPromoCode);

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    if (isError) {
        toast.style.background = '#dc2626';
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', init);