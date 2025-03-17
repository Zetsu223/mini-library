let lastScrollTop = 0; // To keep track of the last scroll position

// Add event listener for the scroll event
window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    let menuBar = document.querySelector('.s_menu');
    
    // If scrolling down, hide the menu bar
    if (currentScroll > lastScrollTop) {
        menuBar.style.top = "-60px"; // Hides the menu by moving it above the viewport
    } else {
        // If scrolling up, show the menu bar
        menuBar.style.top = "0";
    }
    
    // Update the last scroll position
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

function toggleDrawer() {
    // You can add functionality to toggle a drawer menu here
    alert("Drawer icon clicked!");
}

