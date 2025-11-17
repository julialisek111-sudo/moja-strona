document.addEventListener('DOMContentLoaded', () => {

    const mainArticle = document.getElementById('main_article');
    const modalOverlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal_img');
    const modalTitle = document.querySelector('.photo_title h1');
    const modalDescription = document.querySelector('.photo_description h1');
    const exitButton = document.getElementById('exit_button');
    const aside = document.querySelector('aside');
    const allAsideButtons = document.querySelectorAll('.aside_button');

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
            if (nameLower.includes('mail')) {
                link.href = `mailto:${item.link}`;
            } else if (nameLower.includes('phone')) {
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
    
    function openStreamModal(channelName) {
        modal.classList.add('modal--stream-mode');
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.twitch.tv/?channel=${channelName}&parent=julialisek.onrender.com`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('height', '100%');
        iframe.setAttribute('width', '100%');
        
        modal.appendChild(iframe);
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
            const iframe = modal.querySelector('iframe');
            if (iframe) {
                iframe.remove();
            }
            modal.classList.remove('modal--stream-mode');
        }, 300);
    }
    
    async function loadAndDisplayContent(button) {
        const dataSource = button.dataset.source;
        const dataType = button.dataset.type;
        
        if (dataType === 'stream') {
            const channel = button.dataset.channel;
            openStreamModal(channel);
            allAsideButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            return;
        }

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
    
    function setupEventListeners() {
        aside.addEventListener('click', (event) => {
            if (event.target.matches('button[data-type]')) {
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
            if (event.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOverlay.classList.contains('show')) closeModal();
        });
    }

    setupEventListeners();
    initializeGallery();
});