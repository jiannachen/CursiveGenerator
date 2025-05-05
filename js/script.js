document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const textInput = document.getElementById('textInput');
    const previewText = document.getElementById('previewText');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');

    const modeToggle = document.getElementById('modeToggle');
    const fontItems = document.querySelectorAll('.font-card');
    const vfxBtns = document.querySelectorAll('.vfx-option');
    const copyButton = document.querySelector('.copy-button');

    const alignButton = document.querySelector('.align-button'); // 修改为单个按钮
    const previewCopyButton = document.getElementById('previewCopyBtn'); // 获取预览区域复制按钮

    initGuideTabs();
    const isMainPage = textInput && previewText && clearBtn && saveBtn;
    // State variables
 
    if (!isMainPage) {
      console.log('当前页面不包含文本生成器组件，跳过相关功能初始化');
      return;
    }
    

    // 在这里调用 initGuideTabs 函数
      
    // Initialize
    let currentFont = 'Dancing Script';
    let currentVfx = 'default';
    let currentAlignment = 'center';
    const alignments = ['left', 'center', 'right']; // 对齐方式数组

    updatePreview();
    applyFontToItems();
    // Set default font
    fontItems[0].classList.add('active');
    // Event Listeners
    textInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearText);
    saveBtn.addEventListener('click', saveAsImage);
    modeToggle.addEventListener('change', toggleMode);
    // 文本对齐控制
    alignButton.addEventListener('click', () => {
    // 获取当前对齐方式的索引
    const currentIndex = alignments.indexOf(currentAlignment);
    // 切换到下一个对齐方式
    currentAlignment = alignments[(currentIndex + 1) % alignments.length];
    
    // 更新按钮图标
    alignButton.innerHTML = `<i class="fas fa-align-${currentAlignment}"></i>`;
    
    // 更新对齐方式
    updateTextAlignment();
    addRippleEffect(alignButton);
    });
    // 更新文本对齐方法
    function updateTextAlignment() {
           // 直接设置输入框的样式
           textInput.style.textAlign = currentAlignment;
        
           // 更新预览区域的对齐方式 - 不要在这里设置类，而是在updatePreview中统一处理
           
           // 更新预览
           updatePreview();
           
           // 同步更新预览模态框中的文本对齐方式
           const previewImageText = document.getElementById('previewImageText');
           if (previewImageText) {
               previewImageText.style.textAlign = currentAlignment;
           }
    }
    // Copy button functionality
    if (copyButton) {
        copyButton.addEventListener('click', copyToClipboard);
    }
    
    // 为预览区域的复制按钮添加事件监听器
    if (previewCopyButton) {
        previewCopyButton.addEventListener('click', function() {
            copyStyledText();
            addRippleEffect(previewCopyButton);
        });
    }
    
 
    // Font items click events
    fontItems.forEach(item => {
      item.addEventListener('click', () => {
        const font = item.getAttribute('data-font-name');
        currentFont = font;
        fontItems.forEach(fi => fi.classList.remove('active'));
        item.classList.add('active');
        applyFontToItems();
        updatePreview();
        
        // 如果开启了输入区域预览模式，同步更新输入区域字体
        if (modeToggle.checked) {
            textInput.style.fontFamily = currentFont;
        }
        
        addRippleEffect(item);
        });
    });
    // VFX buttons click events
    vfxBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const vfx = btn.getAttribute('data-vfx');
        currentVfx = vfx;
        vfxBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 更新预览
        updatePreview();
        
        // 如果开启了输入区域预览模式，同步更新输入区域特效
        if (modeToggle.checked) {
            // 清除所有特效类
            textInput.className = 'text-area';
            
            // 添加当前特效类
            if (currentVfx === 'default') {
              textInput.classList.add('vfx-default');
            } else {
              textInput.classList.add(`vfx-${currentVfx}`);
            }
        }
        
        addRippleEffect(btn);
      });
    });
    // Apply font to preview items
    function applyFontToItems() {
        fontItems.forEach(item => {
            const font = item.getAttribute('data-font-name');
            item.style.fontFamily = font;
        });
    }
    // Update preview text
    function updatePreview() {
      if (!textInput) return;
      const text = textInput.value || 'Type something...';
      if (!previewText) return;
      previewText.textContent = text;
      previewText.style.fontFamily = currentFont;
      
      // 完全重置类名，然后添加所需的类
      previewText.className = 'preview-text';
      
      // 添加当前特效类
      if (currentVfx !== 'default') {
          previewText.classList.add(`vfx-${currentVfx}`);
      }else{
        previewText.classList.add('vfx-default'); 
      }
      
      // 添加当前对齐类 - 直接使用currentAlignment变量
      previewText.classList.add(`align-${currentAlignment}`);
      
      // 同时设置style属性以确保对齐方式生效
      previewText.style.textAlign = currentAlignment;
    }
    // 初始化时设置默认对齐状态
    updateTextAlignment();
    // Clear text
    function clearText() {
        textInput.value = '';
        updatePreview();
        addRippleEffect(clearBtn);
    }
    // Toggle preview mode
    function togglePreview() {
        addRippleEffect(previewBtn);        
        // 调用打开预览模态框的函数
        if (typeof openPreviewModal === 'function') {
            openPreviewModal();
        }
    }



    function toggleMode() {
      const isChecked = modeToggle.checked;
      const previewControls = document.querySelector('.preview-controls');

      // --- 清理旧样式 ---
      // 移除所有可能的 VFX 类
      vfxBtns.forEach(btn => {
          const vfxClass = `vfx-${btn.getAttribute('data-vfx')}`;
          // 确保只移除实际的特效类，而不是 'vfx-default' (如果它不是一个真正的类)
          if (vfxClass !== 'vfx-default' || textInput.classList.contains('vfx-default')) {
             textInput.classList.remove(vfxClass);
          }
      });
      // 如果 'vfx-default' 是一个实际应用的类，也移除它
      // textInput.classList.remove('vfx-default'); // 根据你的 CSS 决定是否需要这行

      if (isChecked) {
          // --- 开启预览模式 ---
          textInput.style.fontFamily = currentFont;
          textInput.style.textAlign = currentAlignment;
          // 可以考虑强制设置 line-height，但这可能覆盖某些字体的最佳显示效果
          textInput.style.lineHeight = '1.6';

          // 应用当前特效类
          if (currentVfx !== 'default') {
              textInput.classList.add(`vfx-${currentVfx}`);
          } else {
            // 如果 'vfx-default' 是一个需要添加的类
            // textInput.classList.add('vfx-default');
          }

          // 隐藏预览区域相关元素
          if (previewText) previewText.style.display = 'none';
          if (previewCopyButton) previewCopyButton.style.display = 'none'; // 使用 'none' 隐藏
          if (previewControls) previewControls.style.display = 'none';

      } else {
          // --- 关闭预览模式 ---
          textInput.style.fontFamily = ''; // 恢复默认字体
          textInput.style.textAlign = 'center'; // 恢复默认对齐或初始对齐
          // textInput.style.lineHeight = ''; // 恢复默认行高

          // VFX 类已在上面清除

          // 显示预览区域相关元素
          if (previewText) previewText.style.display = 'block'; // 或 'flex' 等原始 display 值
          if (previewCopyButton) previewCopyButton.style.display = 'flex'; // 恢复 display
          if (previewControls) previewControls.style.display = 'flex'; // 恢复 display
      }
    }

   


   
    
    // Save as image
    function saveAsImage() {
        // 添加波纹效果
        addRippleEffect(saveBtn);
        
        // 创建一个临时的预览容器，类似于预览模态框中的容器
        const tempContainer = document.createElement('div');
        tempContainer.className = 'preview-image-container';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        
        // 根据屏幕宽度设置容器宽度
        const screenWidth = window.innerWidth;
        const containerWidth = screenWidth > 768 ? '600px' : (screenWidth - 40) + 'px';
        tempContainer.style.width = containerWidth;
        tempContainer.style.padding = '20px';
        //tempContainer.style.backgroundColor = '#ffffff';
        
        // 创建预览文本元素
        const tempText = document.createElement('div');
        tempText.className = 'preview-text';
        tempText.textContent = textInput.value || 'Type something...';
        tempText.style.textAlign = currentAlignment; // 应用当前对齐方式
        
        // 获取当前字体
        const selectedFont = document.querySelector('.font-card.active');
        const fontFamily = selectedFont ? selectedFont.getAttribute('data-font-name') : currentFont;
        
        // 设置字体和样式
        tempText.style.fontFamily = fontFamily;
        // 根据屏幕宽度调整字体大小
        tempText.style.fontSize = screenWidth > 768 ? '36px' : '28px';
        tempText.style.lineHeight = '1.5';
        //tempText.style.color = '#333';
        
        // 应用当前特效
        if (currentVfx !== 'default') {
          tempText.classList.add(`vfx-${currentVfx}`);
        }
        else{
          tempText.classList.add(`vfx-default`)
        }
        
        // 添加到临时容器
        tempContainer.appendChild(tempText);
        document.body.appendChild(tempContainer);
        // 给样式应用一点时间
    setTimeout(() => {
        // 使用html2canvas将临时容器转换为图片
        html2canvas(tempContainer, {
            backgroundColor:null,
            scale: window.devicePixelRatio || 1, // 使用设备像素比例
            logging: false,
            useCORS: true
        }).then(function(canvas) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'cursive-text.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // 移除临时容器
            document.body.removeChild(tempContainer);
            
            // 显示通知
            showNotification('图片已保存！');
        }).catch(function(error) {
            console.error('保存图片时出错:', error);
            showNotification('保存图片失败，请重试');
            
            // 确保临时容器被移除
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
        });
      }, 300)
    }
    // Add ripple effect
    function addRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }
    
  });


