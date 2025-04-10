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
            borrowSection.innerHTML = `<button class="borrow-btn" onclick="borrowBook('${title}', '${isbn}')">Borrow Book</button>`;
        } else {
            borrowSection.innerHTML = `<p style="color: red;">Login to borrow this book.</p>`;
        }
    } else {
        borrowSection.innerHTML = `<p style="color: #FF3131;">This book is currently unavailable.</p>`;
    }

    // Show the modal
    document.getElementById("bookModal").style.display = "flex";
}

// Function to close the modal
function closeBookModal() {
    document.getElementById("bookModal").style.display = "none";
}


// Function to borrow the book
async function borrowBook(title, isbn) {
    try {
        let response = await fetch("http://localhost:5000/borrow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ title, isbn })
        });

        let result = await response.json();

        if (response.ok) {
            alert("You have successfully borrowed the book!");
            closeBookModal();
        } else {
            alert(result.message || "Error borrowing book.");
        }
    } catch (error) {
        console.error("Error borrowing book:", error);
    }
}








