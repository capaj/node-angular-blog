app.directive('tags', function() {
    return {
        restrict: 'A',
        // The linking function will add behavior to the template
        scope: {tagsdata: "="},
        link: function(scope, element, attrs) {
            if (scope.tagsdata) {
                $(element).tags(scope.tagsdata);

            } else {
                console.log("no tags data specified");
            }


        }
    };
});