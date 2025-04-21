// 更新调试信息
function updateDebugInfo(message) {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.innerHTML += '\n' + message;
        // 自动滚动到底部
        debugInfo.scrollTop = debugInfo.scrollHeight;
    }
}

// 添加认证令牌存储和过期时间设置
let authToken = localStorage.getItem('authToken') || '';
const tokenExpireTime = 30 * 60 * 1000; // 30分钟过期时间


// 全局变量
let allFeedback = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentFilters = {
    status: 'all',
    language: 'all',
    search: '',
    sort: 'newest',
    startDate: '',  // 添加开始日期过滤
    endDate: ''     // 添加结束日期过滤
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成");
    updateDebugInfo("DOM加载完成");

       // 检查是否有保存的登录状态且未过期
    const expireTime = localStorage.getItem('tokenExpireTime');
    if (authToken && expireTime && Date.now() < parseInt(expireTime)) {
        // 使用保存的登录状态
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'flex';
        updateDebugInfo("使用已保存的登录状态");
        loadFeedback();
    }

    // 登录功能

// 在登录按钮点击事件中，确保正确发送POST请求

// ... 现有代码 ...

document.getElementById('loginBtn').addEventListener('click', function() {
    const password = document.getElementById('password').value;
    
    // 显示加载状态
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
    this.disabled = true;
    
    // 添加调试信息
    updateDebugInfo("正在发送登录请求...");
    
    // 使用完整URL
    const apiUrl = window.location.origin + '/api/auth/login';
    updateDebugInfo("请求URL: " + apiUrl);
    
    // 发送登录请求
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password })
    })
    .then(response => {
        updateDebugInfo("收到响应: " + response.status + " " + response.statusText);
        if (!response.ok) {
            throw new Error('登录失败: ' + response.status + ' ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.token) {
            // 登录成功，保存token
            localStorage.setItem('authToken', data.token); // 修改这里，使用authToken而不是adminToken
            
            // 设置token过期时间
            const expireTime = Date.now() + tokenExpireTime;
            localStorage.setItem('tokenExpireTime', expireTime);
            
            // 更新全局变量
            authToken = data.token;
            
            // 显示管理面板
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'flex';
            
            updateDebugInfo("登录成功，令牌已保存");
            
            // 加载反馈数据
            loadFeedback(); // 修改这里，使用loadFeedback而不是loadFeedbackData
        } else {
            alert('登录失败: ' + (data.message || '未知错误'));
            updateDebugInfo("登录失败: " + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('登录请求错误:', error);
        updateDebugInfo("登录请求错误: " + error.message);
        alert('登录请求错误: ' + error.message);
    })
    .finally(() => {
        // 恢复按钮状态
        this.innerHTML = '登录';
        this.disabled = false;
    });
});

// ... 现有代码 ...
   
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // 清除保存的登录状态
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpireTime');
            authToken = '';
            
            document.getElementById('loginContainer').style.display = 'block';
            document.getElementById('adminContainer').style.display = 'none';
            document.getElementById('password').value = '';
            updateDebugInfo("已退出登录");
        });
    }

    
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    
    if (startDateFilter) {
        startDateFilter.addEventListener('change', function() {
            currentFilters.startDate = this.value;
            currentPage = 1;
            renderFeedbackList();
        });
    }
    
    if (endDateFilter) {
        endDateFilter.addEventListener('change', function() {
            currentFilters.endDate = this.value;
            currentPage = 1;
            renderFeedbackList();
        });
    }


