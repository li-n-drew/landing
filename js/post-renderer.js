// js/post-renderer.js
async function renderPost() {
    console.log('Начинаем загрузку статьи...');
    
    // Получаем slug из URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    console.log('Slug из URL:', slug);
    
    if (!slug) {
        showError('Статья не найдена - не указан идентификатор');
        return;
    }
    
    // Показываем индикатор загрузки
    showLoading();
    
    try {
        // Загружаем данные
        await blogManager.loadPosts();
        const post = blogManager.getPostBySlug(slug);
        
        console.log('Найденная статья:', post);
        
        if (!post) {
            showError('Статья не найдена');
            return;
        }
        
        // Устанавливаем мета-информацию
        document.title = `${post.title} - CashUP! Блог`;
        document.getElementById('post-title').textContent = post.title;
        
        const postMeta = document.getElementById('post-meta');
        if (postMeta) {
            postMeta.innerHTML = `
                <span class="post-category">${post.category}</span>
                <span>${post.date}</span>
                <span>${post.readTime}</span>
            `;
        }
        
        // Устанавливаем изображение
        const postImage = document.getElementById('post-image');
        if (postImage) {
            postImage.style.backgroundImage = `url('${post.image}')`;
        }
        
        // Загружаем и вставляем содержимое
        console.log('Загружаем содержимое из:', post.contentFile);
        const content = await blogManager.loadPostContent(post.contentFile);
        document.getElementById('post-content').innerHTML = content;
        
        // Добавляем теги статьи
        addPostTags(post.tags);
        
        // Показываем связанные статьи
        showRelatedPosts(slug);
        
        // Скрываем индикатор загрузки
        hideLoading();
        
        console.log('Статья успешно загружена!');
        
    } catch (error) {
        console.error('Ошибка загрузки статьи:', error);
        showError('Произошла ошибка при загрузке статьи: ' + error.message);
    }
}

function showLoading() {
    const content = document.getElementById('post-content');
    if (content) {
        content.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка статьи...</p>
            </div>
        `;
    }
}

function showError(message) {
    const content = document.getElementById('post-content');
    if (content) {
        content.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${message}</h3>
                <a href="blog.html" class="cta-button">Вернуться в блог</a>
            </div>
        `;
    }
}

function hideLoading() {
    // Индикатор загрузки скрывается автоматически при загрузке контента
}

function addPostTags(tags) {
    const tagsContainer = document.getElementById('post-tags');
    if (!tagsContainer) return;
    
    if (tags && tags.length > 0) {
        tagsContainer.innerHTML = `
            <h4>Теги статьи:</h4>
            <div class="post-tags">
                ${tags.map(tag => `<a href="blog.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}
            </div>
        `;
    } else {
        tagsContainer.style.display = 'none';
    }
}

function showRelatedPosts(currentSlug) {
    const relatedContainer = document.getElementById('related-posts');
    if (!relatedContainer) return;
    
    // Простая реализация - показываем первые 2 статьи кроме текущей
    const allPosts = blogManager.getAllPosts();
    const relatedPosts = allPosts
        .filter(post => post.slug !== currentSlug)
        .slice(0, 2);
    
    if (relatedPosts.length === 0) {
        relatedContainer.style.display = 'none';
        return;
    }
    
    const relatedGrid = document.getElementById('related-posts-grid');
    relatedGrid.innerHTML = relatedPosts.map(post => `
        <div class="related-post">
            <div class="related-post-image" style="background-image: url('${post.image}')"></div>
            <div class="related-post-content">
                <span class="post-category">${post.category}</span>
                <h4><a href="post.html?slug=${post.slug}">${post.title}</a></h4>
                <p>${post.excerpt}</p>
            </div>
        </div>
    `).join('');
    
    relatedContainer.style.display = 'block';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', renderPost);