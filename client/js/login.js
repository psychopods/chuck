const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5219/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || data.error || 'Login failed';
      return;
    }

    // Store the token (sessionStorage)
    sessionStorage.setItem('token', data.token);
    message.style.color = 'green';
    message.textContent = 'Login successful! Redirecting...';

    // Redirect to dashboard or home page after login
    setTimeout(() => {
      window.location.href = 'bookings.html';
    }, 1500);

  } catch (err) {
    message.textContent = 'An error occurred: ' + err.message;
  }
});