// 侧边栏切换
const toggleSidebarBtn = document.getElementById('toggleSidebar');
if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const sidebarText = document.querySelectorAll('.sidebar-text');
        
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
        
        if (sidebar.classList.contains('sidebar-collapsed')) {
            toggleSidebarBtn.innerHTML = '<i class="fas fa-bars"></i>';
            sidebarText.forEach(el => el.style.display = 'none');
        } else {
            toggleSidebarBtn.innerHTML = '<i class="fas fa-bars"></i> <span class="sidebar-text">收起菜单</span>';
            sidebarText.forEach(el => el.style.display = 'inline');
        }
    });
}
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updateDebugInfo("手动刷新数据");
            loadFeedback();
        });
    }

    
    // 过滤器事件监听
    const statusFilter = document.getElementById('statusFilter');
    const languageFilter = document.getElementById('languageFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            currentPage = 1;
            renderFeedbackList();
        });
    }
    
    if (languageFilter) {
        languageFilter.addEventListener('change', function() {
            currentFilters.language = this.value;
            currentPage = 1;
            renderFeedbackList();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentFilters.sort = this.value;
            currentPage = 1;
            renderFeedbackList();
        });
    }
    
    if (searchInput) {
        // 使用防抖动处理搜索
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = this.value.trim().toLowerCase();
                currentPage = 1;
                renderFeedbackList();
            }, 300);
        });
    }
    
    // 分页控件
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderFeedbackList();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(getFilteredFeedback().length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderFeedbackList();
            }
        });
    }
    
    // 详情模态框关闭按钮
    const closeDetailModal = document.getElementById('closeDetailModal');
    const closeDetailBtn = document.getElementById('closeDetailBtn');
    
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', function() {
            document.getElementById('feedbackDetailModal').style.display = 'none';
        });
    }
    
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', function() {
            document.getElementById('feedbackDetailModal').style.display = 'none';
        });
    }
});



// 加载反馈数据
async function loadFeedback() {
    try {
        // 显示加载状态
        document.getElementById('feedbackList').innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
        
        updateDebugInfo("开始从服务器加载反馈数据");
        const controller = new AbortController();
        const response = await fetch('/api/feedback', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            signal: controller.signal
        }).catch(error => {
            updateDebugInfo("请求发送失败: " + error.message);
            throw error;
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '获取数据失败');
        }
        
        const data = result.data;
        
        if (!data || data.length === 0) {
            document.getElementById('feedbackList').innerHTML = '<div class="empty-state"><i class="fas fa-inbox empty-icon"></i><p class="empty-text">暂无反馈数据</p></div>';
            document.getElementById('feedbackCount').textContent = '0 条反馈';
            updateDebugInfo("没有找到反馈数据");
            return;
        }
        
        // 将返回的数据赋值给全局变量
        allFeedback = data;
        
        updateDebugInfo(`找到 ${allFeedback.length} 条反馈数据`);
        
        // 更新未读数量
        const unreadCount = allFeedback.filter(item => item.status === 'unread').length;
        const feedbackCountEl = document.getElementById('feedbackCount');
        if (feedbackCountEl) {
            feedbackCountEl.textContent = `${unreadCount} 条未读`;
            feedbackCountEl.className = unreadCount > 0 ? 'tag tag-unread' : 'tag tag-read';
        }
        
        // 渲染反馈列表
        renderFeedbackList();
    } catch (error) {
        console.error("加载反馈数据失败:", error);
        updateDebugInfo("加载反馈数据失败: " + error.message);
        document.getElementById('feedbackList').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon"></i><p class="empty-text">加载反馈数据失败</p></div>';
    }
}

// 获取过滤后的反馈数据
function getFilteredFeedback() {
    return allFeedback.filter(feedback => {
        // 状态过滤
        if (currentFilters.status !== 'all' && feedback.status !== currentFilters.status) {
            return false;
        }
        
        // 语言过滤
        if (currentFilters.language !== 'all' && feedback.language !== currentFilters.language) {
            return false;
        }
        
        // 日期过滤 - 开始日期
        if (currentFilters.startDate) {
            const feedbackDate = new Date(feedback.timestamp);
            const startDate = new Date(currentFilters.startDate);
            startDate.setHours(0, 0, 0, 0); // 设置为当天开始时间
            
            if (feedbackDate < startDate) {
                return false;
            }
        }
        
        // 日期过滤 - 结束日期
        if (currentFilters.endDate) {
            const feedbackDate = new Date(feedback.timestamp);
            const endDate = new Date(currentFilters.endDate);
            endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
            
            if (feedbackDate > endDate) {
                return false;
            }
        }
        
        // 搜索过滤
        if (currentFilters.search && !(
            feedback.message.toLowerCase().includes(currentFilters.search) || 
            feedback.email.toLowerCase().includes(currentFilters.search)
        )) {
            return false;
        }
        
        return true;
    }).sort((a, b) => {
        // 排序
        if (currentFilters.sort === 'newest') {
            return new Date(b.timestamp) - new Date(a.timestamp);
        } else {
            return new Date(a.timestamp) - new Date(b.timestamp);
        }
    });
}

