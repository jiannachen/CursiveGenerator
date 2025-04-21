// ... 现有代码 ...

// 初始化Express应用
const app = express();
const PORT = config.server.port;

// 中间件
app.use(cors({
    origin: '*', // 允许所有来源，或者指定你的域名
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // 解析JSON请求体

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 添加健康检查路由
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API服务器健康检查',
        environment: process.env.VERCEL ? 'Vercel' : 'Local',
        timestamp: new Date().toISOString()
    });
});

// 添加根路径测试路由
app.get('/api', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API服务器根路径正常工作',
        environment: process.env.VERCEL ? 'Vercel' : 'Local'
    });
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

// API路由 - 暂时注释掉，使用上面的临时路由
// app.use('/api/auth', authRoutes);
// app.use('/api/feedback', feedbackRoutes);

// 静态文件中间件
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.xml')) {
        res.set('Content-Type', 'application/xml');
      }
    }
}));

// 暂时注释掉 Firebase 初始化代码
/*
try {
    // ... Firebase 初始化代码 ...
} catch (error) {
    console.error('Firebase Admin 初始化失败:', error);
}
*/

// 只在非 Vercel 环境下启动监听服务器
if (process.env.VERCEL !== 'true') {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}

module.exports = app;