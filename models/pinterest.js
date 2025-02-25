const mongoose = require('mongoose');
const crypto = require('crypto');

const algorithm = process.env.ALGORITHM; // 
const secretKey = process.env.ENCRYPTION_SECRET; // 32-byte key (must be stored securely)
const iv = process.env.ENCRYPTION_IV; // 16-byte IV (must be stored securely)

// Encrypt API Key
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Decrypt API Key
function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const apiKeySchema = new mongoose.Schema({
    token_vendor: { type: String, required: false },
    access_token: { type: String, required: true, unique: true },
    response_type: { type: String, required: false },
    refresh_token: { type: String, required: false },
    token_type: { type: String, required: false },
    expires_in: { type: Number, required: true },
    scope: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Encrypt API Key before saving
apiKeySchema.pre('save', function (next) {
    if (!this.isModified('access_token')) return next();
    this.access_token = encrypt(this.access_token);
    next();
});

apiKeySchema.pre('save', function (next) {
    if (!this.isModified('refresh_token')) return next();
    this.refresh_token = encrypt(this.refresh_token);
    next();
});

// Method to decrypt API key
apiKeySchema.methods.decryptKey = function () {
    try {
        console.log("Decrypting API Key");
        return decrypt(this.access_token);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
