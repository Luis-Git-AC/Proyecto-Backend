const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const userController = require('../controllers/userController');

router.get('/', authMiddleware, requireRole(['admin']), userController.getAllUsers);
router.put('/role/:id', authMiddleware, requireRole(['admin']), userController.changeUserRole);
router.delete('/:id', authMiddleware, userController.deleteUser);
router.patch('/:id/image', authMiddleware, upload.single('image'), userController.uploadImage);

router.post('/:id/relatedItems', authMiddleware, userController.addRelatedItem);
router.delete('/:id/relatedItems/:itemId', authMiddleware, userController.removeRelatedItem);

module.exports = router;
