// routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createEquipment, 
  getAllEquipment, 
  getEquipmentById, 
  updateEquipment, 
  deleteEquipment 
} = require('../controllers/equipmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', authMiddleware, adminMiddleware, createEquipment);
router.get('/', authMiddleware, getAllEquipment);
router.get('/:id', authMiddleware, getEquipmentById);
router.put('/:id', authMiddleware, adminMiddleware, updateEquipment);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEquipment);

module.exports = router;