// 渲染反馈列表
function renderFeedbackList() {
    const filteredFeedback = getFilteredFeedback();
    const feedbackList = document.getElementById('feedbackList');
    
    // 计算分页
    const totalItems = filteredFeedback.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    // 更新分页控件
    updatePagination(currentPage, totalPages);
    
    // 如果没有数据
    if (totalItems === 0) {
        feedbackList.innerHTML = '<div class="empty-state"><i class="fas fa-search empty-icon"></i><p class="empty-text">没有找到匹配的反馈</p></div>';
        return;
    }
    
    // 清空列表
    feedbackList.innerHTML = '';
    
    // 添加当前页的反馈项
    for (let i = startIndex; i < endIndex; i++) {
        const feedback = filteredFeedback[i];
        const date = new Date(feedback.timestamp);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        const feedbackItem = document.createElement('div');
        feedbackItem.className = `feedback-item ${feedback.status === 'unread' ? 'status-unread' : 'status-read'}`;
        feedbackItem.dataset.id = feedback.id;
        
        feedbackItem.innerHTML = `
            <div class="feedback-meta">
                <div class="feedback-meta-item"><i class="fas fa-envelope"></i> ${feedback.email}</div>
                <div class="feedback-meta-item"><i class="fas fa-clock"></i> ${formattedDate}</div>
                <div class="feedback-meta-item"><i class="fas fa-language"></i> ${feedback.language}</div>
                <div class="feedback-meta-item">
                    <i class="fas fa-circle ${feedback.status === 'unread' ? 'text-primary' : 'text-success'}"></i>
                    <span class="tag ${feedback.status === 'unread' ? 'tag-unread' : 'tag-read'}">
                        ${feedback.status === 'unread' ? '未读' : '已读'}
                    </span>
                </div>
            </div>
            <div class="feedback-message">
                ${feedback.message.replace(/\n/g, '<br>')}
            </div>
            <div style="text-align: right;">
                ${feedback.status === 'unread' ? 
                    `<button class="btn btn-success" onclick="markAsRead('${feedback.id}')">
                        <i class="fas fa-check"></i> 标记为已读
                    </button>` : 
                    `<button class="btn btn-text" disabled>
                        <i class="fas fa-check"></i> 已读
                    </button>`
                }
                <button class="btn btn-text" onclick="showFeedbackDetail('${feedback.id}')">
                    <i class="fas fa-eye"></i> 查看详情
                </button>
                <button class="btn btn-danger" onclick="confirmDelete('${feedback.id}')">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;
        
        feedbackList.appendChild(feedbackItem);
    }
    
    // 添加分页信息
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    paginationInfo.textContent = `显示 ${startIndex + 1} - ${endIndex} 条，共 ${totalItems} 条`;
    feedbackList.appendChild(paginationInfo);
}

// 更新分页控件
function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    // 清空分页控件
    pagination.innerHTML = '';
    
    // 上一页按钮
    const prevBtn = document.createElement('div');
    prevBtn.className = `pagination-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.textContent = '«';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderFeedbackList();
        }
    });
    pagination.appendChild(prevBtn);
    
    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('div');
        pageBtn.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderFeedbackList();
        });
        pagination.appendChild(pageBtn);
    }
    
    // 下一页按钮
    const nextBtn = document.createElement('div');
    nextBtn.className = `pagination-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.textContent = '»';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderFeedbackList();
        }
    });
    pagination.appendChild(nextBtn);
}

// 显示反馈详情
function showFeedbackDetail(feedbackId) {
    const feedback = allFeedback.find(item => item.id === feedbackId);
    if (!feedback) return;
    
    const modal = document.getElementById('feedbackDetailModal');
    const content = document.getElementById('feedbackDetailContent');
    const markAsReadBtn = document.getElementById('markAsReadBtn');
    const deleteBtn = document.getElementById('deleteFeedbackBtn'); // 添加这一行，获取删除按钮元素
    
    if (!modal || !content) return;
    
    const date = new Date(feedback.timestamp);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="margin-bottom: 10px;"><strong>邮箱:</strong> ${feedback.email}</div>
            <div style="margin-bottom: 10px;"><strong>时间:</strong> ${formattedDate}</div>
            <div style="margin-bottom: 10px;"><strong>语言:</strong> ${feedback.language}</div>
            <div style="margin-bottom: 10px;">
                <strong>状态:</strong> 
                <span class="tag ${feedback.status === 'unread' ? 'tag-unread' : 'tag-read'}">
                    ${feedback.status === 'unread' ? '未读' : '已读'}
                </span>
            </div>
        </div>
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 4px;">
            ${feedback.message.replace(/\n/g, '<br>')}
        </div>
    `;
    
    // 更新标记为已读按钮状态
    if (markAsReadBtn) {
        if (feedback.status === 'unread') {
            markAsReadBtn.style.display = 'inline-block';
            markAsReadBtn.onclick = function() {
                markAsRead(feedbackId);
                modal.style.display = 'none';
            };
        } else {
            markAsReadBtn.style.display = 'none';
        }
    }
     // 设置删除按钮
    if (deleteBtn) {
        deleteBtn.onclick = function() {
            if (confirm('确定要删除这条反馈吗？此操作不可撤销。')) {
                deleteFeedback(feedbackId);
                modal.style.display = 'none';
            }
        };
    }
    modal.style.display = 'block';
}
// 添加删除反馈的函数
async function deleteFeedback(feedbackId) {
    try {
        const response = await fetch(`/api/feedback/${feedbackId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || '删除反馈失败');
        }
        
        console.log('反馈已删除');
        updateDebugInfo(`反馈 ${feedbackId} 已成功删除`);
        
        // 更新本地数据
        allFeedback = allFeedback.filter(item => item.id !== feedbackId);
        
        // 更新UI
        renderFeedbackList();
        
        // 更新未读数量
        const unreadCount = allFeedback.filter(item => item.status === 'unread').length;
        const feedbackCountEl = document.getElementById('feedbackCount');
        if (feedbackCountEl) {
            feedbackCountEl.textContent = `${unreadCount} 条未读`;
            feedbackCountEl.className = unreadCount > 0 ? 'tag tag-unread' : 'tag tag-read';
        }
    } catch (error) {
        console.error('删除反馈失败:', error);
        updateDebugInfo(`删除反馈失败: ${error.message}`);
        alert("删除反馈失败，请重试");
    }
}
// 添加确认删除的函数
function confirmDelete(feedbackId) {
    if (confirm('确定要删除这条反馈吗？此操作不可撤销。')) {
        deleteFeedback(feedbackId);
    }
}
// 标记为已读
async function markAsRead(feedbackId) {
    try {
        const response = await fetch(`/api/feedback/${feedbackId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || '更新状态失败');
        }
        
        console.log('已标记为已读');
        updateDebugInfo(`反馈 ${feedbackId} 已标记为已读`);
        
        // 更新本地数据
        const feedbackIndex = allFeedback.findIndex(item => item.id === feedbackId);
        if (feedbackIndex !== -1) {
            allFeedback[feedbackIndex].status = 'read';
            
            // 更新UI
            renderFeedbackList();
            
            // 更新未读数量
            const unreadCount = allFeedback.filter(item => item.status === 'unread').length;
            const feedbackCountEl = document.getElementById('feedbackCount');
            if (feedbackCountEl) {
                feedbackCountEl.textContent = `${unreadCount} 条未读`;
                feedbackCountEl.className = unreadCount > 0 ? 'tag tag-unread' : 'tag tag-read';
            }
        }
    } catch (error) {
        console.error('更新状态失败:', error);
        updateDebugInfo(`更新状态失败: ${error.message}`);
        alert("更新状态失败，请重试");
    }
}
