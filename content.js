
﻿// Mapa pro různé seznamy
const listMap = {
    "lists": "lists.json", // Mapa pro různé seznamy
    "articles": "articleslist.json",
    "trans-movies": "transmovies.json"
};

// Proměnné pro stránkování
let currentPage = 0;
const itemsPerPage = 40;
let allMovies = []; // Pole pro uložení filmů
const list1 = document.getElementById("list-1");
const list2 = document.getElementById("list-2");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

// Funkce pro načtení seznamu JSON
async function fetchListData(listId) {
    const fileName = listMap[listId];
    if (!fileName) return null;

    try {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error('Soubor nenalezen');
        }
        return await response.json();
    } catch (error) {
        document.getElementById("list-container").innerHTML = `<p>Chyba při načítání dat: ${error.message}</p>`;
        return null;
    }
}

// Funkce pro vykreslení položek seznamu filmů
function renderItems() {
    const isMobile = window.innerWidth <= 768;

    // Vyčistíme seznamy
    list1.innerHTML = "";
    list2.innerHTML = "";

    if (isMobile) {
        allMovies.items.forEach(item => {
            const linkLabel = allMovies.linkLabel || 'Odkaz'; // Použijeme `linkLabel` z JSON, nebo výchozí "Odkaz"
            const watchLink = item.watch ? ` | <a href="${item.watch}">watch</a>` : ''; // Přidá se jen, pokud existuje

            const li = document.createElement("li");
            li.innerHTML = `${item.title} <a href="${item.link}">${linkLabel}</a>${watchLink}`;
            list1.appendChild(li);
        });

        prevButton.style.display = "none";
        nextButton.style.display = "none";
    } else {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = Math.min((currentPage + 1) * itemsPerPage, allMovies.items.length);

        // První sloupec
        for (let i = startIndex; i < Math.min(startIndex + itemsPerPage / 2, endIndex); i++) {
            const item = allMovies.items[i];
            const linkLabel = allMovies.linkLabel || 'Odkaz';
            const watchLink = item.watch ? ` | <a href="${item.watch}">watch</a>` : '';

            const li = document.createElement("li");
            li.innerHTML = `${item.title} <a href="${item.link}">${linkLabel}</a>${watchLink}`;
            list1.appendChild(li);
        }

        // Druhý sloupec
        for (let i = startIndex + itemsPerPage / 2; i < endIndex; i++) {
            const item = allMovies.items[i];
            const linkLabel = allMovies.linkLabel || 'Odkaz';
            const watchLink = item.watch ? ` | <a href="${item.watch}">watch</a>` : '';

            const li = document.createElement("li");
            li.innerHTML = `${item.title} <a href="${item.link}">${linkLabel}</a>${watchLink}`;
            list2.appendChild(li);
        }

        prevButton.style.display = currentPage > 0 ? "inline" : "none";
        nextButton.style.display = (currentPage + 1) * itemsPerPage < allMovies.items.length ? "inline" : "none";
    }
}

// Funkce pro stránkování na předchozí stránku
function goToPrevious() {
    if (currentPage > 0) {
        currentPage--;
        renderItems();
    }
}

// Funkce pro stránkování na další stránku
function goToNext() {
    if ((currentPage + 1) * itemsPerPage < allMovies.items.length) {
        currentPage++;
        renderItems();
    }
}


// Funkce pro načtení článku
async function fetchArticleData() {
    const urlParams = new URLSearchParams(window.location.search);  // Načteme parametry URL
    const articleId = urlParams.get('article');  // Získáme hodnotu parametru "article"

    if (!articleId) {
        document.getElementById('article-show').innerHTML = '<p>Článek nebyl nalezen. Zkontrolujte ID v URL.</p>';
        return;
    }

    try {
        const response = await fetch('articles.json');
        if (!response.ok) {
            throw new Error('Soubor nenalezen');
        }
        const data = await response.json();
        const article = data.articles.find(a => a.id === articleId); // Hledání článku podle ID

        if (article) {
            displayArticle(article);  // Zobrazení článku
        } else {
            document.getElementById('article-show').innerHTML = '<p>Článek nenalezen.</p>';
        }
    } catch (error) {
        document.getElementById('article-show').innerHTML = `<p>Chyba při načítání článku: ${error.message}</p>`;
    }
}

