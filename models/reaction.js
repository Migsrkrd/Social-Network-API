const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    reactionId: { type: mongoose.Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    reactionBody: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    username: { type: String, required: true},
    });
const reaction = mongoose.model('reaction', reactionSchema);

module.exports = reaction;