// 预览功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取预览相关元素
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const downloadPreviewBtn = document.getElementById('downloadPreviewBtn');
    const previewImageContainer = document.getElementById('previewImageContainer');
    const previewImageText = document.getElementById('previewImageText');
    const textInput = document.getElementById('textInput');
    
    // 打开预览模态框
    function openPreviewModal() {
      // 获取输入文本
      const text = textInput.value || 'Type something...';
      
      // 获取当前字体
      const selectedFont = document.querySelector('.font-card.active');
      const fontFamily = selectedFont ? selectedFont.getAttribute('data-font-name') : 'Dancing Script';
      
      // 获取当前特效
      const activeVfx = document.querySelector('.vfx-option.active');
      const currentVfx = activeVfx ? activeVfx.getAttribute('data-vfx') : 'default';
      
      // 设置预览文本内容
      previewImageText.textContent = text;
      
      // 设置字体
      previewImageText.style.fontFamily = `"${fontFamily}", cursive`;
      
      // 设置对齐方式
      previewImageText.style.textAlign = currentAlignment;
      
      // 清除所有特效类
      previewImageContainer.className = 'preview-image-container';
      previewImageText.className = 'preview-image-text';
      
      // 应用当前特效
      if (currentVfx !== 'default') {
        previewImageContainer.classList.add(`vfx-${currentVfx}`);
        previewImageText.classList.add(`vfx-${currentVfx}`);
      }
      
      // 显示模态框
      previewModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    // 关闭预览模态框
    function closePreviewModalFunc() {
      previewModal.classList.remove('active');
      document.body.style.overflow = ''; // 恢复背景滚动
    }
    
    // 下载预览图片
    function downloadPreviewImage() {
      // 使用html2canvas库将预览容器转换为图片
      html2canvas(previewImageContainer, {
        backgroundColor: null, // 使用透明背景以保持原始背景
        scale: 2, // 提高导出图片质量
        logging: false,
        useCORS: true
      }).then(function(canvas) {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'cursive-text.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
    
    // 添加事件监听器
    if (previewBtn) {
      previewBtn.addEventListener('click', openPreviewModal);
    }
    
    if (closePreviewModal) {
      closePreviewModal.addEventListener('click', closePreviewModalFunc);
    }
    
    if (closePreviewBtn) {
      closePreviewBtn.addEventListener('click', closePreviewModalFunc);
    }
    
    if (downloadPreviewBtn) {
      downloadPreviewBtn.addEventListener('click', downloadPreviewImage);
    }
    
    // 暴露函数到全局作用域，以便其他地方调用
    window.openPreviewModal = openPreviewModal;
  });

// 语言切换功能
document.addEventListener('DOMContentLoaded', function() {
  // 获取当前页面路径
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  const isChinese = currentPath.includes('/cn/');
  
  // 获取语言选择器元素
  const langOptions = document.querySelectorAll('.lang-option');
  
  // 为每个语言选项更新href
  langOptions.forEach(option => {
      const lang = option.getAttribute('data-lang');
      if (lang === 'en') {
          // 英文版链接 - 如果当前在中文页面，需要返回上一级
          option.href = isChinese ? '../' + currentPage : currentPage;
      } else if (lang === 'zh') {
          // 中文版链接 - 如果当前在英文页面，需要进入cn目录
          option.href = isChinese ? currentPage : './cn/' + currentPage;
      }
      
      // 保存语言偏好
      option.addEventListener('click', function() {
          localStorage.setItem('preferredLanguage', lang);
      });
  });
});
 
  
// 全局语言切换函数
function switchLanguage(lang) {
    // 保存语言设置到localStorage
    localStorage.setItem('preferredLanguage', lang);
    
    // 触发语言变化事件
    const event = new Event('languageChanged');
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    
    console.log('语言已切换为:', lang);
}

// 指南页面标签切换功能
function initGuideTabs() {
  // 检查是否在指南页面
  const tabsContainer = document.querySelector('.tabs-container');
  if (!tabsContainer) {
    console.log('未找到标签容器，可能不在指南页面');
    return;
  }
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  console.log('找到标签按钮:', tabBtns.length, '个，标签内容:', tabPanes.length, '个');
  
  if (tabBtns.length === 0 || tabPanes.length === 0) {
    console.error('未找到标签按钮或内容面板');
    return;
  }
  
  // 定义局部的 addRippleEffect 函数，确保在指南页面也能使用
  function addRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault(); // 防止链接默认行为
      
      // 移除所有活动状态
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // 添加当前活动状态
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      const targetPane = document.getElementById(tabId);
      
      if (targetPane) {
        targetPane.classList.add('active');
        console.log('切换到标签:', tabId);
      } else {
        console.error('找不到对应的标签内容:', tabId);
      }
      
      // 添加点击效果
      addRippleEffect(this);
    });
  });
  
  // 确保默认有一个标签处于激活状态
  if (tabBtns.length > 0 && !document.querySelector('.tab-btn.active')) {
    tabBtns[0].click();
  }
  
  console.log('指南标签初始化完成，共', tabBtns.length, '个标签');
}

