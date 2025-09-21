const form = document.getElementById("UpdateForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = sessionStorage.getItem("token");

      const data = {
        name: document.getElementById("name").value || null,
        email: document.getElementById("email").value || null,
        phone: document.getElementById("phone").value || null,
        password: document.getElementById("password").value || null
      };

      try {
        const res = await fetch("http://localhost:5219/api/auth/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          message.style.color = "green";
          message.textContent = result.message;
        } else {
          message.style.color = "red";
          message.textContent = result.error || "Update failed";
        }
      } catch (err) {
        message.style.color = "red";
        message.textContent = "Error: " + err.message;
      }
    });