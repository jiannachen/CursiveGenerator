const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const authRoutes = require('./routes/auth').router;
const feedbackRoutes = require('./routes/feedback');
const config = require('./config');

// 初始化Express应用
const app = express();
const PORT = config.server.port;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
// API路由
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);


// 方法1: 使用express.static的options参数设置MIME类型(推荐)
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.xml')) {
        res.set('Content-Type', 'application/xml');
      }
    }
  }));

if (process.env.NODE_ENV === 'development' && process.env.HTTP_PROXY) {
    console.log('开发环境：设置 HTTP 代理:', process.env.HTTP_PROXY);
    process.env.HTTPS_PROXY = process.env.HTTP_PROXY;
} else {
    console.log('生产环境：不使用代理');
}

// 添加详细的Firebase连接状态检查
function checkFirebaseConnection() {
    console.log('正在检查Firebase连接状态...');
    return new Promise((resolve, reject) => {
        try {
            const db = admin.database();
            const connRef = db.ref('.info/connected');
            
            // 设置超时
            const timeout = setTimeout(() => {
                console.error('Firebase连接检查超时');
                resolve(false);
            }, 10000);
            
            connRef.on('value', (snap) => {
                clearTimeout(timeout);
                const connected = snap.val() === true;
                console.log('Firebase连接状态:', connected ? '已连接' : '未连接');
                resolve(connected);
                
                // 如果只需要检查一次，可以取消监听
                connRef.off('value');
            }, (error) => {
                clearTimeout(timeout);
                console.error('Firebase连接检查失败:', error);
                resolve(false);
            });
        } catch (error) {
            console.error('Firebase连接检查出错:', error);
            resolve(false);
        }
    });
}



// 初始化Firebase Admin
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

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 只在非 Vercel 环境下启动监听服务器
if (process.env.VERCEL !== 'true') {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}
module.exports = app;

