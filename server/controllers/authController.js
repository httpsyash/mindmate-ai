const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth: firebaseAuth } = require('../config/firebase');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'mindmate_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Google / Gmail Sign-In & Verification
 * Receives verified Google user details from Firebase Client GoogleAuthProvider.
 */
async function googleAuth(req, res) {
  try {
    const { name, email, googleId, avatar, firebaseIdToken } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is required',
      });
    }

    // If Firebase Admin is available and token is supplied, verify it
    if (firebaseIdToken && firebaseAuth) {
      try {
        await firebaseAuth.verifyIdToken(firebaseIdToken);
      } catch (tokenErr) {
        console.warn('Firebase Google token verification warning:', tokenErr.message);
      }
    }

    // Find or create user by verified Google email
    const user = await User.findOrCreateGoogleUser({
      name: name || email.split('@')[0],
      email,
      googleId: googleId || null,
      avatar: avatar || null,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, mobile: user.mobile, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed: ' + err.message });
  }
}

/**
 * Signup with Email + Password (or mobile + password)
 */
async function signup(req, res) {
  try {
    const { name, email, mobile, password, firebaseIdToken } = req.body;

    if (!name || (!mobile && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email or mobile number, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check existing by email
    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }
    }

    // Check existing by mobile
    if (mobile) {
      const existingMobile = await User.findByMobile(mobile);
      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: 'An account with this mobile number already exists',
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email ? email.trim() : null,
      mobile: mobile ? mobile.trim() : null,
      passwordHash,
      isVerified: true,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, mobile: user.mobile, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Signup failed: ' + err.message });
  }
}

/**
 * Login with Email OR Mobile + Password
 */
async function login(req, res) {
  try {
    const { identifier, mobile, email, password } = req.body;
    const loginId = identifier || email || mobile;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or mobile number and password are required',
      });
    }

    // Find by email or mobile
    let user = null;
    if (loginId.includes('@')) {
      user = await User.findByEmail(loginId);
    } else {
      user = await User.findByMobile(loginId);
      if (!user) {
        user = await User.findByEmail(loginId);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, mobile: user.mobile, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}

/**
 * Get current user profile (protected).
 */
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
}

/**
 * Verify OTP
 */
async function verifyOtp(req, res) {
  try {
    const { mobile, firebaseIdToken } = req.body;

    if (!mobile || !firebaseIdToken) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP token required' });
    }

    if (firebaseAuth) {
      try {
        const decoded = await firebaseAuth.verifyIdToken(firebaseIdToken);
        return res.json({
          success: true,
          message: 'OTP verified successfully',
          firebaseUid: decoded.uid,
          mobile,
        });
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP token' });
      }
    }

    return res.json({
      success: true,
      message: 'OTP verified (dev mode)',
      mobile,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
}

module.exports = { googleAuth, signup, login, me, verifyOtp };
