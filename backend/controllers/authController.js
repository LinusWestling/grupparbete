const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'username, email, and password required' });
    }
    const existing = await authService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'User with this email already exists' });
    }
    const user = await authService.createUser(username, email, password); // Note: bcrypt hashing to be added by auth feature owner
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    res.json({
      status: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getMe(req, res) {
  try {
    // Demo placeholder returning user 1
    const user = await authService.findUserById(1);
    res.json({ status: 'success', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
};
