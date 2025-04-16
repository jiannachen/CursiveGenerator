const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

// 管理员登录
router.post('/login', (req, res) => {
    const { password } = req.body;
    
    // 验证密码
    if (password === config.admin.password) {
        // 生成JWT令牌
        const token = jwt.sign(
            { role: 'admin' },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: '密码错误' });
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