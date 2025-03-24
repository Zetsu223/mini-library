document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let errorMessage = document.getElementById("errorMessage");

    try {
        let response = await fetch("http://localhost:5000/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        let data = await response.json();

        if (response.ok) {
            // Store the JWT token in localStorage
            localStorage.setItem("token", data.token);

            alert("Login successful! Welcome, " + data.user.name);
            window.location.href = "index.html"; // Redirect to dashboard
        } else {
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        errorMessage.textContent = "Server error. Please try again later.";
    }
});

