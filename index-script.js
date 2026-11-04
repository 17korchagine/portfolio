(function() {
  // ----- IMAGE CAROUSEL FOR KORCHAGINE -----
  const imagePaths = [
    'k7.jpg',
    'k1.jpg',
    'k2.jpg',
    'k9.jpg',
    'k3.jpg',
    'k4.jpg',
    'k5.jpg',
    'k6.jpg',
    'k7.jpg',
    'k8.jpg',
    'k9.jpg',
    'k10.jpg',
  ];

  const titleContainer = document.getElementById('rotatingTitle');
  let currentImageIndex = 0;

  imagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });

  function swapImage() {
    titleContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = imagePaths[currentImageIndex % imagePaths.length];
    img.alt = 'korchagine';
    titleContainer.appendChild(img);
    currentImageIndex++;
  }

  if (imagePaths.length > 0) {
    swapImage();
  } else {
    titleContainer.textContent = 'seventeen korchagine';
  }

  setInterval(swapImage, 250);

  // ----- PROJECT DATA -----
  let projects = [

        { 
      title: 'Video Reel',
      date: '2026',
      category: 'video',
      image: 'reel/template-website.jpg',
      mobileImage: 'reel/template-website-mobile.jpg',
      hoverImage: 'image3.png',
      link:  'https://youtu.be/IARy-qI5jPA'
    },

    { 
      title: 'A Question Of Privacy',
      date: '2025',
      category: 'print',
      image: 'privacy_book/template-website.jpg',
      mobileImage: 'privacy_book/template-website-mobile-1.jpg',
      hoverImage: 'privacy_book/zine_full8.jpg',
      link: 'privacy_book.html'
    },

    { 
      title: 'When Will I Be?',
      date: '2026',
      category: 'print',
      image: 'wwib_book/template-website-1.jpg',
      mobileImage: 'wwib_book/template-website-mobile-1.jpg',
      hoverImage: 'wwib_book/book-15.png',
      link: 'wwib_book.html'
    },

        { 
      title: 'Light Fabrics',
      date: '2025',
      category: 'concept',
      image: 'light_fabrics/template-website.jpg',
      mobileImage: 'light_fabrics/template-website-mobile.jpg',
      hoverImage: 'light_fabrics/template-website.jpg',
      link: 'light_fabrics.html'
    },

    { 
      title: 'Last Moments Aggregate',
      date: '2025',
      category: 'web',
      image: 'lag/template-website.jpg',
      mobileImage: 'lag/template-website-mobile.jpg',
      hoverImage: 'lag/lu4.jpg',
      link: 'aggregate.html'
    },
    { 
      title: 'TalkToDeadPeople.live',
      date: '2025',
      category: 'web',
      image: 'ghost/template-website.jpg',
      mobileImage: 'ghost/template-website-mobile.jpg',
      hoverImage: 'image3.png',
      link: 'ghosts.html'
    },

  ];

  const workContainer = document.getElementById('workContainer');
  const filterMenu = document.getElementById('filterMenu');
  const filterItems = filterMenu.querySelectorAll('.filter-item');
  let currentFilter = 'all';

  // ----- RENDER WORK ITEMS -----
  // ----- RENDER WORK ITEMS -----
  function renderWorks(filter = 'all') {
    workContainer.innerHTML = '';
    
    const filteredProjects = filter === 'all' 
      ? projects 
      : projects.filter(p => p.category === filter);
    
    // Check if mobile
    const isMobile = window.innerWidth <= 480;
    
    filteredProjects.forEach((p, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'work-item visible';

      // ----- IMAGE (different for mobile) -----
      const img = document.createElement('img');
      img.className = 'work-image';
      
      let imageSrc;
      if (isMobile && p.mobileImage) {
        imageSrc = p.mobileImage;
      } else {
        imageSrc = p.image || 'placeholder.jpg';
      }
      
      img.src = imageSrc;
      img.alt = p.title;
      img.onerror = function() {
        if (isMobile && p.mobileImage) {
          this.src = p.image || 'placeholder.jpg';
        } else {
          this.style.display = 'none';
          wrapper.style.backgroundColor = '#e8e0d8';
          wrapper.style.minHeight = '200px';
        }
      };
      wrapper.appendChild(img);

      if (isMobile) {
        // Mobile: Title with date on the same row
        const titleDiv = document.createElement('div');
        titleDiv.className = 'work-title-overlay';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'title-text';
        titleSpan.textContent = p.title;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'date-text';
        dateSpan.textContent = p.date;
        
        titleDiv.appendChild(titleSpan);
        titleDiv.appendChild(dateSpan);
        wrapper.appendChild(titleDiv);
      } else {
        // Desktop: Title and date appear on hover
        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'work-title-overlay';
        titleOverlay.textContent = p.title;
        wrapper.appendChild(titleOverlay);

        const dateOverlay = document.createElement('div');
        dateOverlay.className = 'work-date-overlay';
        dateOverlay.textContent = p.date;
        wrapper.appendChild(dateOverlay);
      }

      // ----- CLICK (opens external links in new tab) -----
      wrapper.addEventListener('click', function(e) {
        if (p.link) {
          if (p.link.startsWith('http://') || p.link.startsWith('https://')) {
            window.open(p.link, '_blank');
          } else {
            window.location.href = p.link;
          }
        } else {
          alert(`📁 Work: ${p.title}\nCategory: ${p.category}\nDate: ${p.date}`);
        }
      });

      workContainer.appendChild(wrapper);
    });
  }

  // ----- RE-RENDER ON RESIZE (for mobile/desktop switch) -----
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      renderWorks(currentFilter);
    }, 250);
  });

  // ----- FILTER FUNCTION -----
  function setFilter(filter) {
    currentFilter = filter;
    
    filterItems.forEach(item => {
      item.classList.toggle('active', item.dataset.filter === filter);
    });
    
    renderWorks(filter);
  }

  // ----- FILTER CLICK EVENTS -----
  filterItems.forEach(item => {
    item.addEventListener('click', function() {
      const filter = this.dataset.filter;
      setFilter(filter);
    });
  });

  // Initial render
  renderWorks('all');

  // ----- SCROLL TO WORKS -----
  function scrollToWorks() {
    const worksSection = document.getElementById('worksSection');
    worksSection.scrollIntoView({ behavior: 'smooth' });
  }

  // ----- KEYBOARD AND CLICK SCROLL (desktop only) -----
  document.addEventListener('keydown', function(e) {
    if (window.innerWidth <= 480) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const landing = document.getElementById('landing');
    const landingHeight = landing.offsetHeight;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPosition < landingHeight * 0.8) {
      scrollToWorks();
    }
  });

  document.getElementById('landing').addEventListener('click', function() {
    if (window.innerWidth <= 480) return;
    scrollToWorks();
  });

  // ----- NAVIGATION -----
  document.querySelectorAll('.top-menu span').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const section = this.dataset.section;
      
      if (section === 'works') {
        scrollToWorks();
      } else if (section === 'about') {
        window.location.href = 'about.html';
      } else if (section === 'contact') {
        window.location.href = 'contact.html';
      }
    });
  });

  console.log('📸 Desktop: template-website.jpg | Mobile: template-website-mobile.jpg');
})();
