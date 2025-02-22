// Mapa pro různé seznamy
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

// Funkce pro zobrazení produktu







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

// 🚀 Inicializace stránky
document.addEventListener("DOMContentLoaded", fetchProductData);


// Funkce pro inicializaci stránky a načítání obsahu podle URL
async function initializePage() {
    const listId = getQueryParam("list");
    const articleId = getQueryParam("article");
    const productId = getQueryParam("product");

    // Skrytí statického obsahu, pokud je parametr 'list', 'article' nebo 'product' v URL
    if (articleId) {
        document.getElementById("static-content").style.display = "none";
        document.getElementById("dynamic-content").style.display = "none";
        document.getElementById("article-show").style.display = "block";
        await fetchArticleData(); // Načteme a zobrazíme článek
    } else if (listId) {
        document.getElementById("static-content").style.display = "none";
        document.getElementById("dynamic-content").style.display = "block";
        document.getElementById("article-show").style.display = "none";
        document.getElementById("product-show").style.display = "none";
        const data = await fetchListData(listId);
        if (data) {
            allMovies = data;
            currentPage = 0;
            document.getElementById("list-title").innerText = allMovies.title;
            renderItems(); // První vykreslení seznamu
        }
    } else if (productId) {
        document.getElementById("static-content").style.display = "none";
        document.getElementById("dynamic-content").style.display = "none";
        document.getElementById("article-show").style.display = "none";
        document.getElementById("product-show").style.display = "block";
        await fetchProductData(); // Načteme a zobrazíme produkt
    } else {
        document.getElementById("static-content").style.display = "block";
        document.getElementById("dynamic-content").style.display = "none";
        document.getElementById("article-show").style.display = "none";
        document.getElementById("product-show").style.display = "none";
    }
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

