let currentUser = null;
let cart = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupNavigation();
    loadCartFromSession();
    loadUserData();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
}

function navigateToCart() {
	showSection("cart");
	updateCartDisplay();
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Product handling
function loadProducts(category = 'all') {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? productData.products 
        : productData.products.filter(p => p.category === category);

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

function createProductCard(product) {
    let productPriceDisplay = product.price.toFixed(2);
    const div = document.createElement('div');
    div.className = 'col-md-4 col-sm-6 product-card';
    div.innerHTML = `
        <div class="card">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text">₹${productPriceDisplay}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    return div;
}

function filterProducts(category) {
    loadProducts(category);
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = productData.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

// Cart handling
function addToCart(productId) {
    const product = productData.products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartCount();
        saveCartToSession();
        alert('Product added to cart!');
    }
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        let itemPrice = item.price;
        let itemPriceDisplay = item.price.toFixed(2);
        total += itemPrice;
        const itemElement = document.createElement('div');
        itemElement.className = 'card mb-3';
        itemElement.innerHTML = `
            <div class="card-body d-flex align-items-center">
                <img src="${item.image}" class="cart-item-image me-3" alt="${item.name}">
                <div class="flex-grow-1">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">₹${itemPriceDisplay}</p>
                </div>
                <button class="btn btn-danger" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    saveCartToSession();
    updateCartDisplay();
}

function checkout() {
    if (!currentUser) {
        alert('Please register before checkout');
        showSection('register');
        return;
    }
    
    generateInvoice();
    showSection('invoice');
}

function generateInvoice() {
    const invoiceContent = document.getElementById('invoiceContent');
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    
    invoiceContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-6">
                <h5>Bill To:</h5>
                <p>${currentUser.name}<br>
                ${currentUser.address}<br>
                ${currentUser.email}<br>
                ${currentUser.phone}</p>
            </div>
            <div class="col-6 text-end">
                <h5>Invoice Date:</h5>
                <p>${new Date().toLocaleDateString()}</p>
            </div>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>₹${item.price}</td>
                    </tr>
                `).join('')}
                <tr>
                    <th>Total</th>
                    <th>₹${total.toFixed(2)}</th>
                </tr>
            </tbody>
        </table>
    `;
}

// User Registration
function registerUser(event) {
    event.preventDefault();
    
    const user = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        address: document.getElementById('regAddress').value,
        phone: document.getElementById('regPhone').value
    };
    
    userData.users.push(user);
    currentUser = user;
    saveUserData();
    
    alert('Registration successful!');
    showSection('products');
}

// Storage functions
function saveCartToSession() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromSession() {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveUserData() {
    sessionStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function loadUserData() {
    const savedUserData = sessionStorage.getItem('userData');
    const savedCurrentUser = sessionStorage.getItem('currentUser');
    
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
    }
    if (savedCurrentUser) {
        currentUser = JSON.parse(savedCurrentUser);
    }
}

function printInvoice() {
    window.print();
}
