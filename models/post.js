var mongoose = require('mongoose');
var Tag = require('./tag.js');

var postSchema = mongoose.Schema({
    title: String,
    text: String,       //html
    createdAt: { type: Date, default: Date.now },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

module.exports = mongoose.model('Post', postSchema);