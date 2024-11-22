const API_URL = 'http://localhost:3000/api'; // Cambia esto si despliegas en otro dominio

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('login.html')) {
        setupLoginPage();
    } else if (path.includes('signup.html')) {
        setupSignupPage();
    } else if (path.includes('store.html')) {
        setupStorePage();
    }
});

// Configurar la lógica para la página de Login
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('authToken', data.token);
                    alert('Login successful!');
                    window.location.href = 'store.html';
                } else {
                    alert(data.message || 'Error logging in');
                }
            } catch (error) {
                console.error('Error logging in:', error);
            }
        });
    }
}

// Configurar la lógica para la página de Registro
function setupSignupPage() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('User registered successfully!');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Error registering user');
                }
            } catch (error) {
                console.error('Error registering user:', error);
            }
        });
    }
}

// Configurar la lógica para la página de la tienda
function setupStorePage() {
    const productList = document.getElementById('productList');
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const popupTitle = document.getElementById('popup-title');
    const popupImage = document.getElementById('popup-image');
    const popupDescription = document.getElementById('popup-description');
    const popupClose = document.getElementById('popup-close');
    const logoutButton = document.getElementById('logoutButton');
    const buyButton = document.querySelector('.buy-btn'); // Botón "Comprar" en el popup
    let selectedProduct = null; // Producto seleccionado

    // Verificar si el usuario es administrador
    checkIfAdmin();

    // Cerrar popup
    popupClose.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);

    function closePopup() {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Logged out successfully!');
            window.location.href = 'login.html';
        });
    }

    // Verificar si el usuario es administrador
    async function checkIfAdmin() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Please log in to access this page.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/is-admin`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = await response.json();

            if (response.ok && data.isAdmin) {
                // Redirigir al store del admin si es administrador
                window.location.href = 'admin-store.html';
            } else {
                // Cargar productos para usuarios normales
                loadProducts();
            }
        } catch (error) {
            console.error('Error verifying admin status:', error);
            alert('Error verifying user permissions. Please try again.');
        }
    }

    // Cargar productos
    async function loadProducts() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Please log in to view products.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/products`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const products = await response.json();
            if (response.ok) {
                renderProducts(products);
            } else {
                productList.innerHTML = '<p class="text-center text-red-500">Failed to load products.</p>';
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<p class="text-center text-red-500">Failed to load products. Please try again later.</p>';
        }
    }

    // Renderizar productos
    function renderProducts(products) {
        productList.innerHTML = ''; // Limpia el contenido previo

        products.forEach((product) => {
            const productCard = document.createElement('div');
            productCard.className = 'card';

            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>$${product.price}</p>
            `;

            productCard.addEventListener('click', () => {
                openPopup(product);
            });

            productList.appendChild(productCard);
        });
    }

    // Abrir popup con el producto seleccionado
    function openPopup(product) {
        selectedProduct = product; // Guardar el producto seleccionado
        popupTitle.textContent = product.name;
        popupImage.src = product.imageUrl;
        popupDescription.textContent = product.description;
        popup.classList.add('active');
        overlay.classList.add('active');
    }

    buyButton.addEventListener('click', async () => {
        if (!selectedProduct) return;
    
        try {
            const quantityInput = document.getElementById('popup-quantity');
            const quantity = parseInt(quantityInput.value, 10);
    
            // Validación en el cliente: Cantidad válida y no mayor al stock
            if (isNaN(quantity) || quantity <= 0) {
                alert('Por favor, selecciona una cantidad válida.');
                return;
            }
    
            if (quantity > selectedProduct.stock) {
                alert(`Solo hay ${selectedProduct.stock} unidades disponibles.`);
                return;
            }
    
            // Enviar datos al backend
            const response = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    quantity,
                    price: selectedProduct.price,
                    stock: selectedProduct.stock, // Se envía el stock al backend para validación
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Producto añadido al carrito con éxito.');
                closePopup(); // Cerrar el popup
            } else {
                alert(data.message || 'Error al añadir al carrito.');
            }
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            alert('Hubo un problema al intentar añadir el producto al carrito.');
        }
    });
    
    
}