document.addEventListener('DOMContentLoaded', function() {
  const fontNameToggle = document.getElementById('fontNameToggle');
  const fontGrid = document.querySelector('.font-grid');

  if (fontNameToggle && fontGrid) {
    fontNameToggle.addEventListener('change', function() {
      if (this.checked) {
        fontGrid.classList.add('show-font-names');
      } else {
        fontGrid.classList.remove('show-font-names');
      }
    });
  }
  
  // 显示通知函数 - 全局定义以便其他地方调用
  window.showNotification = function(message) {
    // 检查是否已存在通知元素
    let notification = document.querySelector('.notification');
    
    // 如果不存在，创建一个
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // 设置消息内容
    notification.textContent = message;
    notification.classList.add('show');
    
    // 3秒后隐藏通知
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  };
  setTimeout(initAccordion, 100); // 短暂延迟确保DOM完全渲染
});
// ... 现有代码 ...

// 添加手风琴效果初始化函数

function initAccordion() {
  console.log('初始化手风琴效果');
  // 检查是否在移动端视图
  const isMobile = window.innerWidth <= 768;
  
  const containers = document.querySelectorAll('.guide-steps-container, .tips-container');
  console.log('找到容器数量:', containers.length);
  
  containers.forEach(container => {
      const header = container.querySelector('h3');
      const content = container.querySelector('.guide-steps, .tips-list');
      
      if (header && content) {
          // 添加指示器
          if (!header.querySelector('.accordion-icon')) {
              const icon = document.createElement('span');
              icon.className = 'accordion-icon';
              icon.innerHTML = '<i class="fas fa-chevron-down"></i>';
              header.appendChild(icon);
          }
          
          // 重置内容样式
          content.style.transition = 'max-height 0.3s ease-out';
          
          if (isMobile) {
              // 移动端默认收起
              content.style.overflow = 'hidden';
              content.style.maxHeight = '0px';
              container.classList.remove('open');
          } else {
              // 非移动端显示所有内容
              content.style.maxHeight = 'none';
              content.style.overflow = 'visible';
              container.classList.remove('open');
          }
          
          // 移除旧的事件监听器
          if (header.accordionHandler) {
              header.removeEventListener('click', header.accordionHandler);
          }
          
          // 创建新的事件处理函数
          header.accordionHandler = function() {
              if (window.innerWidth <= 768) {
                  const isOpen = container.classList.contains('open');
                  
                  // 关闭所有其他面板
                  containers.forEach(c => {
                      if (c !== container && c.classList.contains('open')) {
                          c.classList.remove('open');
                          const otherContent = c.querySelector('.guide-steps, .tips-list');
                          const otherIcon = c.querySelector('.accordion-icon i');
                          if (otherContent) {
                              otherContent.style.maxHeight = '0px';
                          }
                          if (otherIcon) {
                              otherIcon.className = 'fas fa-chevron-down';
                          }
                      }
                  });
                  
                  // 切换当前面板
                  if (!isOpen) {
                      container.classList.add('open');
                      
                      // 先设置一个较大的值，确保内容能完全展开
                      content.style.maxHeight = '2000px';
                      
                      // 获取实际高度
                      setTimeout(() => {
                          const actualHeight = content.scrollHeight;
                          content.style.maxHeight = actualHeight + 'px';
                          console.log('设置面板高度:', actualHeight + 'px');
                      }, 10);
                      
                      const icon = header.querySelector('.accordion-icon i');
                      if (icon) {
                          icon.className = 'fas fa-chevron-up';
                      }
                  } else {
                      container.classList.remove('open');
                      content.style.maxHeight = '0px';
                      const icon = header.querySelector('.accordion-icon i');
                      if (icon) {
                          icon.className = 'fas fa-chevron-down';
                      }
                  }
              }
          };
          
          // 添加点击事件
          header.addEventListener('click', header.accordionHandler);
          
          // 默认打开第一个面板（仅在移动端）
          if (isMobile && containers[0] === container) {
              setTimeout(() => {
                  header.accordionHandler();
              }, 200);
          }
      }
  });
}

// 添加窗口大小变化监听
window.addEventListener('resize', function() {
  const containers = document.querySelectorAll('.guide-steps-container, .tips-container');
  const isMobile = window.innerWidth <= 768;
  
  containers.forEach(container => {
      const content = container.querySelector('.guide-steps, .tips-list');
      const header = container.querySelector('h3');
      const icon = header?.querySelector('.accordion-icon i');
      
      if (content) {
          if (!isMobile) {
              // 在非移动端视图中显示所有内容
              content.style.maxHeight = 'none';
              content.style.overflow = 'visible';
          } else {
              // 在移动端视图中根据开关状态设置
              content.style.transition = 'max-height 0.3s ease-out';
              content.style.overflow = 'hidden';
              
              if (container.classList.contains('open')) {
                  // 重新计算高度以确保完全展开
                  content.style.maxHeight = 'none';
                  const actualHeight = content.scrollHeight;
                  content.style.maxHeight = actualHeight + 'px';
                  
                  if (icon) icon.className = 'fas fa-chevron-up';
              } else {
                  content.style.maxHeight = '0px';
                  if (icon) icon.className = 'fas fa-chevron-down';
              }
          }
      }
  });
});