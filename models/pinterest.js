const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const apiKeySchema = new mongoose.Schema({
    access_token: { type: String, required: true, unique: true },
    response_type: { type: String, required: true },
    token_type: { type: String, required: true },
    expires_in: { type: Number, required: true },
    scope: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Generate JWT-encrypted API key before saving
apiKeySchema.pre('save', function (next) {
    if (!this.isModified('access_token')) return next();
    this.access_token = jwt.sign({ access_token: this.access_token }, process.env.JWT_SECRET);
    next();
});

// Method to decrypt API key
apiKeySchema.methods.decryptKey = function () {
    try {
        const decoded = jwt.verify(this.access_token, process.env.JWT_SECRET);
        return decoded.access_token;
    } catch (error) {
        return null;
    }
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
