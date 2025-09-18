const BOOKINGS_API = 'http://localhost:5219/api/bookings';
const token = sessionStorage.getItem('token');
const bookingsList = document.getElementById('bookingsList');
const statusFilter = document.getElementById('statusFilter');

let allBookings = [];

if (!token) {
  alert("You're not logged in. Redirecting to login page.");
  window.location.href = "login.html";
}

async function fetchBookings() {
  try {
    const status = statusFilter.value;
    let url = `${BOOKINGS_API}/getBookings`;
    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }
    const res = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const data = await res.json();
    allBookings = data;
    renderBookings(allBookings);
  } catch (err) {
    bookingsList.innerHTML = `<p>Error loading bookings: ${err.message}</p>`;
  }
}

function renderBookings(bookings) {
  bookingsList.innerHTML = '';

  if (bookings.length === 0) {
    bookingsList.innerHTML = '<p>No bookings found.</p>';
    return;
  }

  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    const bookingDate = new Date(b.booking_date).toLocaleDateString();

    card.innerHTML = `
      <h3>${b.service_name}</h3>
      <div class="booking-info">
        <p><strong>Category:</strong> ${b.category}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Pax:</strong> ${b.pax_count}</p>
        <p><strong>Total Price:</strong> $${b.total_price}</p>
        <p class="status ${b.status || 'active'}"><strong>Status:</strong> ${b.status || 'active'}</p>
        ${b.status !== 'cancelled' ? `<button class="cancel-btn" onclick="cancelBooking(${b.id})">Cancel Booking</button>` : ''}
      </div>
    `;

    bookingsList.appendChild(card);
  });
}

function applyBookingFilters() {
  fetchBookings();
}


function cancelBooking(id) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;

  fetch(`${BOOKINGS_API}/cancel.appointment/${id}/cancel`, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("Failed to cancel booking: " + data.error);
    } else {
      alert("Booking cancelled!");
      fetchBookings();
    }
  })
  .catch(err => {
    alert("Error: " + err.message);
  });
}

// Init
fetchBookings();
statusFilter.addEventListener('change', applyBookingFilters);
