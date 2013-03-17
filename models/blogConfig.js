var request = require('request'),
    Q = require('q'),
    mongoose = require('mongoose');

var FBAccountSchema = mongoose.Schema({
    id: String,
    first_name: String,
    last_name: String,
    gender: String,
    link: String,
    verified: String,
    picture: {
        data:{
            url: String,
            is_silhouette: String
        }
    }

});


var FBAccount = mongoose.model('FBAccount', FBAccountSchema);

var blogConfig = mongoose.Schema({
    lastToken: String,
    adminFBAcc: { type: mongoose.Schema.Types.ObjectId, ref: 'FBAccount' },
    smallAbout: String
});

blogConfig.methods.getFBAccFromToken = function (token) {
    var deferred = Q.defer();
    request('https://graph.facebook.com/me?access_token=' + token +
        '&fields=id,first_name,last_name,gender,link,installed,verified,picture,currency',
        function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var fbAccDetails = JSON.parse(body);
            this.adminFBAcc = new FBAccount(fbAccDetails);
            deferred.resolve(fbAccDetails);
        } else {
            deferred.reject();
        }
    });
    return deferred.promise;
};

module.exports = mongoose.model('BlogConfig', blogConfig);