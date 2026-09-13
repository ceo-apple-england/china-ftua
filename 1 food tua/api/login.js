import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请填写所有必填项 (Vui lòng điền đầy đủ)' });
  }

  try {
    // Truy vấn kiểm tra username (hoặc email) và mật khẩu
    const result = await sql`
      SELECT id, username, email, created_at FROM users 
      WHERE (username = ${username} OR email = ${username}) AND password = ${password};
    `;

    if (result.rowCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名或密码错误 (Tài khoản hoặc mật khẩu không đúng)' 
      });
    }

    const user = result.rows[0];
    return res.status(200).json({ 
      success: true, 
      message: '登录成功 (Đăng nhập thành công)',
      user: { username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('Postgres Error:', error);
    return res.status(500).json({ success: false, message: '数据库错误 (Lỗi cơ sở dữ liệu)' });
  }
}