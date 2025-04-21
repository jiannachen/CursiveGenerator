const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

// 管理员登录
router.post('/login', (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: '缺少密码参数' });
        }
        // 记录请求信息，帮助调试
        console.log('登录请求:', { 
            body: req.body,
            hasPassword: !!password
        });
        
        // 验证密码
        if (password === config.admin.password) {
            // 生成JWT令牌
            const token = jwt.sign(
                { role: 'admin' },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );
            
            console.log('登录成功，已生成令牌');
            res.json({ success: true, token });
        } else {
            console.log('密码错误');
            res.status(401).json({ success: false, message: '密码错误' });
        }
    } catch (error) {
        console.error('登录处理出错:', error);
        res.status(500).json({ 
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

module.exports = { router, verifyToken };