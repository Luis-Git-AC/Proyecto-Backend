const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { createItem, getItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');

router.get('/', getItems);
router.get('/:id', getItemById);

router.post('/', authMiddleware, createItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
