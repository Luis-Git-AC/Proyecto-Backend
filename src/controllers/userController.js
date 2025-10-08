const { User, Item } = require('../models');
const cloudinary = require('../config/cloudinary');

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin".' });
    }

    if (currentUser._id.toString() === id) {
      return res.status(403).json({ 
        error: 'No puedes cambiar tu propio rol.' 
      });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (userToUpdate.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'No puedes eliminar el último administrador.' 
        });
      }
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.json({
      message: `Rol de usuario actualizado exitosamente.`,
      user: {
        id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role
      }
    });

  } catch (error) {
    console.error('❌ Error cambiando rol:', error);
    res.status(500).json({ error: 'Error del servidor al cambiar rol.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user; 

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return res.status(403).json({ 
        error: 'Solo puedes eliminar tu propia cuenta.' 
      });
    }

    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'No puedes eliminar el último administrador.' 
        });
      }
    }

    if (userToDelete.image && userToDelete.image.public_id) {
      try {
        await cloudinary.uploader.destroy(userToDelete.image.public_id);
        console.log('🗑️ Imagen eliminada de Cloudinary:', userToDelete.image.public_id);
      } catch (cloudinaryError) {
        console.error('⚠️ Error eliminando imagen de Cloudinary:', cloudinaryError);
      }
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: 'Usuario eliminado exitosamente.',
      deletedUser: {
        id: userToDelete._id,
        name: userToDelete.name,
        email: userToDelete.email
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar usuario.' });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return res.status(403).json({ 
        error: 'Solo puedes modificar tu propia imagen.' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.image && user.image.public_id) {
      try {
        await cloudinary.uploader.destroy(user.image.public_id);
      } catch (err) {
        console.error('❌ Error eliminando imagen anterior en Cloudinary:', err.message);
      }
    }

    user.image = {
      url: req.file.path,
      public_id: req.file.filename
    };

    await user.save();

    res.json({
      message: 'Imagen actualizada exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    res.status(500).json({ error: 'Error del servidor al subir imagen.' });
  }
};

// Agregar un relatedItem al arreglo del usuario usando $addToSet (sin duplicados)
const addRelatedItem = async (req, res) => {
  try {
    const { id } = req.params; // id del usuario al que añadiremos
    const { itemId } = req.body; // id del item a añadir
    const currentUser = req.user;

    // permisos: solo admin o el propio usuario
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return res.status(403).json({ error: 'No autorizado para modificar relatedItems de este usuario.' });
    }

    if (!itemId) return res.status(400).json({ error: 'Se requiere itemId en el body.' });

    if (!require('mongoose').Types.ObjectId.isValid(id) || !require('mongoose').Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    // verificar que el item exista
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item no encontrado.' });

    const updated = await User.findByIdAndUpdate(
      id,
      { $addToSet: { relatedItems: itemId } },
      { new: true }
    ).populate('relatedItems');

    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });

    res.json({ message: 'Item añadido a relatedItems (sin duplicados).', user: { id: updated._id, relatedItems: updated.relatedItems } });
  } catch (error) {
    console.error('❌ Error añadiendo relatedItem:', error);
    res.status(500).json({ error: 'Error del servidor al añadir relatedItem.' });
  }
};

// Quitar un relatedItem usando $pull
const removeRelatedItem = async (req, res) => {
  try {
    const { id, itemId } = req.params; // id usuario, itemId a quitar
    const currentUser = req.user;

    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return res.status(403).json({ error: 'No autorizado para modificar relatedItems de este usuario.' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(id) || !require('mongoose').Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $pull: { relatedItems: itemId } },
      { new: true }
    ).populate('relatedItems');

    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });

    res.json({ message: 'Item removido de relatedItems.', user: { id: updated._id, relatedItems: updated.relatedItems } });
  } catch (error) {
    console.error('❌ Error removiendo relatedItem:', error);
    res.status(500).json({ error: 'Error del servidor al remover relatedItem.' });
  }
};

module.exports = {
  changeUserRole,
  getAllUsers,
  deleteUser,
  uploadImage,
  addRelatedItem,
  removeRelatedItem
};


