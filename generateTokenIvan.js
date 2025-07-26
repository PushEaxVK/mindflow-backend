import jwt from 'jsonwebtoken';

const payload = {
  userId: '6855ad3dd6e6e70ff4a2053f',
  email: 'ivan@example.com'
};

const token = jwt.sign(payload, 'abc123456789supersecretACCESS', { expiresIn: '1d' });

console.log(token);

