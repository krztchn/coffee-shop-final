document.addEventListener('DOMContentLoaded', () => {
  const hamMenu = document.querySelector('.hamburger-menu');
  const offScreenMenu = document.querySelector('.off-screen-menu');
  const menuLinks = offScreenMenu.querySelectorAll('a'); 

  // Toggle the menu visibility on hamburger menu click
  hamMenu.addEventListener('click', (event) => {
    event.stopPropagation(); 
    const isActive = hamMenu.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
    hamMenu.setAttribute('aria-expanded', isActive);
  });

  // Close the menu if the user clicks outside of it
  document.addEventListener('click', (event) => {
    if (!offScreenMenu.contains(event.target) && !hamMenu.contains(event.target)) {
      if (offScreenMenu.classList.contains('active')) {
        hamMenu.classList.remove('active');
        offScreenMenu.classList.remove('active');
        hamMenu.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Close the menu when any link inside the off-screen menu is clicked
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (offScreenMenu.classList.contains('active')) {
        hamMenu.classList.remove('active');
        offScreenMenu.classList.remove('active');
        hamMenu.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Ensure the menu closes when pressing the Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && offScreenMenu.classList.contains('active')) {
      hamMenu.classList.remove('active');
      offScreenMenu.classList.remove('active');
      hamMenu.setAttribute('aria-expanded', 'false');
    }
  });
});

//modal js
const cart = [];
const orders = [];
let orderIdCounter = 1;

const modalOverlay = document.getElementById('modal-overlay');
const orderModalOverlay = document.getElementById('order-modal-overlay');
const cartItems = document.getElementById('cart-items');
const orderItems = document.getElementById('order-items');
const openCartButton = document.getElementById('open-cart');
const closeModalButton = document.getElementById('close-modal');
const confirmOrderButton = document.getElementById('confirm-order');
const viewOrdersButton = document.getElementById('view-orders');
const closeOrderModalButton = document.getElementById('close-order-modal');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

// Open Cart Modal
openCartButton.addEventListener('click', () => {
  updateCart();
  modalOverlay.style.display = 'block';
});

// Close Cart Modal
closeModalButton.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

// Add to Cart Functionality
addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const productElement = button.closest('div[data-name]');
    const name = productElement.getAttribute('data-name');
    const price = parseFloat(productElement.getAttribute('data-price'));
    const imgSrc = productElement.querySelector('img[alt="Product Image"]').src;

    const existingProduct = cart.find((item) => item.name === name);

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ name, price, imgSrc, quantity: 1 });
    }
  });
});

// Update Cart Display
function updateCart() {
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
    <div id="align-cart-details">
      <img src="${item.imgSrc}" alt="${item.name}">
      <div >
        <p><strong>${item.name}</strong></p>
        <p>Price: ₱${item.price.toFixed(2)}</p>
        <label>Qty:</label>
        <input 
          type="number" 
          class="quantity-input" 
          min="1" 
          value="${item.quantity}" 
          onchange="changeQuantity(${index}, this.value)">
      </div>
      <br/>
      </div>
      <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
    `;
    cartItems.appendChild(cartItem);
  });
}

// Change Quantity
function changeQuantity(index, value) {
  const newQuantity = parseInt(value);
  if (newQuantity > 0) {
    cart[index].quantity = newQuantity;
    updateCart();
  } else {
    alert('Quantity must be at least 1.');
    updateCart();
  }
}

// Remove Item
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Confirm Order
confirmOrderButton.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  else if(cart.length >= 1) {
    const userResponse = confirm(`Are you sure to confirm?`);
    if(userResponse){
      const orderId = `ORDER-${orderIdCounter++}`;
      orders.push({ id: orderId, items: [...cart], status: 'To be shipped' });
      cart.length = 0; // Clear the cart
      modalOverlay.style.display = 'none';
    }
    else{
      alert('canceled');
    }
  }
});

// View Orders
viewOrdersButton.addEventListener('click', () => {
  updateOrders();
  orderModalOverlay.style.display = 'block';
});

// Close Order Modal
closeOrderModalButton.addEventListener('click', () => {
  orderModalOverlay.style.display = 'none';
});

// Update Orders Display with Total Amount and Status for Each Order ID
function updateOrders() {
  const orderItems = document.getElementById('orderItems');
  orderItems.innerHTML = '';

  if (orders.length === 0) {
    orderItems.innerHTML = '<p>No orders placed yet.</p>';
    return;
  }

  // Reverse the orders array to show the latest order at the top
  const reversedOrders = [...orders].reverse();

  reversedOrders.forEach((order) => {
    // Calculate the total amount for this order
    const totalAmount = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Create the order container with flexbox for spacing Order ID, Status, and Total Amount
    const orderContainer = document.createElement('div');
    orderContainer.className = 'order-container';

    // Updated layout with separated Order ID, Status, and Total Amount
    orderContainer.innerHTML = `
      <div class="order-id-container">
        <p class="order-id" onclick="toggleOrderDetails('${order.id}')">${order.id}</p>
        <p class="status" onclick="toggleStatus('${order.id}')">${order.status}</p>
        <p class="total-amount">(₱${totalAmount.toFixed(2)})</p>
      </div>
      <div class="order-details" id="details-${order.id}">
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.imgSrc}" alt="${item.name}">
            <div id="align-product-details">
              <p><strong>${item.name}</strong></p>
              <p>Qty: ${item.quantity}</p>
              <p>SubTotal: ₱${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          </div>
          
        `).join('')}
        
      </div>
      <hr>
    `;
    orderItems.appendChild(orderContainer);

  });
  }

// Toggle Order Details (One Open at a Time)
function toggleOrderDetails(orderId) {
  
// Close any currently open details
const allOrderDetails = document.querySelectorAll('.order-details');
allOrderDetails.forEach((details) => {
  if (details.id !== `details-${orderId}`) {
    details.style.display = 'none';
  }
});

// Toggle the clicked order's details
const details = document.getElementById(`details-${orderId}`);
details.style.display = details.style.display === 'block' ? 'none' : 'block';
}

// Toggle Status (Cycle through order statuses)
function toggleStatus(orderId) {
const order = orders.find(o => o.id === orderId);

// Update status on click, cycle between possible statuses
const statuses = ['To be shipped', 'Out for delivery', 'Delivered'];
const currentIndex = statuses.indexOf(order.status);
const nextStatus = statuses[(currentIndex + 1) % statuses.length];
order.status = nextStatus;

// Re-render the orders to reflect the new status
updateOrders();
}

// Initial call to render the orders
updateOrders();

//notify
function addProduct() {
  // Show the toast
  const toast = document.getElementById("toast");
  toast.classList.add("show");

  // Hide the toast after 
  setTimeout(() => {
      toast.classList.remove("show");
  }, 500);
}

function toggleFlip(container) {
  container.classList.toggle('active');
}

