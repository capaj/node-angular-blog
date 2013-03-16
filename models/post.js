var mongoose = require('mongoose');
var postSchema = mongoose.Schema({
    title: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);