app.factory('facebook', function ($q) {
        // Load the SDK Asynchronously
        (function (d) {
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/cs_CZ/all.js";
            ref.parentNode.insertBefore(js, ref);
        }(document));

        // Init the SDK upon load
        var aToken;
        var FBdfd = $q.defer();
        var medfd = $q.defer();
        var retVal = {promise: FBdfd.promise, me: { promise: medfd.promise }};
        if (true) {

            window.fbAsyncInit = function () {
                FB.init({
                    appId: '346329148807098', // Dem2.cz App ID
                    //channelUrl : '//'+window.location.hostname+'/channel', // Path to your Channel File
                    status: true, // check login status
                    cookie: true, // enable cookies to allow the server to access the session
                    xfbml: true  // parse XFBML
                });

                // listen for and handle auth.statusChange events
                FB.Event.subscribe('auth.statusChange', function (response) {
                    if (response.authResponse) {
                        // user has auth'd your app and is logged into Facebook
                        aToken = response.authResponse.accessToken;
                        if (aToken) {
                            retVal.token = aToken;
                            FB.api('/me', function (me) {
                                angular.extend(retVal.me, me);
                                if (me.name) {
                                    document.getElementById('auth-displayname').innerHTML = me.name;
                                }
                                if(me.id){
                                    medfd.resolve(me);
                                }
                            });
                            FBdfd.resolve(aToken, FB);
                        } else {
                            FBdfd.reject();
                        }

                        //$("#auth-loggedout").
                        document.getElementById('auth-loggedout').style.display = 'none';
                        document.getElementById('auth-loggedin').style.display = 'block';
                    } else {
                        // user has not auth'd your app, or is not logged into Facebook
                        document.getElementById('auth-loggedout').style.display = 'block';
                        document.getElementById('auth-loggedin').style.display = 'none';
                    }
                });

                // respond to clicks on the login and logout links
                document.getElementById('auth-loginlink').addEventListener('click', function () {
                    FB.login();
                });
                document.getElementById('auth-logoutlink').addEventListener('click', function () {
                    FB.logout();
                });
            }
        } else {
            setTimeout(function () {
                FBdfd.resolve("TESTING_TOKEN_1");
            }, 100)    // we are running it locally, so we use this fake token
        }
        return retVal;
    }
);
