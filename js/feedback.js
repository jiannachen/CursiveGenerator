document.addEventListener('DOMContentLoaded', function() {
    // 获取反馈相关元素
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackButton = document.getElementById('feedbackButton');
    const closeFeedbackModal = document.getElementById('closeFeedbackModal');
    const openFeedbackBtn = document.getElementById('openFeedbackBtn');
    const globalFeedbackForm = document.getElementById('globalFeedbackForm');
    const scrollToTopBtn = document.getElementById('scrollToTop');

       // Scroll to top functionality
       if (scrollToTopBtn) {
        // 初始状态隐藏按钮
        scrollToTopBtn.style.display = 'none';
        
        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        // 点击按钮滚动到顶部
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    // 多语言消息
    const messages = {
        en: {
            emptyFeedback: 'Please enter your feedback',
            invalidEmail: 'Please enter a valid email',
            submitSuccess: 'Thank you for your feedback! We will get back to you soon.',
            submitError: 'Failed to send feedback. Please try again later.',
            sending: 'Sending...',
            tooFrequent: 'Please try again later, submissions too frequent',
            tooLong: 'Feedback too long, please be concise'
        },
        zh: {
            emptyFeedback: '请输入反馈内容',
            invalidEmail: '请输入有效的邮箱地址',
            submitSuccess: '感谢您的反馈！我们会尽快回复您。',
            submitError: '发送反馈失败，请稍后重试。',
            sending: '发送中...',
            tooFrequent: '请稍后再试，提交过于频繁',
            tooLong: '反馈内容过长，请精简'
        }
    };
    
    // 初始化 Firebase
    function initFirebase() {

        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK未加载，请确保在HTML中引入了Firebase SDK');
            return;
        }
        if (firebase.apps.length > 0) {
            console.log('Firebase已经初始化，跳过重复初始化');
            return;
        }
        // Firebase 配置
        const firebaseConfig = {
            apiKey: "AIzaSyC-vpiFVYnioOuKGFO-n7Ja1JXeEcLQm14",
            authDomain: "cursivegenerator-f9f73.firebaseapp.com",
            databaseURL: "https://cursivegenerator-f9f73-default-rtdb.asia-southeast1.firebasedatabase.app", // 添加数据库URL
            projectId: "cursivegenerator-f9f73",
            storageBucket: "cursivegenerator-f9f73.appspot.com", // 修正storageBucket
            messagingSenderId: "443261748584",
            appId: "1:443261748584:web:78927799fe5f99496f42dd",
            measurementId: "G-BZZK2B59QW"
        };
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase初始化成功');
        } catch (error) {
            console.error('Firebase初始化失败:', error);
        }
        
        // 初始化 Firebase
        }
    
        function getCurrentLang() {
            return localStorage.getItem('preferredLanguage') || 'en';
        }
        
        // 验证邮箱格式
        function validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
        function updateFormTexts() {
            const currentLang = getCurrentLang();
            console.log('当前语言设置:', currentLang);
            
            const formTexts = {
                en: {
                    title: 'Feedback',
                    feedbackPlaceholder: 'Please enter your feedback here...',
                    emailPlaceholder: 'Your email (optional)',
                    submitButton: 'Submit',
                    closeButton: 'Close'
                },
                zh: {
                    title: '反馈',
                    feedbackPlaceholder: '请在此输入您的反馈...',
                    emailPlaceholder: '您的邮箱（选填）',
                    submitButton: '提交',
                    closeButton: '关闭'
                }
            };
            
            // 确保使用有效的语言代码
            const lang = (currentLang === 'zh' || currentLang === 'en') ? currentLang : 'en';
            
            // 更新表单元素文本
            const modalTitle = document.querySelector('#feedbackModal .modal-title');
            const feedbackInput = document.getElementById('globalFeedback');
            const emailInput = document.getElementById('globalEmail');
            const submitBtn = document.querySelector('#globalFeedbackForm button[type="submit"]');
            const closeBtn = document.getElementById('closeFeedbackModal');
            
            if (modalTitle) modalTitle.textContent = formTexts[lang].title;
            if (feedbackInput) feedbackInput.placeholder = formTexts[lang].feedbackPlaceholder;
            if (emailInput) emailInput.placeholder = formTexts[lang].emailPlaceholder;
            if (submitBtn) submitBtn.textContent = formTexts[lang].submitButton;
            if (closeBtn) closeBtn.textContent = formTexts[lang].closeButton;
            
            console.log('反馈表单语言已更新为:', lang);
        }
    

 // 每次打开反馈模态框时更新语言
 function openFeedbackModal() {
    feedbackModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
    updateFormTexts(); // 确保每次打开模态框时更新语言
    console.log('打开反馈模态框，当前语言:', getCurrentLang());
}
    
    // 关闭反馈模态框函数
    function closeFeedbackModalFunc() {
        feedbackModal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复背景滚动
    }
    
    // 添加事件监听器
    if(feedbackButton) {
        feedbackButton.addEventListener('click', openFeedbackModal);
    }
    
    if(closeFeedbackModal) {
        closeFeedbackModal.addEventListener('click', closeFeedbackModalFunc);
    }
       // 添加ESC键关闭功能
       document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && feedbackModal.classList.contains('active')) {
            closeFeedbackModalFunc();
        }
    });
    
    // 页脚中的反馈链接
    if(openFeedbackBtn) {
        openFeedbackBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止默认链接行为
            openFeedbackModal();
        });
    }
    
    // 点击模态框外部关闭
    if(feedbackModal) {
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                closeFeedbackModalFunc();
            }
        });
    }
 

    
    // 处理表单提交
    if(globalFeedbackForm) {
        // 添加防抖动功能，防止短时间内多次提交
        let lastSubmitTime = 0;
        const SUBMIT_COOLDOWN = 10000; // 10秒冷却时间
        
        globalFeedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentLang = getCurrentLang();
            const currentTime = new Date().getTime();
            
            // 检查是否在冷却期内
            if (currentTime - lastSubmitTime < SUBMIT_COOLDOWN) {
                showNotification(currentLang === 'zh' ? 
                    messages.zh.tooFrequent : 
                    messages.en.tooFrequent);
                return;
            }
            
            const feedback = document.getElementById('globalFeedback').value;
            const email = document.getElementById('globalEmail').value;
            
            // 验证表单
            if (!feedback.trim()) {
                showNotification(currentLang === 'zh' ? 
                    messages.zh.emptyFeedback : 
                    messages.en.emptyFeedback);
                return;
            }
            
            if (email.trim() && !validateEmail(email)) {
                showNotification(currentLang === 'zh' ? 
                    messages.zh.invalidEmail : 
                    messages.en.invalidEmail);
                return;
            }
            
            // 简单的内容审核 - 检查是否包含敏感词或过长内容
            if (feedback.length > 1000) { // 限制反馈长度
                showNotification(currentLang === 'zh' ? 
                    messages.zh.tooLong : 
                    messages.en.tooLong);
                return;
            }
            
            // 显示发送中状态
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = currentLang === 'zh' ? 
                messages.zh.sending : 
                messages.en.sending;
            
            // 准备反馈数据
            const feedbackData = {
                email: email || (currentLang === 'zh' ? '未提供邮箱' : 'No email provided'),
                message: feedback,
                timestamp: new Date().toISOString(),
                language: currentLang,
                userAgent: navigator.userAgent,
                status: 'unread' // 新增状态字段，方便您管理
            };
            
            // 将反馈保存到 Firebase
            const database = firebase.database();
            const feedbackRef = database.ref('feedback');
            
            feedbackRef.push(feedbackData)
                .then(function() {
                    // 保存成功
                    showNotification(currentLang === 'zh' ? 
                        messages.zh.submitSuccess : 
                        messages.en.submitSuccess);
                    
                    // 更新最后提交时间
                    lastSubmitTime = currentTime;
                    
                    // 重置表单
                    globalFeedbackForm.reset();
                    
                    // 关闭模态框
                    closeFeedbackModalFunc();
                })
                .catch(function(error) {
                    // 保存失败
                    console.error('保存反馈失败:', error);
                    showNotification(currentLang === 'zh' ? 
                        messages.zh.submitError : 
                        messages.en.submitError);
                })
                .finally(function() {
                    // 恢复按钮状态
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
        });
    }
 
    
    // 初始化时更新表单文本
    updateFormTexts();
    
   
    window.addEventListener('languageChanged', function() {
        console.log('window检测到语言变化，更新反馈表单');
        updateFormTexts();
    });
    
    document.addEventListener('languageChanged', function() {
        console.log('document检测到语言变化，更新反馈表单');
        updateFormTexts();
    });

    // 初始化 Firebase
    initFirebase();
});