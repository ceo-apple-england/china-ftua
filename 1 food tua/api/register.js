import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: '请填写所有必填项 (Vui lòng điền đầy đủ)' });
  }

  try {
    // 1. Tự động tạo bảng users nếu chưa có
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await sql`
      SELECT * FROM users WHERE username = ${username} OR email = ${email};
    `;

    if (existingUser.rowCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名或邮箱已被注册 (Tài khoản hoặc Email đã tồn tại)' 
      });
    }

    // 3. Thêm tài khoản mới vào Vercel Postgres DB
    await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${password});
    `;

    return res.status(200).json({ success: true, message: '注册成功 (Đăng ký thành công)' });

  } catch (error) {
    console.error('Postgres Error:', error);
    return res.status(500).json({ success: false, message: '数据库错误 (Lỗi cơ sở dữ liệu)' });
  }
}