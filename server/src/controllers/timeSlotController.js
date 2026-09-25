const TimeSlot = require('../models/TimeSlot');
const { timeToMinutes } = require('../services/conflictEngine');

exports.getTimeSlots = async (req, res, next) => {
  try {
    const { day } = req.query;
    let query = {};
    if (day && day !== 'ALL') query.day = day;

    const timeSlots = await TimeSlot.find(query).sort({ day: 1, startTime: 1 });
    res.status(200).json({ success: true, count: timeSlots.length, data: timeSlots });
  } catch (error) {
    next(error);
  }
};

exports.createTimeSlot = async (req, res, next) => {
  try {
    const { day, startTime, endTime, periodNumber, isBreak, label } = req.body;

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be strictly before end time.',
      });
    }

    // Check for overlapping slots on the same day
    const existingSlots = await TimeSlot.find({ day });
    const hasOverlap = existingSlots.some((slot) => {
      const s1 = timeToMinutes(startTime);
      const e1 = timeToMinutes(endTime);
      const s2 = timeToMinutes(slot.startTime);
      const e2 = timeToMinutes(slot.endTime);
      return s1 < e2 && s2 < e1;
    });

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: `This time slot overlaps with an existing slot on ${day}.`,
      });
    }

    const timeSlot = await TimeSlot.create({
      day,
      startTime,
      endTime,
      periodNumber,
      isBreak,
      label,
    });

    res.status(201).json({ success: true, message: 'Time slot created successfully', data: timeSlot });
  } catch (error) {
    next(error);
  }
};

exports.updateTimeSlot = async (req, res, next) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!timeSlot) return res.status(404).json({ success: false, message: 'Time slot not found' });
    res.status(200).json({ success: true, message: 'Time slot updated successfully', data: timeSlot });
  } catch (error) {
    next(error);
  }
};

exports.deleteTimeSlot = async (req, res, next) => {
  try {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Time slot deleted successfully' });
  } catch (error) {
    next(error);
  }
};
