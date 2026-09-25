const Subject = require('../models/Subject');
const TimetableEntry = require('../models/TimetableEntry');

exports.getSubjects = async (req, res, next) => {
  try {
    const { department, type, search } = req.query;
    let query = {};

    if (department && department !== 'ALL') query.department = department;
    if (type && type !== 'ALL') query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query).sort({ code: 1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject updated successfully', data: subject });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const entriesCount = await TimetableEntry.countDocuments({ subject: req.params.id });
    if (entriesCount > 0 && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject scheduled in ${entriesCount} timetable entries.`,
      });
    }

    if (req.query.force) {
      await TimetableEntry.deleteMany({ subject: req.params.id });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};
