let lastScrollTop = 0; // To keep track of the last scroll position

// Add event listener for the scroll event
window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    let menuBar = document.querySelector('.s_menu');
    let logoSide = document.querySelector('.d_logo');
    
    // If scrolling down, hide the menu bar
    if (currentScroll > lastScrollTop) {
        menuBar.style.top = "-60px"; // Hides the menu by moving it above the viewport
        logoSide.style.top = "-60px";
    } else {
        // If scrolling up, show the menu bar
        menuBar.style.top = "0";
        logoSide.style.top = "0";
    }
    
    // Update the last scroll position
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

function toggleDrawer() {
    const sideMenu = document.getElementById('sideMenu');
    const mainPage = document.querySelector('.mainPage');
    const drawerIcon = document.querySelector('.drawer-icon');
    const drawIco = document.querySelector('.draw-ico');

    // Toggle the side menu open/close
    sideMenu.classList.toggle('open');
    mainPage.classList.toggle('shifted');
    drawerIcon.classList.toggle('open');
    drawIco.classList.toggle('rotate');
}

function toggleSearch() {
    const searchButton = document.querySelector('.searchButton');
    const searchWrap = document.querySelector('.search-bar-wrapper');
    const searchBar = document.querySelector('.search-bar');

    searchButton.classList.toggle('open');
    setTimeout(function() {
        searchWrap.style.display = 'inline-block';
        searchButton.style.display = 'none';
        searchButton.classList.toggle('open');
        searchBar.focus();
    }, 700);
}

document.addEventListener("DOMContentLoaded", function () {
    fetchBooks();
});

// Fetch books and dynamically update table
async function fetchBooks() {
    try {
        const response = await fetch("http://localhost:5000/books");
        const books = await response.json();

        const bookTableBody = document.querySelector("#bookTable tbody");
        bookTableBody.innerHTML = ""; // Clear table before adding new data

        books.forEach(book => {
            const row = document.createElement("tr");

            // Set button color based on availability
            const buttonColor = book.available ? "green" : "red";
            const buttonText = book.available ? "Available" : "Not Available";

            row.innerHTML = `
                <td>${book.title || "N/A"}</td>
                <td>${book.author || "N/A"}</td>
                <td>${book.year || "N/A"}</td>
                <td>${book.genre || "N/A"}</td>
                <td>${book.isbn || "N/A"}</td>
                <td>${book.publisher || "N/A"}</td>
                <td>${book.language || "N/A"}</td>
                <td>
                    <div class="t_button" 
                         onclick="openBookModal('${book.title}', '${book.author}', '${book.year}', '${book.genre}', '${book.isbn}', ${book.available}, '${book.cover || ''}')"
                         style="background-color: ${book.available ? 'green' : '#D2042D'}; color: white; cursor: pointer;">
                        ${book.available ? "Available" : "Not Available"}
                    </div>
                </td>
            `;


            bookTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

//Function to check book availability
function checkBookAvailability(title, isAvailable) {
    alert(`${title} is ${isAvailable ? "available" : "not available"} for borrowing.`);
}

document.getElementById("searchButton").addEventListener("click", filterBooks);
document.getElementById("searchInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        filterBooks();
    }
});

function filterBooks() {
    let searchInput = document.getElementById("searchInput").value.toLowerCase();
    let tableRows = document.querySelectorAll("#bookTable tbody tr");

    tableRows.forEach(row => {
        let title = row.cells[0]?.textContent.toLowerCase() || "";
        let author = row.cells[1]?.textContent.toLowerCase() || "";
        let pubyear = row.cells[2]?.textContent.toLowerCase() || "";
        let genre = row.cells[3]?.textContent.toLowerCase() || "";
        let isbn = row.cells[4]?.textContent.toLowerCase() || "";

        if (title.includes(searchInput) || author.includes(searchInput) || genre.includes(searchInput) || pubyear.includes(searchInput) || isbn.includes(searchInput)) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    let userNameElement = document.getElementById("userName");

    if (!localStorage.getItem("token")) {
        userNameElement.innerHTML = `<h2>Guest</h2>`;
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/users/current", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` 
            }
        });

        let data = await response.json();

        if (response.ok) {
            userNameElement.innerHTML = `<h2>${data.name}</h2>`;
        } else {
            userNameElement.innerHTML = `<h2>Guest</h2>`;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        userNameElement.innerHTML = `<h2>Error loading user</h2>`;
    }
});

document.getElementById("i_logout").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "login.html"; // Redirect to login
});

