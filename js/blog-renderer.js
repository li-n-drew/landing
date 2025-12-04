// js/blog-renderer.js
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let currentPosts = [];

async function renderBlogList(filterCategory = null, page = 1) {
    console.log('Начинаем рендеринг блога...');
    
    // Ждем загрузки данных
    await blogManager.loadPosts();
    
    const postsContainer = document.getElementById('blog-posts');
    if (!postsContainer) {
        console.error('Не найден контейнер для статей!');
        return;
    }
    
    let posts = blogManager.getAllPosts();
    console.log('Все статьи:', posts);
    
    // Фильтрация по категории если указана
    if (filterCategory) {
        posts = blogManager.getPostsByCategory(filterCategory);
        // Обновляем заголовок страницы
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = `Блог - ${filterCategory}`;
        }
    }
    
    // Сохраняем текущие посты для пагинации
    currentPosts = posts;
    currentPage = page;
    
    // Рассчитываем индексы для текущей страницы
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    console.log(`Страница ${page}: статьи с ${startIndex} по ${endIndex}`, paginatedPosts);
    
    if (paginatedPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <h3>Статьи не найдены</h3>
                <p>Попробуйте выбрать другую категорию или зайти позже.</p>
            </div>
        `;
        // Скрываем пагинацию если нет статей
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    postsContainer.innerHTML = paginatedPosts.map(post => `
        <article class="blog-post fade-in">
            <div class="post-image" style="background-image: url('${post.image}')"></div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-category">${post.category}</span>
                    <span>${post.date}</span>
                    <span>${post.readTime}</span>
                </div>
                <h2 class="post-title">
                    <a href="post.html?slug=${post.slug}">${post.title}</a>
                </h2>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-footer">
                    <a href="post.html?slug=${post.slug}" class="read-more">
                        Читать далее <i class="fas fa-arrow-right"></i>
                    </a>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </article>
    `).join('');
    
    console.log('Статьи отрендерены!');
    
    // Обновляем сайдбар и пагинацию
    updateSidebar();
    renderPagination(posts.length, page, filterCategory);
}

function renderPagination(totalItems, currentPage, filterCategory = null) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        console.error('Не найден контейнер пагинации!');
        return;
    }
    
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    // Рассчитываем диапазон отображаемых страниц
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Корректируем если в начале
    if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
    }
    
    const pageInfo = `Страница ${currentPage} из ${totalPages}`;
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    
    // Создаем параметры URL для фильтрации
    const filterParams = filterCategory ? `&category=${encodeURIComponent(filterCategory)}` : '';
    
    paginationContainer.innerHTML = `
        <div class="pagination-info">${pageInfo}</div>
        <div class="pagination-pages">
            <a href="?page=1${filterParams}" class="pagination-button ${prevDisabled}" ${prevDisabled ? 'onclick="return false;"' : ''}>
                <i class="fas fa-angle-double-left"></i>
            </a>
            <a href="?page=${currentPage - 1}${filterParams}" class="pagination-button ${prevDisabled}" ${prevDisabled ? 'onclick="return false;"' : ''}>
                <i class="fas fa-angle-left"></i>
            </a>
            
            ${Array.from({length: endPage - startPage + 1}, (_, i) => {
                const pageNum = startPage + i;
                const isActive = pageNum === currentPage ? 'active' : '';
                return `
                    <a href="?page=${pageNum}${filterParams}" class="page-number ${isActive}">
                        ${pageNum}
                    </a>
                `;
            }).join('')}
            
            <a href="?page=${currentPage + 1}${filterParams}" class="pagination-button ${nextDisabled}" ${nextDisabled ? 'onclick="return false;"' : ''}>
                <i class="fas fa-angle-right"></i>
            </a>
            <a href="?page=${totalPages}${filterParams}" class="pagination-button ${nextDisabled}" ${nextDisabled ? 'onclick="return false;"' : ''}>
                <i class="fas fa-angle-double-right"></i>
            </a>
        </div>
    `;
    
    // Добавляем обработчики событий для плавной навигации
    addPaginationEventListeners(filterCategory);
}

function addPaginationEventListeners(filterCategory = null) {
    const paginationLinks = document.querySelectorAll('.pagination-button:not(.disabled), .page-number:not(.active)');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const urlParams = new URLSearchParams(this.getAttribute('href').split('?')[1]);
            const page = parseInt(urlParams.get('page')) || 1;
            
            // Плавная прокрутка к верху
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Обновляем отображение
            renderBlogList(filterCategory, page);
            
            // Обновляем URL без перезагрузки страницы
            const newUrl = `${window.location.pathname}?page=${page}${filterCategory ? `&category=${encodeURIComponent(filterCategory)}` : ''}`;
            window.history.pushState({}, '', newUrl);
        });
    });
}

function updateSidebar() {
    updateCategories();
    updatePopularPosts();
    updateTags();
}

function updateCategories() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) {
        console.error('Не найден список категорий!');
        return;
    }
    
    const categories = blogManager.getCategories();
    console.log('Категории:', categories);
    
    categoriesList.innerHTML = Object.entries(categories)
        .map(([category, count]) => `
            <li>
                <a href="blog.html?category=${encodeURIComponent(category)}" class="category-link">
                    ${category} 
                    <span class="category-count">${count}</span>
                </a>
            </li>
        `).join('');
}

function updatePopularPosts() {
    const popularPostsContainer = document.getElementById('popular-posts');
    if (!popularPostsContainer) {
        console.error('Не найден контейнер популярных статей!');
        return;
    }
    
    const popularPosts = blogManager.getPopularPosts();
    console.log('Популярные статьи:', popularPosts);
    
    popularPostsContainer.innerHTML = popularPosts.map(post => `
        <li class="popular-post">
            <div class="popular-post-image" style="background-image: url('${post.image}')"></div>
            <div class="popular-post-content">
                <h4><a href="post.html?slug=${post.slug}">${post.title}</a></h4>
                <div class="popular-post-meta">${post.date}</div>
            </div>
        </li>
    `).join('');
}

function updateTags() {
    const tagsContainer = document.getElementById('tags-cloud');
    if (!tagsContainer) return;
    
    const allTags = new Set();
    blogManager.getAllPosts().forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });
    
    tagsContainer.innerHTML = Array.from(allTags)
        .map(tag => `<a href="blog.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`)
        .join('');
}

// Обработка фильтрации по категориям и тегам
function handleFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const tag = urlParams.get('tag');
    const page = parseInt(urlParams.get('page')) || 1;
    
    console.log('Параметры URL:', { category, tag, page });
    
    if (category) {
        renderBlogList(category, page);
    } else {
        renderBlogList(null, page);
    }
}

// Добавляем обработчик ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Обработка кнопок браузера вперед/назад
window.addEventListener('popstate', function() {
    handleFilters();
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, запускаем блог...');
    handleFilters();
});