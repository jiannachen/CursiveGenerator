const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件设置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 设置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Firebase 连接检查函数
async function checkFirebaseConnection() {
    try {
        const db = admin.database();
        await db.ref('.info/connected').once('value');
        return true;
    } catch (error) {
        console.error('Firebase 连接测试失败:', error);
        return false;
    }
}

// 健康检查路由
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 添加一个临时的登录路由，绕过Firebase
app.post('/api/auth/login', (req, res) => {
    try {
        console.log('收到登录请求:', { 
            headers: req.headers,
            method: req.method,
            path: req.path,
            body: req.body
        });
        
        const { password } = req.body;
        
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('请求体为空或解析失败');
            return res.status(400).json({ success: false, message: '请求体为空或格式错误' });
        }
        
        if (!password) {
            console.error('缺少密码参数');
            return res.status(400).json({ success: false, message: '缺少密码参数' });
        }
        
        // 简单密码验证，替换为你的实际密码
        if (password === config.admin.password) {
            // 生成简单令牌
            const token = 'temp_token_' + Date.now();
            console.log('登录成功，已生成临时令牌');
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

// API路由 - 只注册 feedback 路由，因为 auth.js 已被删除
// const authRoutes = require('./routes/auth').router; // 已删除
const feedbackRoutes = require('./routes/feedback');
// app.use('/api/auth', authRoutes); // 已删除
app.use('/api/feedback', feedbackRoutes);

// 静态文件中间件
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.xml')) {
        res.set('Content-Type', 'application/xml');
      }
    }
}));

// 恢复 Firebase 初始化代码
try {
    // 显示更多配置信息（注意不要泄露敏感信息）
    console.log('Firebase配置:', {
        projectId: config.firebase.projectId,
        databaseURL: config.firebase.databaseURL,
        hasServiceAccount: !!process.env.GOOGLE_APPLICATION_CREDENTIALS || !!require('./firebase-service-account.json')
    });
    
    // 优先使用环境变量中的服务账号路径
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
            databaseURL: config.firebase.databaseURL
        });
        console.log('使用 GOOGLE_APPLICATION_CREDENTIALS 环境变量初始化 Firebase');
    } else {
        // 使用本地服务账号文件
        const serviceAccount = require('./firebase-service-account.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: config.firebase.databaseURL
        });
        console.log('使用本地服务账号文件初始化 Firebase');
    }
    
    console.log('Firebase Admin 初始化成功');
    
    // 检查连接状态
    checkFirebaseConnection().then(connected => {
        if (connected) {
            console.log('Firebase 连接测试成功');
        } else {
            console.warn('Firebase 连接测试失败，但服务器将继续运行');
        }
    });
} catch (error) {
    console.error('Firebase Admin 初始化失败:', error);
}

// 只在非 Vercel 环境下启动监听服务器
if (process.env.VERCEL !== 'true') {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}

module.exports = app;