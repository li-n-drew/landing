// js/blog-manager.js
class BlogManager {
    constructor() {
        this.posts = [];
        this.loaded = false;
        this.basePath = window.location.pathname.includes('/blog.html') ? './' : './';
    }

    // Загрузка данных из JSON файла
    async loadPosts() {
        try {
            console.log('Начинаем загрузку данных...');
            const response = await fetch('./data/blog-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.posts = data.posts;
            this.loaded = true;
            console.log('Загружено статей:', this.posts.length);
            console.log('Статьи:', this.posts);
            return this.posts;
        } catch (error) {
            console.error('Ошибка загрузки данных блога:', error);
            // Покажем тестовые данные если файл не загрузился
            this.posts = this.getTestData();
            this.loaded = true;
            return this.posts;
        }
    }

    // Тестовые данные на случай проблем с загрузкой
    getTestData() {
        return [
            {
                id: 1,
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                category: 'Кэшбэк',
                date: '15 мая 2025',
                readTime: '8 мин чтения',
                title: 'Как получать максимальный кэшбэк с каждой покупки',
                excerpt: 'Узнайте, как правильно использовать банковские карты с кэшбэком, чтобы получать до 30% возврата от каждой покупки.',
                slug: 'kak-poluchat-maksimalnyj-keshbek',
                contentFile: './posts/kak-poluchat-maksimalnyj-keshbek.html',
                tags: ['кэшбэк', 'карты', 'экономия']
            },
            {
                id: 2,
                image: 'https://images.unsplash.com/photo-1563013546-7e58a73c2c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                category: 'Банковские карты',
                date: '10 мая 2025',
                readTime: '6 мин чтения',
                title: 'Топ-5 карт с кэшбэком в 2025 году',
                excerpt: 'Сравниваем лучшие предложения банков по кэшбэк-картам.',
                slug: 'top-5-kart-s-keshbekom-2025',
                contentFile: './posts/top-5-kart-s-keshbekom-2025.html',
                tags: ['карты', 'топ', 'сравнение']
            }
        ];
    }

    // Загрузка содержимого статьи
    async loadPostContent(contentFile) {
        try {
            console.log('Загружаем содержимое из:', contentFile);
            const response = await fetch(contentFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            return content;
        } catch (error) {
            console.error('Ошибка загрузки содержимого статьи:', error);
            return `
                <div class="article-content">
                    <h2>Статья временно недоступна</h2>
                    <p>Приносим извинения за неудобства. Пожалуйста, попробуйте зайти позже.</p>
                    <a href="blog.html" class="cta-button">Вернуться в блог</a>
                </div>
            `;
        }
    }

    // Получить все посты
    getAllPosts() {
        return this.posts;
    }

    // Найти пост по slug
    getPostBySlug(slug) {
        return this.posts.find(post => post.slug === slug);
    }

    // Получить посты по категории
    getPostsByCategory(category) {
        return this.posts.filter(post => post.category === category);
    }

    // Получить все категории с количеством постов
    getCategories() {
        const categories = {};
        this.posts.forEach(post => {
            categories[post.category] = (categories[post.category] || 0) + 1;
        });
        return categories;
    }

    // Получить популярные посты (первые 3)
    getPopularPosts() {
        return this.posts.slice(0, 3);
    }
}

// Создаем глобальный экземпляр менеджера
const blogManager = new BlogManager();