// Funkce pro zobrazení článku
function displayArticle(article) {
    if (article) {
        const articleHTML = `
            <div class="section article">
                <div class="section-content article-text">
                    <h1 id="article-title">${article.title}</h1>
                    <p id="article-content">${article.content}</p>
                    <p id="article-date" style="margin-top:20px;">${article.date}, ${article.author}</p>
                </div>
            </div>
        `;
        document.getElementById('article-show').innerHTML = articleHTML;
        document.getElementById('article-show').style.display = 'block'; // Zobrazení článku
    } else {
        console.error("Article not found.");
    }
}









// Funkce pro načtení shopu
document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const shopId = urlParams.get('shop') || "pictures"; // Defaultní hodnota "pictures"
    
    const shopShow = document.getElementById("shop-show");
    if (!document.getElementById("tabs")) {
        const tabsDiv = document.createElement("div");
        tabsDiv.id = "tabs";
        shopShow.appendChild(tabsDiv);
    }
    if (!document.getElementById("tab-content")) {
        const contentDiv = document.createElement("div");
        contentDiv.id = "tab-content";
        shopShow.appendChild(contentDiv);
    }
    
    try {
        const [productsResponse, galleriesResponse] = await Promise.all([
            fetch('products.json'),
            fetch('galleries.json')
        ]);
        
        if (!productsResponse.ok || !galleriesResponse.ok) throw new Error('Soubor nenalezen');
        
        const productsData = await productsResponse.json();
        const galleriesData = await galleriesResponse.json();
        
        const productGroups = {}; // Seskupení produktů podle jejich skupiny
        
        productsData.products.forEach(product => {
            if (!productGroups[product.product_group]) {
                productGroups[product.product_group] = [];
            }
            productGroups[product.product_group].push(product);
        });

        generateTabs(productGroups, shopId);
        displayItems(shopId, productGroups, galleriesData);  // Upraveno pro vykreslení produktů
    } catch (error) {
        shopShow.innerHTML = `<p>Chyba při načítání shop: ${error.message}</p>`;
    }
});

function generateTabs(groups, activeShop) {
    const tabsContainer = document.getElementById("tabs");
    tabsContainer.innerHTML = "";
    
    const picturesTab = document.createElement("a");
    picturesTab.href = `?shop=pictures`;
    picturesTab.className = activeShop === "pictures" ? "active" : "";
    picturesTab.textContent = "Pics & Vids";
    tabsContainer.appendChild(picturesTab);
    
    Object.keys(groups).forEach(group => {
        if (group !== "pictures") {
            const tab = document.createElement("a");
            tab.href = `?shop=${group}`;
            tab.className = group === activeShop ? "active" : "";
            tab.textContent = group.charAt(0).toUpperCase() + group.slice(1);
            tab.onclick = (event) => {
                event.preventDefault();
                history.pushState({}, "", `?shop=${group}`);
                displayItems(group, groups, []);  // Zavolání pro jiný tab
                document.querySelectorAll("#tabs a").forEach(el => el.classList.remove("active"));
                tab.classList.add("active");
            };
            tabsContainer.appendChild(tab);
        }
    });
}

