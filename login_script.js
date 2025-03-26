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

        // Check if the response is okay (status 200-299)
        if (response.ok) {
            let data = await response.json();

            // Store both token and userId
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user.userId); // Store userId here
            window.location.href = "index.html"; // Redirect to dashboard
        } else {
            let data = await response.json();
            errorMessage.textContent = data.message; // Show error message
        }
    } catch (error) {
        errorMessage.textContent = "Server error. Please try again later."; // Catch any network error
    }
});

