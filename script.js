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


// Function to check book availability based on the title passed
function checkBookAvailability(bookTitle) {
    const table = document.getElementById('bookTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip the header row
        const cells = rows[i].getElementsByTagName('td');
        
        // Check if the title matches the bookTitle
        if (cells[0].textContent.toLowerCase() === bookTitle.toLowerCase()) {
            // Check the availability (last column in the row)
            const availability = cells[7].textContent.trim();
            
            // Display the availability
            if (availability === 'Available') {
                alert(`${bookTitle} is available.`);
            } else {
                alert(`${bookTitle} is not available.`);
            }
            
            return; // Stop the function once the book is found
        }
    }

    // If the book is not found
    alert('Book not found');
}




