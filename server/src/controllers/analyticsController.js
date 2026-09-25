const TimetableEntry = require('../models/TimetableEntry');
const Faculty = require('../models/Faculty');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Room = require('../models/Room');
const Conflict = require('../models/Conflict');
const ChangeHistory = require('../models/ChangeHistory');

// @desc    Get system dashboard stats
// @route   GET /api/dashboard/stats
// @access  Authenticated
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalFaculty,
      totalSections,
      totalSubjects,
      totalRooms,
      totalEntries,
      activeConflicts,
      rooms,
      faculties,
      allEntries,
    ] = await Promise.all([
      Faculty.countDocuments(),
      Section.countDocuments(),
      Subject.countDocuments(),
      Room.countDocuments(),
      TimetableEntry.countDocuments(),
      Conflict.countDocuments({ status: 'ACTIVE' }),
      Room.find({}),
      Faculty.find({}),
      TimetableEntry.find({}).populate('faculty section room subject'),
    ]);

    // Calculate Average Room Utilization
    const totalPossibleSlots = (rooms.length || 1) * 36; // 6 days * 6 slots
    const roomUtilization = Math.min(100, Math.round((totalEntries / totalPossibleSlots) * 100));

    // Faculty Average Workload (hours/wk)
    const avgFacultyWorkload = totalFaculty > 0 ? (totalEntries / totalFaculty).toFixed(1) : 0;

    // Conflicts by type breakdown
    const conflictTypeAgg = await Conflict.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Timetable distribution by Day
    const dayDistribution = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
      const count = allEntries.filter((e) => e.day === day).length;
      return { day: day.slice(0, 3), fullDay: day, classes: count };
    });

    // Classes by Department
    const deptMap = {};
    allEntries.forEach((e) => {
      const dept = e.section?.department || e.subject?.department || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const classesByDepartment = Object.keys(deptMap).map((key) => ({
      department: key,
      classes: deptMap[key],
    }));

    res.status(200).json({
      success: true,
      data: {
        totalFaculty,
        totalSections,
        totalSubjects,
        totalRooms,
        totalEntries,
        activeConflicts,
        roomUtilization,
        avgFacultyWorkload,
        timetableStatus: activeConflicts === 0 ? 'OPTIMAL' : 'HAS_CONFLICTS',
        conflictTypeAgg,
        dayDistribution,
        classesByDepartment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for rooms, faculty, sections, and conflict history
// @route   GET /api/analytics
// @access  Authenticated
exports.getAnalytics = async (req, res, next) => {
  try {
    const [rooms, faculties, sections, entries, conflicts, history] = await Promise.all([
      Room.find({}),
      Faculty.find({}),
      Section.find({}),
      TimetableEntry.find({}).populate('faculty section room subject'),
      Conflict.find({}),
      ChangeHistory.find({}),
    ]);

    // 1. Room utilization breakdown
    const roomUtilizationData = rooms.map((r) => {
      const booked = entries.filter((e) => e.room?._id?.toString() === r._id.toString()).length;
      return {
        roomNumber: r.roomNumber,
        building: r.building,
        capacity: r.capacity,
        roomType: r.roomType,
        bookedPeriods: booked,
        utilizationRate: Math.min(100, Math.round((booked / 36) * 100)),
      };
    }).sort((a, b) => b.utilizationRate - a.utilizationRate);

    // 2. Faculty workload breakdown
    const facultyWorkloadData = faculties.map((f) => {
      const assigned = entries.filter((e) => e.faculty?._id?.toString() === f._id.toString()).length;
      return {
        name: f.name,
        department: f.department,
        employeeId: f.employeeId,
        assignedHours: assigned,
        maxHours: f.maxWeeklyHours || 20,
        loadStatus: assigned > (f.maxWeeklyHours || 20) ? 'OVERLOAD' : 'NORMAL',
      };
    }).sort((a, b) => b.assignedHours - a.assignedHours);

    // 3. Section workload breakdown
    const sectionWorkloadData = sections.map((s) => {
      const classes = entries.filter((e) => e.section?._id?.toString() === s._id.toString()).length;
      return {
        name: s.name,
        department: s.department,
        studentCount: s.studentCount,
        classesCount: classes,
      };
    });

    // 4. Conflicts distribution & resolution rate
    const totalDetectedCount = conflicts.length;
    const resolvedCount = conflicts.filter((c) => c.status === 'RESOLVED').length;
    const activeCount = conflicts.filter((c) => c.status === 'ACTIVE').length;

    const conflictTypeCounts = {
      FACULTY_CONFLICT: 0,
      ROOM_CONFLICT: 0,
      SECTION_CONFLICT: 0,
      CAPACITY_CONFLICT: 0,
      FACULTY_AVAILABILITY_CONFLICT: 0,
      ROOM_AVAILABILITY_CONFLICT: 0,
      INVALID_TIME_SLOT: 0,
    };

    conflicts.forEach((c) => {
      if (conflictTypeCounts[c.type] !== undefined) {
        conflictTypeCounts[c.type] += 1;
      }
    });

    const conflictTypeChartData = Object.entries(conflictTypeCounts).map(([type, count]) => ({
      type: type.replace(/_/g, ' '),
      count,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPeriodsScheduled: entries.length,
          totalRooms: rooms.length,
          totalFaculty: faculties.length,
          totalSections: sections.length,
          activeConflicts: activeCount,
          resolvedConflicts: resolvedCount,
          resolutionRate: totalDetectedCount > 0 ? Math.round((resolvedCount / totalDetectedCount) * 100) : 100,
        },
        roomUtilizationData,
        facultyWorkloadData,
        sectionWorkloadData,
        conflictTypeChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};
