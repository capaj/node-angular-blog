var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
    name: String
});
var Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;