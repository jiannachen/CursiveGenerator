// 创建一个独立的 API 路由文件，专门用于处理登录请求
const config = require('../../../server/config');
const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  try {
    console.log('收到登录请求:', { 
      headers: req.headers,
      method: req.method,
      path: req.url,
      body: req.body
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
};