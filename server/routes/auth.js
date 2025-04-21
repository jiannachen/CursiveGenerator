const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

// 管理员登录
router.post('/login', (req, res) => {
    try {
        // 增强日志记录，帮助调试
        console.log('收到登录请求:', { 
            headers: req.headers,
            method: req.method,
            path: req.path,
            body: req.body,
            contentType: req.headers['content-type']
        });
        
        const { password } = req.body;
        
        // 检查请求体是否为空
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('请求体为空或解析失败');
            return res.status(400).json({ success: false, message: '请求体为空或格式错误' });
        }
        
        // 检查密码参数
        if (!password) {
            console.error('缺少密码参数');
            return res.status(400).json({ success: false, message: '缺少密码参数' });
        }
        
        // 验证密码
        if (password === config.admin.password) {
            // 生成JWT令牌
            const token = jwt.sign(
                { role: 'admin' },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );
            
            console.log('登录成功，已生成令牌');
            return res.json({ success: true, token });
        } else {
            console.log('密码错误');
            return res.status(401).json({ success: false, message: '密码错误' });
        }
    } catch (error) {
        console.error('登录处理出错:', error);
        return res.status(500).json({ 
            success: false, 
            message: '服务器内部错误',
            error: error.message
        });
    }
});

// 验证令牌中间件
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }
    
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: '无效的令牌' });
    }
};

// 添加一个测试路由，用于验证API是否正常工作
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Auth API 正常工作' });
});

module.exports = { router, verifyToken };