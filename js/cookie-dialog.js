// Cookie Dialog Functionality
document.addEventListener('DOMContentLoaded', function() {
    const cookieDialog = document.getElementById('cookieDialog');
    const cookieAcceptBtn = document.getElementById('cookieAcceptBtn');
    
    // Проверяем, не приняты ли уже куки
    if (!localStorage.getItem('cookiesAccepted')) {
        // Показываем диалог с небольшой задержкой
        setTimeout(() => {
            cookieDialog.classList.add('show');
        }, 1000);
    }
    
    // Обработчик кнопки "Принять"
    cookieAcceptBtn.addEventListener('click', function() {
        // Сохраняем согласие в localStorage
        localStorage.setItem('cookiesAccepted', 'true');
        
        // Скрываем диалог
        cookieDialog.classList.remove('show');
        
        // Можно также установить куки для серверной стороны
        setCookie('cookiesAccepted', 'true', 365);
    });
    
    // Функция для установки cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
});