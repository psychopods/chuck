const API = "http://localhost:5219/api";
const token = sessionStorage.getItem("token"); 
function showSection(section) {
  document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(section+"Section").classList.remove("hidden");
}
// ====== SERVICE FORMS ======
function showCreateServiceForm() {
  document.getElementById("createServiceForm").classList.remove("hidden");
}
function hideCreateServiceForm() {
  document.getElementById("createServiceForm").classList.add("hidden");
}
function showUpdateServiceForm(service) {
  document.getElementById("updateServiceForm").classList.remove("hidden");
  document.getElementById("uId").value = service.id;
  document.getElementById("uName").value = service.name || "";
  document.getElementById("uDescription").value = service.description || "";
  document.getElementById("uCategory").value = service.category || "";
  document.getElementById("uBasePrice").value = service.base_price || "";
  document.getElementById("uImage").value = service.image || "";
  document.getElementById("uCapacity").value = service.capacity || "";
}
function hideUpdateServiceForm() {
  document.getElementById("updateServiceForm").classList.add("hidden");
}

async function createService(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById("sName").value,
    description: document.getElementById("sDescription").value,
    category: document.getElementById("sCategory").value,
    base_price: document.getElementById("sBasePrice").value,
    image: document.getElementById("sImage").value,
    capacity: document.getElementById("sCapacity").value,
  };
  await fetch(`${API}/services/create.services`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token 
    },
    body: JSON.stringify(body)
  });
  hideCreateServiceForm();
  loadServices();
}

async function updateServiceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("uId").value;
  const body = {
    name: document.getElementById("uName").value,
    description: document.getElementById("uDescription").value,
    category: document.getElementById("uCategory").value,
    base_price: document.getElementById("uBasePrice").value,
    image: document.getElementById("uImage").value,
    capacity: document.getElementById("uCapacity").value,
  };
  await fetch(`${API}/services/update.service/${id}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token 
    },
    body: JSON.stringify(body)
  });
  hideUpdateServiceForm();
  loadServices();
}

async function loadServices() {
  const res = await fetch(`${API}/services/list.all.services`, {
    headers: { Authorization: "Bearer " + token }
  });
  const services = await res.json();
  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";
  services.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.category}</td>
      <td>${s.base_price}</td>
      <td>${s.capacity}</td>
      <td>
        <button onclick='showUpdateServiceForm(${JSON.stringify(s)})'>Edit</button>
        <button onclick="deleteService(${s.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteService(id) {
  await fetch(`${API}/services/delete.service/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });
  loadServices();
}

// ====== RATE FORMS ======
function showCreateRateForm() {
  document.getElementById("createRateForm").classList.remove("hidden");
  // auto-fill service id if one is typed in the loader
  document.getElementById("rServiceId").value = document.getElementById("rateServiceId").value || "";
}
function hideCreateRateForm() {
  document.getElementById("createRateForm").classList.add("hidden");
}
function showUpdateRateForm(rate) {
  document.getElementById("updateRateForm").classList.remove("hidden");
  document.getElementById("urId").value = rate.id;
  document.getElementById("urPaxMin").value = rate.pax_min;
  document.getElementById("urPaxMax").value = rate.pax_max;
  document.getElementById("urPrice").value = rate.price;
}
function hideUpdateRateForm() {
  document.getElementById("updateRateForm").classList.add("hidden");
}

async function createRate(e) {
  e.preventDefault();
  const body = {
    service_id: document.getElementById("rServiceId").value,
    rates: [{
      pax_min: document.getElementById("rPaxMin").value,
      pax_max: document.getElementById("rPaxMax").value,
      price: document.getElementById("rPrice").value,
      description: document.getElementById("rDescription").value
    }]
  };
  await fetch(`${API}/rates/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(body)
  });
  hideCreateRateForm();
  loadRates();
}

async function updateRateSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("urId").value;
  const body = {
    pax_min: document.getElementById("urPaxMin").value,
    pax_max: document.getElementById("urPaxMax").value,
    price: document.getElementById("urPrice").value,
    description: document.getElementById("urDescription").value
  };
  await fetch(`${API}/rates/update/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(body)
  });
  hideUpdateRateForm();
  loadRates();
}

async function loadRates() {
  const sid = document.getElementById("rateServiceId").value;
  // if (!sid) return alert("Enter a service ID first");
  const res = await fetch(`${API}/rates/list?service_id=${sid}`, {
    headers: { Authorization: "Bearer " + token }
  });
  const rates = await res.json();
  const tbody = document.querySelector("#ratesTable tbody");
  tbody.innerHTML = "";
  rates.forEach(r => {
    const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.pax_min}</td>
        <td>${r.pax_max}</td>
        <td>${r.price}</td>
        <td>${r.description || ""}</td>
        <td>
          <button onclick='showUpdateRateForm(${JSON.stringify(r)})'>Edit</button>
          <button onclick="deleteRate(${r.id})">Delete</button>
        </td>
      `;
    tbody.appendChild(tr);
  });
}

async function deleteRate(id) {
  await fetch(`${API}/rates/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });
  loadRates();
}
// ========== BOOKINGS ==========
async function loadBookings() {
  const res = await fetch(`${API}/bookings/getBookings`, {
    headers: { Authorization: "Bearer " + token }
  });
  const bookings = await res.json();
  const tbody = document.querySelector("#bookingsTable tbody");
  tbody.innerHTML = "";
  bookings.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.user_id}</td>
      <td>${b.service_name}</td>
      <td>${b.pax_count}</td>
      <td>${b.booking_date}</td>
      <td>${b.status}</td>
      <td>
        <select onchange="updateBookingStatus(${b.id}, this.value)">
          <option value="">--Change--</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Active</option>
          <option value="completed">Completes</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
async function updateBookingStatus(id, status) {
  if (!status) return;
  await fetch(`${API}/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status })
  });
  loadBookings();
}