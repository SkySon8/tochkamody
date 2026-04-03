// ============ АДМИНИСТРАТИВНАЯ ПАНЕЛЬ ============
let currentPage = 'dashboard';
let products = [];
let orders = [];
let promoCodes = [];
let users = [];

function checkAdminAuth() {
    const adminAuth = localStorage.getItem('admin_auth');
    if (!adminAuth) {
        const password = prompt('Введите пароль администратора:');
        if (password === 'Admin123!') {
            localStorage.setItem('admin_auth', 'true');
        } else {
            alert('Неверный пароль');
            window.location.href = 'shop.html';
        }
    }
}

function loadAdminData() {
    products = JSON.parse(localStorage.getItem('fashion_products') || '[]');
    orders = JSON.parse(localStorage.getItem('fashion_orders') || '[]');
    promoCodes = JSON.parse(localStorage.getItem('fashion_promocodes') || '[]');
    users = JSON.parse(localStorage.getItem('fashion_users') || '[]');

    if (products.length === 0) {
        products = [
            { id: 1, name: "Пальто шерстяное оливковое", price: 8990, category: "clothing", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["XS","S","M","L","XL"], colors: ["Оливковый","Бежевый","Черный"] },
            { id: 2, name: "Кожаная сумка через плечо", price: 5490, category: "bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: [], colors: ["Бежевый","Коричневый","Оливковый"] },
            { id: 3, name: "Ботильоны на каблуке", price: 7990, category: "shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", sizes: ["35","36","37","38","39","40"], colors: ["Бежевый","Черный"] }
        ];
        saveProducts();
    }
    if (promoCodes.length === 0) {
        promoCodes = [
            { code: "WELCOME20", discount: 20, type: "percent", active: true },
            { code: "SUMMER50", discount: 50, type: "percent", active: true }
        ];
        savePromoCodes();
    }
    renderPage();
}

function saveProducts() {
    localStorage.setItem('fashion_products', JSON.stringify(products));
    // Синхронизируем с основным магазином через событие
    window.dispatchEvent(new Event('productsUpdated'));
}

function saveOrders() {
    localStorage.setItem('fashion_orders', JSON.stringify(orders));
}

function savePromoCodes() {
    localStorage.setItem('fashion_promocodes', JSON.stringify(promoCodes));
}

function saveUsers() {
    localStorage.setItem('fashion_users', JSON.stringify(users));
}

function renderPage() {
    const container = document.getElementById('adminContent');
    if (currentPage === 'dashboard') {
        renderDashboard(container);
    } else if (currentPage === 'orders') {
        renderOrders(container);
    } else if (currentPage === 'products') {
        renderProducts(container);
    } else if (currentPage === 'promocodes') {
        renderPromoCodes(container);
    } else if (currentPage === 'users') {
        renderUsers(container);
    }
}

function renderDashboard(container) {
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    container.innerHTML = `
        <div class="stat-cards">
            <div class="stat-card"><h3>Заказов</h3><div class="number">${totalOrders}</div></div>
            <div class="stat-card"><h3>Пользователей</h3><div class="number">${totalUsers}</div></div>
            <div class="stat-card"><h3>Товаров</h3><div class="number">${totalProducts}</div></div>
            <div class="stat-card"><h3>Выручка</h3><div class="number">${totalRevenue.toLocaleString()} ₽</div></div>
        </div>
        <div class="admin-table">
            <h3>Последние заказы</h3>
            <table>
                <thead><tr><th>ID</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
                <tbody>
                    ${orders.slice(0, 5).map(order => `
                        <tr><td>${order.id}</td><td>${order.userName}</td><td>${order.total} ₽</td><td>${order.status}</td><td>${order.date}</td></tr>
                    `).join('')}
                    ${orders.length === 0 ? '<tr><td colspan="5">Нет заказов</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
}

function renderOrders(container) {
    container.innerHTML = `
        <div class="admin-table">
            <h3>CRM - Управление заказами</h3>
            <table>
                <thead><tr><th>ID</th><th>Пользователь</th><th>Товары</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.userName}</td>
                            <td>${order.items.map(i => i.name).join(', ')}</td>
                            <td>${order.total} ₽</td>
                            <td>
                                <select onchange="updateOrderStatus(${order.id}, this.value)">
                                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                                </select>
                            </td>
                            <td>${order.date}</td>
                            <td><button class="btn-delete" onclick="deleteOrder(${order.id})">Удалить</button></td>
                        </tr>
                    `).join('')}
                    ${orders.length === 0 ? '<tr><td colspan="7">Нет заказов</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
}

function renderProducts(container) {
    container.innerHTML = `
        <div class="admin-table">
            <h3>Управление товарами</h3>
            <button class="btn-primary" onclick="showAddProductForm()">+ Добавить товар</button>
            <table style="margin-top:20px">
                <thead><tr><th>ID</th><th>Изображение</th><th>Название</th><th>Цена</th><th>Категория</th><th>Действия</th></tr></thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td><img src="${product.image}" width="50" height="50" style="object-fit:cover;border-radius:8px"></td>
                            <td>${product.name}</td>
                            <td>${product.price} ₽</td>
                            <td>${product.category}</td>
                            <td>
                                <button class="btn-edit" onclick="editProduct(${product.id})">Редактировать</button>
                                <button class="btn-delete" onclick="deleteProduct(${product.id})">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div id="addProductForm" class="form-add" style="display:none">
            <h3>Добавить товар</h3>
            <div class="form-group"><label>Название</label><input type="text" id="productName"></div>
            <div class="form-group"><label>Цена</label><input type="number" id="productPrice"></div>
            <div class="form-group"><label>Категория</label>
                <select id="productCategory">
                    <option value="clothing">Одежда</option>
                    <option value="shoes">Обувь</option>
                    <option value="bags">Сумки</option>
                    <option value="accessories">Аксессуары</option>
                </select>
            </div>
            <div class="form-group"><label>Ссылка на изображение</label><input type="text" id="productImage" placeholder="https://..."></div>
            <div class="form-group"><label>Размеры (через запятую)</label><input type="text" id="productSizes" placeholder="XS,S,M,L,XL"></div>
            <div class="form-group"><label>Цвета (через запятую)</label><input type="text" id="productColors" placeholder="Красный,Синий,Зеленый"></div>
            <button class="btn-primary" onclick="addProduct()">Сохранить</button>
            <button class="btn-outline" onclick="hideAddProductForm()">Отмена</button>
        </div>
    `;
}

function showAddProductForm() {
    document.getElementById('addProductForm').style.display = 'block';
}

function hideAddProductForm() {
    document.getElementById('addProductForm').style.display = 'none';
}

function addProduct() {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const sizes = document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s);
    const colors = document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c);

    const newProduct = {
        id: newId,
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        sizes: sizes,
        colors: colors
    };

    if (!newProduct.name || !newProduct.price || !newProduct.image) {
        alert('Заполните обязательные поля: Название, Цена, Изображение');
        return;
    }

    products.push(newProduct);
    saveProducts();
    renderPage();
    hideAddProductForm();
    showToast('Товар добавлен');
}

function deleteProduct(id) {
    if (confirm('Удалить товар?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderPage();
        showToast('Товар удален');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    const newName = prompt('Новое название', product.name);
    const newPrice = prompt('Новая цена', product.price);
    if (newName) product.name = newName;
    if (newPrice) product.price = parseInt(newPrice);
    saveProducts();
    renderPage();
    showToast('Товар обновлен');
}

function renderPromoCodes(container) {
    container.innerHTML = `
        <div class="admin-table">
            <h3>Управление промокодами</h3>
            <div class="form-add">
                <h4>Создать промокод</h4>
                <div class="form-group"><label>Код</label><input type="text" id="newCode" placeholder="Например: SALE2025"></div>
                <div class="form-group"><label>Скидка (%)</label><input type="number" id="newDiscount" placeholder="10"></div>
                <button class="btn-primary" onclick="addPromoCode()">Создать</button>
            </div>
            <table style="margin-top:20px">
                <thead><tr><th>Код</th><th>Скидка</th><th>Статус</th><th>Действия</th></tr></thead>
                <tbody>
                    ${promoCodes.map(pc => `
                        <tr>
                            <td>${pc.code}</td>
                            <td>${pc.discount}%</td>
                            <td>${pc.active ? 'Активен' : 'Неактивен'}</td>
                            <td>
                                <button class="btn-edit" onclick="togglePromoCode('${pc.code}')">${pc.active ? 'Деактивировать' : 'Активировать'}</button>
                                <button class="btn-delete" onclick="deletePromoCode('${pc.code}')">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function addPromoCode() {
    const code = document.getElementById('newCode').value.toUpperCase();
    const discount = parseInt(document.getElementById('newDiscount').value);
    if (code && discount) {
        promoCodes.push({ code, discount, type: 'percent', active: true });
        savePromoCodes();
        renderPage();
        showToast('Промокод создан');
    }
}

function togglePromoCode(code) {
    const promo = promoCodes.find(p => p.code === code);
    if (promo) promo.active = !promo.active;
    savePromoCodes();
    renderPage();
}

function deletePromoCode(code) {
    promoCodes = promoCodes.filter(p => p.code !== code);
    savePromoCodes();
    renderPage();
}

function renderUsers(container) {
    container.innerHTML = `
        <div class="admin-table">
            <h3>Пользователи</h3>
            <table>
                <thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Дата регистрации</th><th>Действия</th></tr></thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.date || '-'}</td>
                            <td><button class="btn-delete" onclick="deleteUser(${user.id})">Удалить</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function deleteUser(id) {
    if (confirm('Удалить пользователя?')) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        renderPage();
        showToast('Пользователь удален');
    }
}

function updateOrderStatus(id, status) {
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = status;
        saveOrders();
        showToast('Статус обновлен');
        renderPage();
    }
}

function deleteOrder(id) {
    if (confirm('Удалить заказ?')) {
        orders = orders.filter(o => o.id !== id);
        saveOrders();
        renderPage();
        showToast('Заказ удален');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#4A5B3A;color:white;padding:12px 24px;border-radius:50px;z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Навигация
document.querySelectorAll('.admin-nav a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.admin-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentPage = link.getAttribute('data-page');
        document.getElementById('pageTitle').innerText = link.innerText;
        renderPage();
    });
});

document.getElementById('logoutAdminBtn')?.addEventListener('click', () => {
    localStorage.removeItem('admin_auth');
    window.location.href = 'shop.html';
});

document.getElementById('menuToggleAdmin')?.addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.toggle('open');
});

checkAdminAuth();
loadAdminData();