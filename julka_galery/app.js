document.addEventListener('DOMContentLoaded', () => {

    // --- SELEKTORY ELEMENTÓW ---
    const mainArticle = document.getElementById('main_article');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImg = document.getElementById('modal_img');
    const modalTitle = document.querySelector('.photo_title h1');
    const modalDescription = document.querySelector('.photo_description h1');
    const exitButton = document.getElementById('exit_button');
    const aside = document.querySelector('aside');
    const allAsideButtons = document.querySelectorAll('.aside_button');

    // --- FUNKCJE WYŚWIETLAJĄCE TREŚĆ ---
    function renderGallery(products) {
        mainArticle.innerHTML = '';
        products.forEach(product => {
            const img = document.createElement('img');
            img.src = product.img_path;
            img.alt = product.title;
            img.dataset.title = product.title;
            img.dataset.description = product.description;
            mainArticle.appendChild(img);
        });
    }

    function openSimpleModal(data) {
        modalImg.src = data.img_path;
        modalTitle.textContent = data.title;
        modalDescription.innerHTML = `<h1>${data.description}</h1>`;
        modalOverlay.classList.add('show');
    }

    function openSocialsModal(data) {
        modalImg.src = data.image.img_path;
        modalTitle.textContent = "Moje Sociale";
        modalDescription.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'socials-list';

        data.socials.forEach(social => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = social.link.startsWith('http') ? social.link : `https://${social.link}`;
            link.textContent = social.name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            listItem.appendChild(link);
            list.appendChild(listItem);
        });
        modalDescription.appendChild(list);
        modalOverlay.classList.add('show');
    }

    function openContactModal(data) {
        modalImg.src = data.image.img_path;
        modalTitle.textContent = "Kontakt";
        modalDescription.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'contact-list';

        data.contact.forEach(item => {
            const listItem = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.className = 'contact-name';
            nameSpan.textContent = `${item.name}: `;
            const link = document.createElement('a');
            link.textContent = item.link;

            const nameLower = item.name.toLowerCase();
            if (nameLower === 'mail') {
                link.href = `mailto:${item.link}`;
            } else if (nameLower === 'phone') {
                link.href = `tel:${item.link}`;
            } else {
                link.href = '#';
                link.style.pointerEvents = 'none';
            }
            listItem.appendChild(nameSpan);
            listItem.appendChild(link);
            list.appendChild(listItem);
        });
        modalDescription.appendChild(list);
        modalOverlay.classList.add('show');
    }

    function closeModal() {
        modalOverlay.classList.remove('show');
        allAsideButtons.forEach(button => button.classList.remove('active'));
        document.getElementById('gallery-btn').classList.add('active');

        setTimeout(() => {
            modalTitle.textContent = 'PLACEHOLDER';
            modalDescription.innerHTML = '<h1>PLACEHOLDER</h1>';
            modalImg.src = 'images/placeholder.jpg';
        }, 300);
    }
    
    // --- GŁÓWNA LOGIKA APLIKACJI ---
    async function loadAndDisplayContent(button) {
        const dataSource = button.dataset.source;
        const dataType = button.dataset.type;
        if (!dataSource) return;

        try {
            const response = await fetch(dataSource);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            if (dataType === 'single') {
                openSimpleModal(data.bio || data);
            } else if (dataType === 'socials') {
                openSocialsModal(data);
            } else if (dataType === 'contact') {
                openContactModal(data);
            }

            allAsideButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

        } catch (error) {
            console.error(`Nie udało się załadować danych z ${dataSource}:`, error);
        }
    }

    async function initializeGallery() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            renderGallery(data.products);
        } catch (error) {
            console.error("Nie udało się załadować galerii:", error);
            mainArticle.innerHTML = '<p>Wystąpił błąd podczas ładowania zdjęć.</p>';
        }
    }
    
    // --- OBSŁUGA ZDARZEŃ ---
    function setupEventListeners() {
        aside.addEventListener('click', (event) => {
            if (event.target.matches('button[data-source]')) {
                loadAndDisplayContent(event.target);
            }
        });

        mainArticle.addEventListener('click', (event) => {
            if (event.target.tagName === 'IMG') {
                openSimpleModal({
                    img_path: event.target.src,
                    title: event.target.dataset.title,
                    description: event.target.dataset.description
                });
            }
        });

        exitButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOverlay.classList.contains('show')) {
                closeModal();
            }
        });
    }

    // --- INICJALIZACJA ---
    setupEventListeners();
    initializeGallery();
});