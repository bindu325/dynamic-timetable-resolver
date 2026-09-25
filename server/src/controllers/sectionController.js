const Section = require('../models/Section');
const TimetableEntry = require('../models/TimetableEntry');

exports.getSections = async (req, res, next) => {
  try {
    const { department, year, semester, search } = req.query;
    let query = {};

    if (department && department !== 'ALL') query.department = department;
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { academicYear: { $regex: search, $options: 'i' } },
      ];
    }

    const sections = await Section.find(query).sort({ department: 1, name: 1 });
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.createSection = async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ success: true, message: 'Section created successfully', data: section });
  } catch (error) {
    next(error);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.status(200).json({ success: true, message: 'Section updated successfully', data: section });
  } catch (error) {
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const entriesCount = await TimetableEntry.countDocuments({ section: req.params.id });
    if (entriesCount > 0 && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete section referenced in ${entriesCount} timetable entries.`,
      });
    }

    if (req.query.force) {
      await TimetableEntry.deleteMany({ section: req.params.id });
    }

    await Section.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};
