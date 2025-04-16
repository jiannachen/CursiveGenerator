const express = require('express');
const admin = require('firebase-admin');
const { verifyToken } = require('./auth');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { check, validationResult } = require('express-validator');

const router = express.Router();

// 多语言错误消息
const errorMessages = {
    zh: {
        rateLimitExceeded: '您提交反馈的频率过高，请稍后再试',
        invalidEmail: '请提供有效的邮箱地址',
        contentLengthError: '反馈内容长度应在5-1000字符之间',
        sensitiveContent: '反馈内容包含不适当的内容，请修改后重试',
        duplicateFeedback: '您最近已提交过类似的反馈，请勿重复提交',
        submitSuccess: '反馈提交成功，感谢您的反馈！',
        submitFailed: '提交反馈失败: '
    },
    en: {
        rateLimitExceeded: 'You are submitting feedback too frequently. Please try again later.',
        invalidEmail: 'Please provide a valid email address',
        contentLengthError: 'Feedback content should be between 5-1000 characters',
        sensitiveContent: 'Feedback contains inappropriate content. Please revise and try again.',
        duplicateFeedback: 'You have submitted similar feedback recently. Please do not submit duplicate feedback.',
        submitSuccess: 'Feedback submitted successfully. Thank you for your feedback!',
        submitFailed: 'Failed to submit feedback: '
    }
};

// 获取错误消息
function getMessage(language, key) {
    // 默认使用中文，如果找不到对应语言或消息键
    const lang = errorMessages[language] ? language : 'zh';
    return errorMessages[lang][key] || errorMessages['zh'][key];
}

// IP 速率限制器 - 每个 IP 每天最多提交 5 条反馈
const rateLimiter = new RateLimiterMemory({
    points: 5, // 每个 IP 每天最多 5 次请求
    duration: 60 * 60 * 24, // 1天（以秒为单位）
});

// 速率限制中间件
const feedbackLimiter = async (req, res, next) => {
    try {
        const language = req.body.language || 'zh';
        const ipAddr = req.ip || req.connection.remoteAddress;
        await rateLimiter.consume(ipAddr);
        next();
    } catch (error) {
        const language = req.body.language || 'zh';
        res.status(429).json({
            success: false,
            message: getMessage(language, 'rateLimitExceeded')
        });
    }
};

// 敏感词过滤函数
function containsSensitiveContent(text) {
    const sensitiveWords = ['spam', 'advertisement', 'ads', '广告', '推广', '色情', '赌博'];
     // 检查完整词匹配
     if (sensitiveWords.some(word => processedText.includes(word))) {
        return true;
    }
     // 检查模糊匹配（处理故意插入特殊字符的情况）
     const fuzzyText = processedText.replace(/[^\u4e00-\u9fa5a-z]/g, ''); // 只保留中文和英文字母
     return sensitiveWords.some(word => {
         const fuzzyWord = word.replace(/[^\u4e00-\u9fa5a-z]/g, '');
         return fuzzyText.includes(fuzzyWord) && fuzzyWord.length > 1; // 避免单字母误判
     });
}


// 检查是否是重复提交
async function isDuplicateFeedback(email, message) {
    try {
        // 查询最近1小时内的反馈
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const snapshot = await admin.database().ref('feedback')
            .orderByChild('timestamp')
            .startAt(oneHourAgo)
            .once('value');
        
        const feedbacks = snapshot.val() || {};
        
        // 检查是否有相同邮箱和相似内容的反馈
        return Object.values(feedbacks).some(feedback => {
            return feedback.email === email && 
                   (feedback.message === message || 
                    // 检查内容相似度 (简单实现)
                    (feedback.message.length > 10 && message.includes(feedback.message.substring(0, 10))));
        });
    } catch (error) {
        console.error('检查重复反馈失败:', error);
        return false; // 出错时不阻止提交
    }
}

// 提交反馈 - 添加验证和限制
router.post('/', feedbackLimiter, async (req, res) => {
    const { email, message, language = 'zh' } = req.body;
    
    // 验证请求数据
    const validationRules = [
        check('email').isEmail().withMessage(() => getMessage(language, 'invalidEmail')),
        check('message').isLength({ min: 5, max: 1000 }).withMessage(() => getMessage(language, 'contentLengthError')),
    ];
    
    // 运行验证
    for (const rule of validationRules) {
        await rule.run(req);
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
        // 检查内容是否包含敏感词
        if (containsSensitiveContent(message)) {
            return res.status(400).json({ 
                success: false, 
                message: getMessage(language, 'sensitiveContent')
            });
        }
        
        // 检查是否是重复提交
        const isDuplicate = await isDuplicateFeedback(email, message);
        if (isDuplicate) {
            return res.status(400).json({ 
                success: false, 
                message: getMessage(language, 'duplicateFeedback')
            });
        }
        
        // 保存反馈
        const newFeedback = {
            email,
            message,
            timestamp: Date.now(),
            status: 'unread',
            language,
            ip: req.ip || req.connection.remoteAddress
        };
        
        const newFeedbackRef = await admin.database().ref('feedback').push(newFeedback);
        
        res.json({ 
            success: true, 
            message: getMessage(language, 'submitSuccess'),
            id: newFeedbackRef.key
        });
    } catch (error) {
        console.error('提交反馈失败:', error);
        res.status(500).json({ 
            success: false, 
            message: getMessage(language, 'submitFailed') + error.message 
        });
    }
});

// 获取所有反馈 - 需要管理员权限
router.get('/', verifyToken, async (req, res) => {
    try {
        const snapshot = await admin.database().ref('feedback').once('value');
        const data = snapshot.val() || {};
        
        // 将对象转换为数组
        const feedbackList = Object.entries(data).map(([id, feedback]) => ({
            id,
            ...feedback
        }));
        
        res.json({ success: true, data: feedbackList });
    } catch (error) {
        console.error('获取反馈数据失败:', error.message);
        
        res.status(500).json({ 
            success: false, 
            message: '获取反馈数据失败: ' + error.message
        });
    }
});

// 标记反馈为已读 - 需要管理员权限
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await admin.database().ref(`feedback/${id}`).update({ status: 'read' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await admin.database().ref(`feedback/${id}`).remove();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 健康检查端点
router.get('/health', async (req, res) => {
    try {
        await admin.database().ref('.info/connected').once('value');
        res.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            firebase: { connected: true }
        });
    } catch (error) {
        res.json({ 
            status: 'error', 
            timestamp: new Date().toISOString(),
            firebase: { connected: false }
        });
    }
});

module.exports = router;