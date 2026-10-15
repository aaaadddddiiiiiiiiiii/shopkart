const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

// Cookie options shared by login/logout so they always match
// (mismatched options are the #1 reason "clear cookie" silently fails)
const cookieOptions = {
  httpOnly: true,
};

// -------------------- Register --------------------
async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password, phone) are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'A customer with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message
    });
  }
}

// -------------------- Login --------------------
async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // password has `select: false` on the schema, so explicitly ask for it here
    const customer = await Customer.findOne({ email: email.toLowerCase() }).select('+password');

    // Generic error message on purpose — never reveal whether it was the
    // email or the password that was wrong.
    const invalidCredentialsResponse = () =>
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });

    if (!customer) {
      return invalidCredentialsResponse();
    }

    const isPasswordCorrect = await bcrypt.compare(password, customer.password);

    if (!isPasswordCorrect) {
      return invalidCredentialsResponse();
    }

    const token = generateToken(customer._id);

    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }); 

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
}

// -------------------- Profile (protected) --------------------
async function getProfile(req, res) {
  // req.user is attached by auth.middleware.js and is already a full
  // Mongoose doc without the password field (schema default select: false)
  return res.status(200).json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone
  });
}

// -------------------- Logout --------------------
async function logoutCustomer(req, res) {
  res.clearCookie('token', cookieOptions);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

// -------------------- Bonus: Change Password --------------------
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'oldPassword and newPassword are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const customer = await Customer.findById(req.user._id).select('+password');

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, customer.password);

    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    customer.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: err.message
    });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword
};
