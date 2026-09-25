const Room = require('../models/Room');
const TimetableEntry = require('../models/TimetableEntry');

exports.getRooms = async (req, res, next) => {
  try {
    const { building, roomType, search, availableOnly } = req.query;
    let query = {};

    if (building && building !== 'ALL') query.building = building;
    if (roomType && roomType !== 'ALL') query.roomType = roomType;
    if (availableOnly === 'true') query.available = true;
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } },
      ];
    }

    const rooms = await Room.find(query).sort({ building: 1, roomNumber: 1 });

    // Calculate room utilization percentages (based on total weekly periods, assume 36 periods/wk)
    const allEntries = await TimetableEntry.find({});
    const roomsWithUsage = rooms.map((r) => {
      const roomObj = r.toObject();
      const bookedCount = allEntries.filter((e) => e.room?.toString() === r._id.toString()).length;
      const totalCapacityPeriods = 36; // 6 days * 6 slots
      roomObj.currentUsagePercent = Math.min(100, Math.round((bookedCount / totalCapacityPeriods) * 100));
      roomObj.activeBookingsCount = bookedCount;
      return roomObj;
    });

    res.status(200).json({ success: true, count: roomsWithUsage.length, data: roomsWithUsage });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, message: 'Room created successfully', data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.status(200).json({ success: true, message: 'Room updated successfully', data: room });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const entriesCount = await TimetableEntry.countDocuments({ room: req.params.id });
    if (entriesCount > 0 && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room assigned to ${entriesCount} timetable entries.`,
      });
    }

    if (req.query.force) {
      await TimetableEntry.deleteMany({ room: req.params.id });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};
