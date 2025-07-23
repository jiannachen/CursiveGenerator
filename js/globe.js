// 等待DOM加载完成后执行所有功能
document.addEventListener('DOMContentLoaded', function() {
    // ===== 导航栏移动端菜单切换 =====
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const navLinks = document.querySelectorAll('.navbar-link');
    
    if (navbarToggle && navbarMenu) {
        // 切换菜单显示状态
        navbarToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            navbarMenu.classList.toggle('active');
            // 切换body滚动锁定，防止背景滚动
            document.body.style.overflow = navbarMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // 为每个导航链接添加点击事件
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // 确保链接可点击
                e.stopPropagation();
                
                // 如果是移动端，点击链接后关闭菜单
                if (window.innerWidth <= 768) {
                    navbarMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // 点击页面其他区域关闭菜单
        document.addEventListener('click', function(e) {
            if (navbarMenu.classList.contains('active') && 
                !navbarMenu.contains(e.target) && 
                e.target !== navbarToggle) {
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ===== 语言选择器功能 =====
    const langSelector = document.querySelector('.language-selector');
    const currentLang = document.getElementById('currentLang');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (langSelector) {
        // 显示/隐藏语言下拉菜单
        langSelector.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
        
        // 语言选择处理
        langOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                // 不阻止默认行为，允许链接跳转
                const href = this.getAttribute('href');
                
                // 如果有href属性，让浏览器正常跳转
                if (href) {
                    return;
                }
                
                // 如果没有href属性，则使用本地切换逻辑
                e.preventDefault();
                if (currentLang) {
                    currentLang.textContent = this.textContent;
                }
                
                langOptions.forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                // 这里可以添加本地语言切换逻辑
                // ...
            });
        });
        
        // 点击其他地方关闭语言下拉菜单
        document.addEventListener('click', function() {
            if (langSelector) {
                langSelector.classList.remove('active');
            }
        });
    }
});

// 确保 showNotification 函数在全局范围内可用
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }, 100);
}