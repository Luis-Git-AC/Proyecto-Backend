const { User } = require('../models');

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

    //cloudinary


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

module.exports = {
  changeUserRole,
  getAllUsers,
  deleteUser
};