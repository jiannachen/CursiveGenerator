// 敏感配置信息
require('dotenv').config();

module.exports = {
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY ,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN ,
        databaseURL: process.env.FIREBASE_DATABASE_URL ,
        projectId: process.env.FIREBASE_PROJECT_ID ,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID 
    },
    admin: {
        password: process.env.ADMIN_PASSWORD  // 实际应用中应该使用哈希存储
    },
    jwt: {
        secret: process.env.JWT_SECRET, // 用于生成JWT令牌
        expiresIn: process.env.JWT_EXPIRES_IN || "24h" // 令牌有效期
    },
    server: {
        port: process.env.PORT || 3000
    }
};