import express from 'express';
import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';

const router = express.Router();

// Mock luxury seating experiences for fallback
let mockTables = [
  // Window Lounge
  { _id: "t1", number: "01", area: "Window Lounge", name: "Skyline Suite", capacity: 2, type: "Lounge", status: "Available", location: { x: 5, y: 10 } },
  { _id: "t2", number: "02", area: "Window Lounge", name: "Horizon Nook", capacity: 2, type: "Lounge", status: "Available", location: { x: 15, y: 10 } },
  { _id: "t3", number: "03", area: "Window Lounge", name: "Panorama Table", capacity: 4, type: "Lounge", status: "Reserved", location: { x: 25, y: 10 } },

  // VIP Gold Lounge
  { _id: "t4", number: "04", area: "VIP Gold Lounge", name: "Gilded Booth", capacity: 4, type: "VIP", status: "Available", location: { x: 40, y: 10 } },
  { _id: "t5", number: "05", area: "VIP Gold Lounge", name: "Royal Circle", capacity: 6, type: "VIP", status: "Available", location: { x: 50, y: 10 } },
  { _id: "t6", number: "06", area: "VIP Gold Lounge", name: "Imperial Seat", capacity: 2, type: "VIP", status: "Occupied", location: { x: 60, y: 10 } },

  // Family Lounge
  { _id: "t7", number: "07", area: "Family Lounge", name: "Heritage Round", capacity: 6, type: "Family", status: "Available", location: { x: 5, y: 30 } },
  { _id: "t8", number: "08", area: "Family Lounge", name: "Legacy Booth", capacity: 8, type: "Family", status: "Available", location: { x: 15, y: 30 } },

  // Romantic Dining
  { _id: "t9", number: "09", area: "Romantic Dining", name: "Candlelight Corner", capacity: 2, type: "Standard", status: "Available", location: { x: 30, y: 30 } },
  { _id: "t10", number: "10", area: "Romantic Dining", name: "Velvet Whisper", capacity: 2, type: "Standard", status: "Reserved", location: { x: 40, y: 30 } },

  // Chef Experience
  { _id: "t11", number: "11", area: "Chef Experience", name: "Culinary Front", capacity: 1, type: "Counter", status: "Available", location: { x: 55, y: 30 } },
  { _id: "t12", number: "12", area: "Chef Experience", name: "Gourmet View", capacity: 1, type: "Counter", status: "Available", location: { x: 65, y: 30 } },

  // Coffee Workspace
  { _id: "t13", number: "13", area: "Coffee Workspace", name: "Focus Desk A", capacity: 1, type: "Quiet", status: "Available", location: { x: 5, y: 50 } },
  { _id: "t14", number: "14", area: "Coffee Workspace", name: "Focus Desk B", capacity: 1, type: "Quiet", status: "Available", location: { x: 15, y: 50 } },

  // Luxury Sofa
  { _id: "t15", number: "15", area: "Luxury Sofa Seating", name: "Cloud Lounge", capacity: 4, type: "Lounge", status: "Available", location: { x: 30, y: 50 } }
];

let mockReservations = [];

// Get all tables with real-time status
router.get('/tables', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(mockTables);
    }
    const tables = await Table.find({}).populate('currentReservation');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check Availability
