// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  
  // Sticky Navbar Logic
  const navbar = document.querySelector('.primary-nav');
  const brandArea = document.querySelector('.header-brand');
  
  if (navbar && brandArea) {
    const stickyThreshold = brandArea.offsetTop + brandArea.offsetHeight;

    window.addEventListener('scroll', () => {
      if (window.scrollY >= stickyThreshold) {
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.left = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '1000';
      } else {
        navbar.style.position = 'sticky';
      }
    });
  }

  // Popup Ad Logic
  const adPopupOverlay = document.getElementById('adPopupOverlay');
  const closeAdPopup = document.getElementById('closeAdPopup');
  
  if (adPopupOverlay && closeAdPopup) {
    // Show popup 1.5 seconds after load
    setTimeout(() => {
      adPopupOverlay.style.display = 'flex';
      adPopupOverlay.style.opacity = '1';
    }, 1500);

    closeAdPopup.addEventListener('click', () => {
      adPopupOverlay.style.display = 'none';
    });
    
    // Close popup if clicked outside
    adPopupOverlay.addEventListener('click', (e) => {
      if(e.target === adPopupOverlay) {
        adPopupOverlay.style.display = 'none';
      }
    });
  }

  // Search Logic (Simple Alert for Demo)
  const openSearchBtn = document.querySelector('.search-btn');
  if (openSearchBtn) {
    openSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const query = prompt("क्या आप कुछ खोजना चाहते हैं?");
      if(query) {
        alert("Searching for: " + query);
      }
    });
  }

  console.log("Pratham Genda Portal initialized successfully.");
});
