const Faculty = require('../models/Faculty');
const TimetableEntry = require('../models/TimetableEntry');

// @desc    Get all faculties with optional filter and search
// @route   GET /api/faculty
// @access  Private
exports.getFaculties = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    let query = {};

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const faculties = await Faculty.find(query).populate('subjects').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: faculties.length,
      data: faculties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private
exports.getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('subjects');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty
// @route   POST /api/faculty
// @access  Admin only
exports.createFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Admin & Faculty (self)
exports.updateFaculty = async (req, res, next) => {
  try {
    let faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // If role is FACULTY, can only update own availability
    if (req.user.role === 'FACULTY' && req.user.facultyId?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Faculty can only update their own profile' });
    }

    faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subjects');

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Admin only
exports.deleteFaculty = async (req, res, next) => {
  try {
    const entriesCount = await TimetableEntry.countDocuments({ faculty: req.params.id });
    if (entriesCount > 0 && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete faculty assigned to ${entriesCount} active timetable entries. Please reassign classes first or use force delete.`,
      });
    }

    if (req.query.force) {
      await TimetableEntry.deleteMany({ faculty: req.params.id });
    }

    await Faculty.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
  } catch (error) {
    next(error);
  }
};