router.post('/check-availability', async (req, res) => {
  const { tableIds, date, timeSlot, duration = 90 } = req.body;

  try {
    const startTime = new Date(`${date}T${timeSlot}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    if (mongoose.connection.readyState !== 1) {
      const conflict = mockReservations.find(r =>
        tableIds.includes(r.tables?.[0]?._id || r.table?._id) &&
        ((startTime < new Date(r.endTime)) && (endTime > new Date(r.startTime)))
      );
      return res.json({ available: !conflict });
    }

    const conflicts = await Reservation.find({
      tables: { $in: tableIds },
      status: { $in: ['Pending', 'Approved', 'Occupied'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    res.json({ available: conflicts.length === 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Booked Tables for a given time
router.get('/booked-tables', async (req, res) => {
  try {
    const { date, timeSlot, duration = 90 } = req.query;
    if (!date || !timeSlot) return res.json([]);
    
    const startTime = new Date(`${date}T${timeSlot}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    if (mongoose.connection.readyState !== 1) {
      const bookedIds = mockReservations.filter(r => 
        (startTime < new Date(r.endTime)) && (endTime > new Date(r.startTime))
      ).map(r => r.table._id);
      return res.json(bookedIds);
    }

    const conflicts = await Reservation.find({
      status: { $in: ['Pending', 'Approved', 'Occupied'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    const bookedTableIds = conflicts.flatMap(r => r.tables.map(t => t.toString()));
    res.json(bookedTableIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a reservation with collision detection
router.post('/', async (req, res) => {
  try {
    const {
      customerName, email, phone, date, timeSlot,
      partySize, seatingPreference, ambiencePreference,
      diningPurpose, celebrationNotes, specialRequests,
      user, tableIds, duration = 90
    } = req.body;

    const startTime = new Date(`${date}T${timeSlot}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const now = new Date();
    if (startTime < now) {
      return res.status(400).json({ message: 'This reservation time has already passed.' });
    }

    // Collision Check
    if (mongoose.connection.readyState !== 1) {
      const conflict = mockReservations.find(r =>
        tableIds.includes(r.tables?.[0]?._id || r.table?._id) &&
        ((startTime < new Date(r.endTime)) && (endTime > new Date(r.startTime)))
      );

      if (conflict) {
        return res.status(400).json({ message: 'Selected tables are already reserved during this time.' });
      }

      const mockRes = {
        _id: "res_" + Math.random().toString(36).substr(2, 9),
        customerName, email, phone, date, timeSlot,
        startTime, endTime, duration, partySize,
        seatingPreference, ambiencePreference, diningPurpose,
        celebrationNotes, specialRequests, status: 'Pending',
        table: mockTables.find(t => t._id === tableId) || { number: 'TBD' },
        createdAt: new Date()
      };
      mockReservations.push(mockRes);
      if (req.app.get('io')) req.app.get('io').emit('reservation_update', mockRes);
      return res.status(201).json(mockRes);
    }

    const conflicts = await Reservation.find({
      tables: { $in: tableIds },
      status: { $in: ['Pending', 'Approved', 'Occupied'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflicts.length > 0) {
      return res.status(400).json({ message: 'Selected table is already reserved during this time.' });
    }

    // Capacity Check
    const tableInfos = await Table.find({ _id: { $in: tableIds } });
    if (tableInfos.length !== tableIds.length) return res.status(404).json({ message: 'One or more tables not found.' });
    

    const reservation = new Reservation({
      user: user || null,
      customerName, email, phone, tables: tableIds,
      date, timeSlot, startTime, endTime, duration,
      partySize, seatingPreference, ambiencePreference,
      diningPurpose, celebrationNotes, specialRequests,
      status: 'Pending'
    });

    const createdReservation = await reservation.save();
    
    // Auto-update tables status to 'Reserved'
    await Promise.all(tableIds.map(async (tableId) => {
      await Table.findByIdAndUpdate(tableId, {
        status: 'Reserved',
        currentReservation: createdReservation._id
      });
    }));

    if (req.app.get('io')) {
      req.app.get('io').emit('reservation_update', createdReservation);
      req.app.get('io').emit('table_update', {});
    }
    res.status(201).json(createdReservation);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This table is already reserved for that date and time. Please choose a different slot.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete a reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('tables');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

    // Free up associated tables
    if (reservation.tables?.length) {
      await Promise.all(reservation.tables.map(table =>
        Table.findByIdAndUpdate(table._id || table, { status: 'Available', currentReservation: null })
      ));
    }

    await Reservation.findByIdAndDelete(req.params.id);

    if (req.app.get('io')) {
      req.app.get('io').emit('reservation_update', { deleted: req.params.id });
      req.app.get('io').emit('table_update', {});
    }

    res.json({ message: 'Reservation permanently deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all reservations
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(mockReservations);
    }
    const reservations = await Reservation.find({}).populate('tables').sort({ startTime: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update Status / Manual Override
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const resIdx = mockReservations.findIndex(r => r._id === req.params.id);
      if (resIdx !== -1) {
        mockReservations[resIdx].status = status;
        if (req.app.get('io')) req.app.get('io').emit('reservation_update', mockReservations[resIdx]);
        return res.json(mockReservations[resIdx]);
      }
    }

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('tables');

    // Update table status if reservation becomes Occupied/Seated, Approved/Confirmed, Completed or Cancelled
    if (reservation.tables && reservation.tables.length > 0) {
      let tableStatus = 'Available';
      if (status === 'Occupied' || status === 'Seated') tableStatus = 'Occupied';
      if (status === 'Approved' || status === 'Confirmed') tableStatus = 'Reserved';
      if (status === 'Cleaning') tableStatus = 'Cleaning';
      if (status === 'Cancelled' || status === 'Rejected') tableStatus = 'Available';
      if (status === 'Completed') tableStatus = 'Available';

      await Promise.all(reservation.tables.map(async (table) => {
        await Table.findByIdAndUpdate(table._id, {
          status: tableStatus,
          currentReservation: (status === 'Completed' || status === 'Cancelled' || status === 'Rejected') ? null : reservation._id
        });
      }));
    }

    if (req.app.get('io')) req.app.get('io').emit('reservation_update', reservation);
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Table Override
router.patch('/tables/:id/override', async (req, res) => {
  try {
    const { status } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const tIdx = mockTables.findIndex(t => t._id === req.params.id);
      if (tIdx !== -1) {
        mockTables[tIdx].status = status;
        if (req.app.get('io')) req.app.get('io').emit('table_update', mockTables[tIdx]);
        return res.json(mockTables[tIdx]);
      }
    }

    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (req.app.get('io')) req.app.get('io').emit('table_update', table);
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