function displayItems(shopId, productGroups, galleriesData) {
    const container = document.getElementById("tab-content");
    container.innerHTML = "";

    let allItems = [];

    if (shopId === "pictures") {
        // Seřazujeme produkty a galerie podle data
        allItems = [
            ...productGroups["pictures"] || [],
            ...galleriesData.galleries.map(gallery => ({
                ...gallery,
                product_group: "gallery",
                price: "FREE", // Pro galerie místo ceny
                is_gallery: true
            }))
        ];

        // Seřadit od nejnovějšího k nejstaršímu podle data (pouze pro galerii a obrázky)
        allItems.sort((a, b) => new Date(b.date) - new Date(a.date)); 
    } else {
        // Filtrovat produkty podle kategorie tabulky
        allItems = productGroups[shopId] || [];
    }

    if (allItems.length === 0) {
        container.innerHTML = `<p>Žádné produkty v této kategorii.</p>`;
        return;
    }

    const cardContainer = document.createElement("div");
    cardContainer.className = "card-item";
    
    allItems.forEach(item => {
        const productCard = document.createElement("a");
        productCard.href = item.is_gallery ? `/gallery=${item.id}` : `?product=${item.id}`;
        productCard.className = "card-link";
        
        // Pokud není obrázek pro produkt/galerii, ponecháme místo prázdné
        const itemImage = item.images && item.images[0] ? item.images[0] : "";
        
        // Výběr správného názvu a popisu pro angličtinu
        const name = item.is_gallery ? item.name : item.name_en;
        const description = item.is_gallery ? item.description : item.description_en;
        
        // Výpočet ceny: Pokud je sleva, zobrazí se původní cena jako přeškrtnutá a nová cena
        let priceHTML = "";
        if (!item.is_gallery && item.discount === "yes" && item.discount_percent > 0) {
            const originalPrice = item.price;
            const discountPrice = originalPrice - (originalPrice * (item.discount_percent / 100));
            priceHTML = `
                <div class="price-container">
                    <span class="original-price" style="text-decoration: line-through;">${originalPrice.toFixed(2)} €</span>
                    <span class="discount-price">${discountPrice.toFixed(2)} €</span>
                </div>
            `;
        } else {
            priceHTML = item.price === "FREE" ? `<strong>FREE</strong>` : `<strong>${item.price.toFixed(2)} €</strong>`;
        }

        productCard.innerHTML = `
            <div class="card-image">
                ${itemImage ? `<img src="${itemImage}" alt="${name}" loading="lazy">` : ""}
            </div>
            <div class="card-info">
                <div class="card-title">${name}</div>
                <div class="card-description">${description}</div>
                <div class="card-price" style="text-align: right;">
                    ${priceHTML}
                </div>
            </div>
        `;
        cardContainer.appendChild(productCard);
    });
    
    container.appendChild(cardContainer);

    // Vytvoříme taby s požadovaným stylem
    const tabsContainer = document.getElementById("tab-content");
    const allTabs = tabsContainer.querySelectorAll(".tab");
    
    allTabs.forEach(tab => {
        tab.style.minHeight = "calc(75vh - 45px)"; // Přidání požadovaného min-height na všechny taby
    });
}




    











// 🛒 Funkce pro získání parametru z URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 📦 Funkce pro načtení dat o produktu ze souboru products.json
async function fetchProductData() {
    const productId = getQueryParam("product"); // Získáme ID produktu z URL

    if (!productId) {
        document.getElementById('product-show').innerHTML = '<p>Produkt nebyl nalezen. Zkontrolujte ID v URL.</p>';
        return;
    }

    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Soubor products.json nenalezen');
        }
        const data = await response.json();
        const product = data.products.find(p => p.id === productId);

        if (product) {
            displayProduct(product);
        } else {
            document.getElementById('product-show').innerHTML = '<p>Produkt nenalezen.</p>';
        }
    } catch (error) {
        document.getElementById('product-show').innerHTML = `<p>Chyba při načítání produktu: ${error.message}</p>`;
    }
}

