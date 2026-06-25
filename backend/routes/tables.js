import express from 'express';
import Table from '../models/Table.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find({}).sort({ number: 1 }).populate('currentReservation');
    console.log(`[API] GET /api/tables - Returned ${tables.length} tables`);
    res.json(tables);
  } catch (error) {
    console.error(`[API Error] GET /api/tables:`, error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update table status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').emit('table_update', table);
    }
    
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
