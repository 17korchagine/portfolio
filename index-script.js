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
      title: 'Podcast Identity',
      date: '2026',
      category: 'concept',
      image: 'podcast_id_1/template-website.jpg',
      hoverImage: 'podcast_id_2/img2.png',
      link: 'podcast.html'
    },
    { 
      title: 'Light Fabrics',
      date: '2025',
      category: 'concept',
      image: 'light_fabrics/template-website.jpg',
      hoverImage: 'light_fabrics/template-website.jpg',
      link: 'light_fabrics.html'
    },
    { 
      title: 'E-Traxx Düsseldorf',
      date: '2026',
      category: 'print',
      image: 'image2.png',
      hoverImage: 'image3.png',
      link: 'etraxx.html'
    },
    { 
      title: 'Music Venue Posters',
      date: '2026',
      category: 'concept',
      image: 'event_posters/template-website.jpg',
      hoverImage: 'lag/img2.png',
      link: 'posters.html'
    },
    { 
      title: 'A Question Of Privacy',
      date: '2025',
      category: 'print',
      image: 'privacy_book/template-website.jpg',
      hoverImage: 'privacy_book/zine_full8.jpg',
      link: 'privacy_book.html'
    },
    { 
      title: 'When Will I Be?',
      date: '2026',
      category: 'print',
      image: 'wwib_book/template-website.jpg',
      hoverImage: 'wwib_book/book-15.png',
      link: 'wwib.html'
    },
    { 
      title: 'Last Moments Aggregate',
      date: '2025',
      category: 'web',
      image: 'lag/template-website.jpg',
      hoverImage: 'lag/lu4.jpg',
      link: 'aggregate.html'
    },
    { 
      title: 'TalkToDeadPeople.live',
      date: '2025',
      category: 'web',
      image: 'ghost/template-website.jpg',
      hoverImage: 'image3.png',
      link: 'ghost.html'
    },
    { 
      title: 'Kansas City Goons',
      date: '2026',
      category: 'art',
      image: 'illustration2/template-website.jpg',
      hoverImage: 'image3.png',
      link: 'illustration_goons.html'
    },
    { 
      title: 'Too Good Too Go',
      date: '2024',
      category: 'concept',
      image: 'image2.png',
      hoverImage: 'image3.png',
      link: 'work-print-pulse.html'
    },
    { 
      title: 'Dancing Tiles Tool',
      date: '2026',
      category: 'video',
      image: 'elliott_smith/template-website.jpg',
      hoverImage: 'image3.png',
      link: 'work-print-pulse.html'
    },
    { 
      title: 'Circe Archiv - Menschen und Züge',
      date: '2026',
      category: 'video',
      image: 'image2.png',
      hoverImage: 'image3.png',
      link: 'work-print-pulse.html'
    },
    { 
      title: 'Miniature Torture Device',
      date: '2024',
      category: 'video',
      image: 'image2.png',
      hoverImage: 'image3.png',
      link: 'work-print-pulse.html'
    },
    { 
      title: 'SALEM - WEPT',
      date: '2024',
      category: 'video',
      image: 'salem_weep/template-website.jpg',
      hoverImage: 'image3.png',
      link: 'work-print-pulse.html'
    },
  ];

  const workContainer = document.getElementById('workContainer');
  const filterMenu = document.getElementById('filterMenu');
  const filterItems = filterMenu.querySelectorAll('.filter-item');
  let currentFilter = 'all';

  // ----- RENDER WORK ITEMS -----
  function renderWorks(filter = 'all') {
    workContainer.innerHTML = '';
    
    const filteredProjects = filter === 'all' 
      ? projects 
      : projects.filter(p => p.category === filter);
    
    const isMobile = window.innerWidth <= 480;
    
    filteredProjects.forEach((p, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'work-item visible';

      const img = document.createElement('img');
      img.className = 'work-image';
      img.src = p.image || 'placeholder.jpg';
      img.alt = p.title;
      img.onerror = function() {
        this.style.display = 'none';
        wrapper.style.backgroundColor = '#e8e0d8';
        wrapper.style.minHeight = '200px';
      };
      wrapper.appendChild(img);

      if (isMobile) {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'work-title-overlay';
        titleDiv.textContent = p.title;
        wrapper.appendChild(titleDiv);
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'work-date-overlay';
        dateDiv.textContent = p.date;
        wrapper.appendChild(dateDiv);
      } else {
        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'work-title-overlay';
        titleOverlay.textContent = p.title;
        wrapper.appendChild(titleOverlay);

        const dateOverlay = document.createElement('div');
        dateOverlay.className = 'work-date-overlay';
        dateOverlay.textContent = p.date;
        wrapper.appendChild(dateOverlay);
      }

      wrapper.addEventListener('click', function(e) {
        if (p.link) {
          window.location.href = p.link;
        } else {
          alert(`📁 Work: ${p.title}\nCategory: ${p.category}\nDate: ${p.date}`);
        }
      });

      workContainer.appendChild(wrapper);
    });
  }

  // ----- RE-RENDER ON RESIZE -----
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

  console.log('📸 Full-width layout with filter menu (always visible)');
  console.log('   Categories: concept, print, web, video, art');
})();