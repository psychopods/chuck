const API_URL = 'http://localhost:5219/api/services';
const servicesContainer = document.getElementById('servicesList');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');

let allServices = [];

async function fetchServices() {
  try {
    const res = await fetch(`${API_URL}/list.all.services`);
    const services = await res.json();
    allServices = services;

    // Populate category filter
    const categories = [...new Set(services.map(s => s.category))];
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    renderServices(services);
  } catch (err) {
    servicesContainer.innerHTML = `<p>Error loading services: ${err.message}</p>`;
  }
}

function renderServices(services) {
  servicesContainer.innerHTML = '';
  if (services.length === 0) {
    servicesContainer.innerHTML = '<p>No services match the filter.</p>';
    return;
  }

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <img class="service-image" src="${service.image}" alt="${service.name}">
      <div class="service-content">
        <h3>${service.name}</h3>
        <p>Category: ${service.category}</p>
        <p>Capacity: ${service.capacity}</p>
        <p class="price">From $${service.base_price}</p>
        <button onclick="showServiceDetails(${service.id})">View Details</button>
      </div>
    `;
    servicesContainer.appendChild(card);
  });
}

async function showServiceDetails(id) {
  try {
    const res = await fetch(`${API_URL}/get.a.service/${id}/single`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const service = await res.json();

    const rates = service.rates.map(rate => {
      return `<tr><td>${rate.pax_min}-${rate.pax_max}</td><td>$${rate.price}</td></tr>`;
    }).join('');

    document.getElementById('detailsBody').innerHTML = `
      <h2>${service.name}</h2>
      <img src="${service.image}" style="width: 100%; max-height: 200px; object-fit: cover;" />
      <p><strong>Category:</strong> ${service.category}</p>
      <p><strong>Description:</strong> ${service.description}</p>
      <p><strong>Base Price:</strong> $${service.base_price}</p>
      <p><strong>Capacity:</strong> ${service.capacity} people</p>
      <h4>Rates:</h4>
      <table>
        <thead><tr><th>People</th><th>Price</th></tr></thead>
        <tbody>${rates}</tbody>
      </table>
      <button onclick="bookService(${service.id})">Book Now</button>
    `;

    document.getElementById('detailsPanel').classList.remove('hidden');
  } catch (err) {
    alert("Failed to load service details: " + err.message);
  }
}

function closeDetailsPanel() {
  document.getElementById('detailsPanel').classList.add('hidden');
}



function closeModal() {
  modal.classList.add('hidden');
}

function bookService(serviceId) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert("You must be logged in to book a service.");
    return;
  }

  // Show modal and set hidden service id input
  document.getElementById('bookingServiceId').value = serviceId;
  document.getElementById('bookingDate').value = '';
  document.getElementById('paxCount').value = '';
  document.getElementById('bookingModal').classList.remove('hidden');
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.add('hidden');
}

async function submitBooking(event) {
  event.preventDefault(); // prevent form submit reload

  const serviceId = document.getElementById('bookingServiceId').value;
  const booking_date = document.getElementById('bookingDate').value;
  const pax_count = document.getElementById('paxCount').value;
  const token = sessionStorage.getItem('token');

  if (!booking_date || !pax_count) {
    alert('Please fill in all fields.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5219/api/bookings/createBooking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ service_id: serviceId, booking_date, pax_count })
    });
    const data = await res.json();

    if (data.error || data.message === "Booking Failed") {
      alert("Failed to book: " + (data.error || "Unknown error"));
    } else {
      alert("Booking successful!");
      closeBookingModal();
      closeDetailsPanel(); // optional: close details panel after booking
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}


function applyFilters() {
  const selectedCategory = categoryFilter.value;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value);

  const filtered = allServices.filter(service => {
    return (
      (!selectedCategory || service.category === selectedCategory) &&
      (!maxPrice || service.base_price <= maxPrice)
    );
  });

  renderServices(filtered);
}

// Init
fetchServices();