/* MODAL LOGIC */

function openBookModal(title, author, year, genre, isbn, available, cover) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalAuthor").innerText = author;
    document.getElementById("modalYear").innerText = year;
    document.getElementById("modalGenre").innerText = genre;
    document.getElementById("modalISBN").innerText = isbn;

    // Set cover image (fallback to default if missing)
    const modalCover = document.getElementById("modalCover");
    modalCover.src = cover && cover !== "undefined" ? cover : "default-cover.jpg";

    const borrowSection = document.getElementById("borrowSection");
    borrowSection.innerHTML = ""; // Clear previous content

    if (available) {
        if (localStorage.getItem("token")) {
            borrowSection.innerHTML = `<button class="borrow-btn" onclick="borrowBook('${title}', '${genre}')">Borrow Book</button>`;
        } else {
            borrowSection.innerHTML = `<p style="color: red;">Login to borrow this book.</p>`;
        }
    } else {
        borrowSection.innerHTML = `<p style="color: red;">This book is currently unavailable.</p>`;
    }

    // Show the modal
    document.getElementById("bookModal").style.display = "flex";
}

// Function to close the modal
function closeBookModal() {
    document.getElementById("bookModal").style.display = "none";
}

function borrowBook(title, genre) {
    const userId = getUserIdFromToken(); // Extract userId from the token

    if (!userId) {
        alert("Please log in to borrow a book.");
        return;
    }

    // Get the token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Access denied, no token provided.");
        return;
    }

    fetch("http://localhost:5000/books/borrow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Send the JWT token in the Authorization header
        },
        body: JSON.stringify({ title, genre, userId }) // Send the book details and userId
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            updateBorrowedBooks(); // Update the borrowed books table
            closeBookModal(); // Close the modal after borrowing
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

async function updateBorrowedBooks() {
    const token = localStorage.getItem("token"); // Get token from localStorage

    if (!token) {
        console.error("No token found. Access Denied.");
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/users/current", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Send token in the Authorization header
            }
        });

        let data = await response.json();
        console.log("Fetched Data:", data); // Log the full data object to check if borrowedBooks exist

        if (response.ok) {
            const borrowedBooksTableBody = document.querySelector("#t_Data");

            if (!borrowedBooksTableBody) {
                console.error("Table body element #t_Data not found");
                return;
            }

            borrowedBooksTableBody.innerHTML = ""; // Clear previous content

            // Check if borrowedBooks is an array and not empty
            if (!Array.isArray(data.borrowedBooks) || data.borrowedBooks.length === 0) {
                borrowedBooksTableBody.innerHTML = "<tr><td colspan='4'>No borrowed books</td></tr>";
            } else {
                console.log("Borrowed Books Array:", data.borrowedBooks); // Log borrowedBooks to ensure it's populated

                // Dynamically add borrowed books to the table
                data.borrowedBooks.forEach(book => {
                    const row = document.createElement("tr");

                    // Use borrowedAt for the borrow date
                    const borrowedDate = book.borrowedAt ? new Date(book.borrowedAt).toLocaleDateString() : "N/A";
                    const returnedDate = book.returnedOn ? new Date(book.returnedOn).toLocaleDateString() : "Not returned";

                    row.innerHTML = `
                        <td>${book.title}</td>
                        <td>${book.genre}</td>
                        <td>${borrowedDate}</td>
                        <td>${returnedDate}</td>
                    `;

                    borrowedBooksTableBody.appendChild(row); // Add the row to the table
                });
            }
        } else {
            console.error("Failed to fetch user data:", data);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

function returnBook(title) {
    const userId = localStorage.getItem("userId"); // Ensure user is logged in

    if (!userId) {
        alert("Please log in to return a book.");
        return;
    }

    fetch("http://localhost:5000/books/return", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, userId }), // Send title and userId to mark the book as returned
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            updateBorrowedBooks(); // Update the borrowed books table with the return date
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", updateBorrowedBooks);

function getUserIdFromToken() {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (!token) {
        return null;
    }

    const payload = token.split('.')[1]; // Get the payload part of the JWT
    const decodedPayload = JSON.parse(atob(payload)); // Decode and parse the payload

    return decodedPayload.id; // Assuming the userId is in the 'id' field of the token
}

