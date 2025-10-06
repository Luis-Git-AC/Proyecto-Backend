const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        minlength: 6,
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

userSchema.path('relatedItems').default(() => []);

userSchema.path("relatedItems").validate(function(value) {
    return value.length === new Set(value.map(v => v.toString())).size; 
});

userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) return next();
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);