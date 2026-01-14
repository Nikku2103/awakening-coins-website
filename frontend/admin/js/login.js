document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!res.ok) {
    alert('Invalid password');
    return;
  }

  const { token } = await res.json();

  // ✅ Persist token
  sessionStorage.setItem('ADMIN_TOKEN', token);

  // Redirect
  window.location.href = '/admin/admin-blogs.html';
});
