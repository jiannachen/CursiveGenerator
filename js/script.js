document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const textInput = document.getElementById('textInput');
    const previewText = document.getElementById('previewText');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const modeToggle = document.getElementById('modeToggle');
    const fontItems = document.querySelectorAll('.font-card');
    const vfxBtns = document.querySelectorAll('.vfx-option');
    const alignButton = document.querySelector('.align-button');
    const heroCTA = document.querySelector('.hero-cta');
    const feedbackButton = document.getElementById('feedbackButton');
    const openFeedbackBtn = document.getElementById('openFeedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackModal = document.getElementById('closeFeedbackModal');
    const globalFeedbackForm = document.getElementById('globalFeedbackForm');

    // Initialize Feedback Modal Logic
    if (feedbackButton) {
        feedbackButton.addEventListener('click', () => feedbackModal.classList.add('active'));
    }
    if (openFeedbackBtn) {
        openFeedbackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            feedbackModal.classList.add('active');
        });
    }
    if (closeFeedbackModal) {
        closeFeedbackModal.addEventListener('click', () => feedbackModal.classList.remove('active'));
    }
    if (feedbackModal) {
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.classList.remove('active');
            }
        });
    }
    if (globalFeedbackForm) {
        globalFeedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Feedback submitted successfully!');
            feedbackModal.classList.remove('active');
            this.reset();
        });
    }

    const isMainPage = textInput && previewText && clearBtn && saveBtn;

    if (!isMainPage) {
        console.log('当前页面不包含文本生成器组件，跳过相关功能初始化');
        return;
    }

    // Configuration constants
    const CONFIG = {
        DEFAULT_FONT: 'Dancing Script',
        DEFAULT_VFX: 'default',
        DEFAULT_ALIGNMENT: 'center',
        ALIGNMENTS: ['left', 'center', 'right'],
        CANVAS_SCALE: 2,
        FONT_LOAD_DELAY: 250,
        NOTIFICATION_DURATION: 3000
    };

    // State variables
    let currentFont = CONFIG.DEFAULT_FONT;
    let currentVfx = CONFIG.DEFAULT_VFX;
    let currentAlignment = CONFIG.DEFAULT_ALIGNMENT;

    // Initialize
    init();

    function init() {
        updatePreview();
        applyFontToItems();
        fontItems[0]?.classList.add('active');
    }

    // Event Listeners
    textInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearText);
    saveBtn.addEventListener('click', handleDownload); // Direct download on click

    modeToggle.addEventListener('change', toggleMode);

    alignButton.addEventListener('click', () => {
        const currentIndex = CONFIG.ALIGNMENTS.indexOf(currentAlignment);
        currentAlignment = CONFIG.ALIGNMENTS[(currentIndex + 1) % CONFIG.ALIGNMENTS.length];
        alignButton.innerHTML = `<i class="fas fa-align-${currentAlignment}"></i>`;
        updateTextAlignment();
        addRippleEffect(alignButton);
    });

    if (heroCTA) {
        heroCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 60;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    fontItems.forEach(item => {
        item.addEventListener('click', () => {
            currentFont = item.getAttribute('data-font-name');
            fontItems.forEach(fi => fi.classList.remove('active'));
            item.classList.add('active');
            applyFontToItems();
            updatePreview();
            if (modeToggle.checked) {
                textInput.style.fontFamily = currentFont;
            }
            addRippleEffect(item);
        });
    });

    vfxBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentVfx = btn.getAttribute('data-vfx');
            vfxBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePreview();
            if (modeToggle.checked) {
                textInput.className = 'text-area';
                if (currentVfx !== 'default') {
                    textInput.classList.add(`vfx-${currentVfx}`);
                }
            }
            addRippleEffect(btn);
        });
    });

    function applyFontToItems() {
        fontItems.forEach(item => {
            item.style.fontFamily = item.getAttribute('data-font-name');
        });
    }

    function updatePreview() {
        const text = textInput.value || 'Type something...';
        previewText.textContent = text;
        previewText.style.fontFamily = currentFont;
        previewText.className = 'preview-text';
        if (currentVfx !== 'default') {
            previewText.classList.add(`vfx-${currentVfx}`);
        }
        previewText.classList.add(`align-${currentAlignment}`);
        previewText.style.textAlign = currentAlignment;
    }

    function updateTextAlignment() {
        textInput.style.textAlign = currentAlignment;
        updatePreview();
    }

    function clearText() {
        textInput.value = '';
        updatePreview();
        addRippleEffect(clearBtn);
    }

    function toggleMode() {
        const isChecked = modeToggle.checked;
        if (isChecked) {
            textInput.style.fontFamily = currentFont;
            textInput.style.textAlign = currentAlignment;
            if (currentVfx !== 'default') {
                textInput.classList.add(`vfx-${currentVfx}`);
            }
            previewText.style.display = 'none';
        } else {
            textInput.style.fontFamily = '';
            textInput.style.textAlign = 'center';
            textInput.className = 'text-area';
            previewText.style.display = 'block';
        }
    }

    async function generateCanvas() {
        const originalElement = document.getElementById('previewText');
        const text = textInput.value || 'Type something...';

        // Apply the responsive width rule provided by the user.
        const screenWidth = window.innerWidth;
        const targetWidth = screenWidth > 768 ? 600 : screenWidth - 40;

        // Determine the background color based on the current effect.
        const canvasBackgroundColor = (currentVfx === 'default' || currentVfx === 'shadow') ? '#ffffff' : null;

        // Create a clone of the original element to perform calculations off-screen.
        const clone = originalElement.cloneNode(true);

        // If the effect is shadow, explicitly set the clone's background to white for the canvas.
        if (currentVfx === 'shadow') {
            clone.style.backgroundColor = '#ffffff';
        }
        
        // Style the clone to be invisible but laid out correctly with the calculated width.
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '-9999px';
        clone.style.width = targetWidth + 'px'; // Set the calculated responsive width.
        clone.style.height = 'auto'; // Allow height to adjust.
        clone.textContent = text; // Set the current text.

        document.body.appendChild(clone);

        // After setting the width, we get the auto-calculated height.
        const autoHeight = clone.offsetHeight;

        // Use a promise to handle the asynchronous nature of html2canvas.
        return new Promise((resolve, reject) => {
            // A short timeout ensures that web fonts have time to load and apply.
            setTimeout(() => {
                html2canvas(clone, {
                    backgroundColor: canvasBackgroundColor,
                    scale: CONFIG.CANVAS_SCALE,
                    useCORS: true,
                    logging: false,
                    width: targetWidth,
                    height: autoHeight
                }).then(canvas => {
                    document.body.removeChild(clone); // Clean up the DOM.
                    resolve(canvas);
                }).catch(error => {
                    console.error('Error generating canvas:', error);
                    document.body.removeChild(clone); // Ensure cleanup on error.
                    reject(error);
                });
            }, CONFIG.FONT_LOAD_DELAY);
        });
    }

    async function handleDownload() {
        try {
            const canvas = await generateCanvas();
            const imageType = 'image/png';
            const fileExtension = 'png';
            const text = textInput.value.trim().substring(0, 20).replace(/\s+/g, '-').toLowerCase() || 'cursive-text';
            const fileName = `${text}.${fileExtension}`;

            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL(imageType, 1.0);
            link.click();
            showNotification('Download started!');
        } catch (error) {
            console.error('Error generating image for download:', error);
            showNotification('Failed to save image. Please try again.');
        }
    }

    function addRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        element.appendChild(ripple);
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    window.showNotification = function(message) {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, CONFIG.NOTIFICATION_DURATION);
    };
});