// 🎨 Funkce pro zobrazení produktu
function displayProduct(product) {
    if (!product) {
        console.error("Product not found.");
        return;
    }

    const productHTML = `
        <div class="section item">
            <div class="section-content item-text">
                <h1 id="product-name">${product.name_en}</h1>
                <p id="product-description">${product.description_en}</p>
                <a id="buy-link" href="${product.link}" class="hero">Buy now!</a>
                <a id="shop-link" href="${product.link}" class="hero blue">More information</a>
            </div>
            <div class="item-container" id="item-images" data-images="${product.images.join(',')}">
                <img id="main-item-img" loading="lazy" src="${product.images[0]}" alt="${product.name_en}">
                <div class="price-tag" id="price-tag">
                    <span id="price">${(product.discount === 'yes' ? (product.price * (1 - product.discount_percent / 100)).toFixed(2) : product.price.toFixed(2))} EUR</span>
                    <div id="discount-info" style="font-size:10px; line-height: 1.2;">
                        ${product.discount === 'yes' ? `
                            <span id="discount-text">${product.discount_percent}% off, originally ${product.price.toFixed(2)} EUR</span>
                            <div id="countdown"></div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // 🖼️ Vložení vygenerovaného HTML do divu s id "product-show"
    const productShow = document.getElementById('product-show');
    productShow.innerHTML = productHTML;

    // 🔄 Přepínání obrázků při kliknutí
    const productImages = product.images;
    const mainImage = document.getElementById('main-item-img');
    let currentImageIndex = 0;

    mainImage.addEventListener('click', function () {
        currentImageIndex = (currentImageIndex + 1) % productImages.length;
        mainImage.src = productImages[currentImageIndex];
    });

    // ⏳ Zobrazení slevy a countdown (pokud existuje)
    if (product.discount === 'yes' && product.discount_end_date) {
        const countdownDate = new Date(product.discount_end_date).getTime();
        function updateCountdown() {
            const now = new Date().getTime();
            const timeRemaining = countdownDate - now;

            if (timeRemaining < 0) {
                clearInterval(countdownInterval);
                document.getElementById("countdown").innerHTML = "Sleva vypršela!";
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            document.getElementById("countdown").innerHTML = `ends in ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    } else {
        document.getElementById('discount-info').style.display = 'none';
    }
}


// 🎨 Funkce pro načtení galerie
document.addEventListener("DOMContentLoaded", fetchGalleryData);

async function fetchGalleryData() {
    const urlParams = new URLSearchParams(window.location.search);
    const galleryId = urlParams.get('gallery');

    if (!galleryId) {
        document.getElementById('gallery-show').innerHTML = '<p>Galerie nebyla nalezena. Zkontrolujte ID v URL.</p>';
        return;
    }

    try {
        const response = await fetch('galleries.json');
        if (!response.ok) throw new Error('Soubor nenalezen');

        const data = await response.json();
        const gallery = data.galleries.find(g => g.id === galleryId);

        if (gallery) {
            displayGallery(gallery);
        } else {
            document.getElementById('gallery-show').innerHTML = '<p>Galerie nenalezena.</p>';
        }
    } catch (error) {
        document.getElementById('gallery-show').innerHTML = `<p>Chyba při načítání galerie: ${error.message}</p>`;
    }
}

// Funkce pro zobrazení galerie
function displayGallery(gallery) {
    document.getElementById('gallery-show').innerHTML = `
        <div class="section gallery">
            <div class="section-content gallery-text" id="gallery-info">
                <h1>${gallery.name}</h1>
                <p>${gallery.description}</p>
                <p style="text-align: right; font-size: 0.8rem;">${gallery.date} | <span id="tumblr-notes">0 notes</span></p>
            </div>
            <div class="gallery-container" id="gallery-images"></div>
        </div>`;

    if (gallery["tumblr-id"]) {
        loadTumblrGallery(gallery["tumblr-id"]);
    } else {
        loadLocalGallery(gallery.id);
    }
}

// Funkce pro načtení galerie z Tumblr API
async function loadTumblrGallery(tumblrId) {
    const apiKey = 'YuwtkxS7sYF0DOW41yK2rBeZaTgcZWMHHNhi1TNXht3Pf7Lkdf';
    const tumblrBlog = 'gabrielaprazska.tumblr.com';

    try {
        const response = await fetch(`https://api.tumblr.com/v2/blog/${tumblrBlog}/posts?id=${tumblrId}&api_key=${apiKey}`);
        const data = await response.json();
        if (data.response.posts && data.response.posts.length > 0) {
            const post = data.response.posts[0];
            const images = post.photos ? post.photos.map(photo => createThumbnail(photo.original_size.url, tumblrId)).join('') : '';

            if (images) {
                document.getElementById('gallery-images').innerHTML = images;
                document.getElementById('tumblr-notes').textContent = `${post.note_count} notes`;
                addThumbnailClickEvents();
            } else {
                document.getElementById('gallery-images').innerHTML = '<p>Galerie neobsahuje žádné obrázky.</p>';
            }
        } else {
            document.getElementById('gallery-images').innerHTML = '<p>Galerie nebyla nalezena na Tumblr.</p>';
        }
    } catch (error) {
        console.error("Chyba při načítání z Tumblr API:", error);
        document.getElementById('gallery-images').innerHTML = `<p>Chyba při načítání galerie z Tumblr: ${error.message}</p>`;
    }
}

// Funkce pro načtení galerie z lokálních souborů
function loadLocalGallery(galleryId) {
    let imagesHTML = "";
    let i = 1;
    while (true) {
        const imgPath = `img/gallery/${galleryId}/${i}.webp`;
        if (!imageExists(imgPath)) break;  // Konec, pokud obrázek neexistuje
        imagesHTML += createThumbnail(imgPath);
        i++;
    }
    if (imagesHTML) {
        document.getElementById('gallery-images').innerHTML = imagesHTML;
        addThumbnailClickEvents();
    } else {
        document.getElementById('gallery-images').innerHTML = '<p>Galerie neobsahuje žádné obrázky.</p>';
    }
}

// Funkce pro kontrolu existence obrázku
function imageExists(src) {
    const img = new Image();
    img.src = src;
    return img.height !== 0;
}

// Funkce pro vytvoření náhledu obrázku
function createThumbnail(imgSrc, tumblrId) {
    return `<img src="${imgSrc}" class="gallery-thumb" onclick="showImage('${imgSrc}', '${tumblrId}')">`;
}

// Funkce pro zobrazení velkého obrázku
function showImage(imgSrc, tumblrId) {
    const galleryName = document.querySelector('h1').textContent;
    const galleryDescription = document.querySelector('p').textContent;
    const galleryDate = document.querySelector('p:nth-child(3)').textContent;

    // Zobrazení obrázku
    document.getElementById('gallery-info').innerHTML = `
        <img src="${imgSrc}" class="gallery-full">
        <div>
            <p style="text-align: right; font-size: 0.8rem;">${galleryDate} <span id="tumblr-notes"></span> | <a href="">back to galleries</a></p>
        </div>`;

    // Načtení počtu poznámek pro daný Tumblr obrázek
    if (tumblrId) {
        fetchTumblrNotes(tumblrId);
    }
}

// Funkce pro načtení počtu Tumblr poznámek pro obrázek
async function fetchTumblrNotes(tumblrId) {
    const apiKey = 'YuwtkxS7sYF0DOW41yK2rBeZaTgcZWMHHNhi1TNXht3Pf7Lkdf';
    const tumblrBlog = 'gabrielaprazska.tumblr.com';

    try {
        const response = await fetch(`https://api.tumblr.com/v2/blog/${tumblrBlog}/posts?id=${tumblrId}&api_key=${apiKey}`);
        const data = await response.json();
        if (data.response.posts && data.response.posts.length > 0) {
            const post = data.response.posts[0];
            const notes = post.note_count;
            document.getElementById('tumblr-notes').textContent = `${notes} notes`;
        }
    } catch (error) {
        console.error("Chyba při načítání Tumblr poznámek:", error);
        document.getElementById('tumblr-notes').textContent = ` | Chyba při načítání poznámek`;
    }
}

// Funkce pro přidání CSS stylů pro kliknutí na náhledy
function addThumbnailClickEvents() {
    document.querySelectorAll(".gallery-thumb").forEach(img => {
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.objectFit = "cover";
        img.style.borderRadius = "5px";
        img.style.margin = "5px";
        img.style.maxWidth = "200px";  // Nastavení maximální šířky pro náhledy
    });

    const galleryFull = document.querySelector(".gallery-full");
    if (galleryFull) {
        galleryFull.style.width = "100%";
        galleryFull.style.maxWidth = "460px";
        galleryFull.style.borderRadius = "10px";
        galleryFull.style.display = "block";
        galleryFull.style.margin = "auto";
    }
}


// 🚀 Inicializace stránky
document.addEventListener("DOMContentLoaded", initializePage);

// Funkce pro inicializaci stránky a načítání obsahu podle URL
async function initializePage() {
    const listId = getQueryParam("list");
    const articleId = getQueryParam("article");
    const productId = getQueryParam("product");
    const galleryId = getQueryParam("gallery");
    const shopId = getQueryParam("shop"); // Opravená deklarace

    // Skrytí statického obsahu, pokud je parametr 'list', 'article' nebo 'product' v URL
    if (articleId) {
        showSection("article-show");
        await fetchArticleData();
    } else if (listId) {
        showSection("dynamic-content");
        const data = await fetchListData(listId);
        if (data) {
            allMovies = data;
            currentPage = 0;
            document.getElementById("list-title").innerText = allMovies.title;
            renderItems();
        }
    } else if (shopId) {
        showSection("shop-show");
        await fetchProductData();
    } else if (productId) {
        showSection("product-show");
        await fetchProductData();
    } else if (galleryId) {
        showSection("gallery-show");
        await fetchProductData();
    } else {
        showSection("static-content");
    }
}

// Pomocná funkce pro získání hodnoty parametru z URL
function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

// Pomocná funkce pro zobrazení správné sekce
function showSection(sectionId) {
    const sections = ["static-content", "dynamic-content", "article-show", "product-show", "gallery-show", "shop-show"];
    sections.forEach(id => {
        document.getElementById(id).style.display = (id === sectionId) ? "block" : "none";
    });
}




// Pomocná funkce pro získání parametru z URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Funkce pro opětovné načtení při změně šířky okna
function onResize() {
    renderItems();
}

// Spuštění inicializace při načítání stránky
document.addEventListener("DOMContentLoaded", initializePage);

// Přidání event listeneru pro změnu šířky okna
window.addEventListener("resize", onResize);

