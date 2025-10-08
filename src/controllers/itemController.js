const mongoose = require('mongoose');
const { Item, User } = require('../models');

const createItem = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const currentUser = req.user;

    if (!name || !description) {
      return res.status(400).json({ error: 'Faltan campos requeridos: name y description.' });
    }

    const item = await Item.create({
      name,
      description,
      price: price ?? 0,
      createdBy: currentUser._id
    });

    res.status(201).json({ item });
  } catch (error) {
    console.error('❌ Error creando item:', error);
    res.status(500).json({ error: 'Error del servidor al crear item.' });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('createdBy', 'name email');
    res.json({ count: items.length, items });
  } catch (error) {
    console.error('❌ Error obteniendo items:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const item = await Item.findById(id).populate('createdBy', 'name email');
    if (!item) return res.status(404).json({ error: 'Item no encontrado.' });
    res.json({ item });
  } catch (error) {
    console.error('❌ Error obteniendo item:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado.' });

    if (item.createdBy.toString() !== currentUser._id.toString() && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para modificar este item.' });
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;

    await item.save();
    res.json({ item });
  } catch (error) {
    console.error('❌ Error actualizando item:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar item.' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado.' });

    if (item.createdBy.toString() !== currentUser._id.toString() && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar este item.' });
    }

    await Item.findByIdAndDelete(id);

    await User.updateMany({ relatedItems: id }, { $pull: { relatedItems: id } });

    res.json({ message: 'Item eliminado correctamente.', deletedItem: { id: item._id, name: item.name } });
  } catch (error) {
    console.error('❌ Error eliminando item:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar item.' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
};
