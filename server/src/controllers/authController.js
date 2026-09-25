const User = require('../models/User');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_dynamic_timetable_conflict_resolver_2026_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    // Role safety check: Don't allow arbitrary ADMIN creation without key check unless first user
    const totalUsers = await User.countDocuments();
    let assignedRole = role || 'VIEWER';

    if (assignedRole === 'ADMIN' && totalUsers > 0 && req.body.adminSecret !== 'ADMIN_2026') {
      // If no admin secret provided when users exist, default to VIEWER
      assignedRole = 'VIEWER';
    } else if (totalUsers === 0) {
      // First registered user gets ADMIN automatically
      assignedRole = 'ADMIN';
    }

    // Link faculty doc if role is FACULTY
    let facultyId = null;
    if (assignedRole === 'FACULTY') {
      const faculty = await Faculty.findOne({ email: email.toLowerCase() });
      if (faculty) facultyId = faculty._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      facultyId,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        facultyId: user.facultyId,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('facultyId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        facultyId: user.facultyId,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('facultyId');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
