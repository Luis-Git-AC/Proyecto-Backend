const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor ingresa un email válido']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    image: {
        type: String, //cloudinary
        default: null
    },
    relatedItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' 
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

userSchema.path("relatedItems").validate(function(value) {
    return value.length === new Set(value.map(v => v.toString())).size; 
});

module.exports = mongoose.model('User', userSchema);