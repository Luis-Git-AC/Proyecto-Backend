const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true ,
        trim : true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        min : 0,

    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);

