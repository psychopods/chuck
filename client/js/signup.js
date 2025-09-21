const form = document.getElementById('RegisterForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5219/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || data.error || 'Login failed';
      return;
    }

    message.style.color = 'green';
    message.textContent = 'Registration successful! Redirecting...';

    // Redirect to dashboard or home page after login
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

  } catch (err) {
    message.textContent = 'An error occurred: ' + err.message;
  }
});
