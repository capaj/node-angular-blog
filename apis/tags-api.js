var mongoose = require('mongoose');
var Tag = require('../models/tag.js'),
    Q = require('q');

module.exports = {
    register: function (app) {
        //TODO expose getter for all Tags to make them accessible at edit screen
        //TODO expose put to be able to create new tags
        app.get('/tags', function (req, res) {
           Tag.find().exec(function (err, tags) {
               if (err) {
                   res.send(500);
               }
               res.json(tags);
           })
        });
    },
    findTagsByNames: function (arrOfTagNames, callback) {
        var promises = [];
        var deferreds = [];
        arrOfTagNames.forEach(function (tag, index) {
            deferreds[index] = Q.defer();
            var promise = deferreds[index].promise;
            promises[index] = promise;
            promise.then(function (tag) {
                arrOfTagNames[index] = tag;
            }, function () {
                arrOfTagNames.splice(index, 1); // if tag not found, let's just delete it from tha array
            });
            var query = {name: tag};
            Tag.findOne(query).exec(function (err, foundTag) {
                if (err) {
                    console.error(err);
                    deferreds[index].reject();
                    return;
                }
                deferreds[index].resolve(foundTag);
            });
        });

        Q.allResolved(promises).then(callback);
    }
};