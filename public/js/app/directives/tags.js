app.directive('tags', function() {
    return {
        restrict: 'A',
        scope: {tagsdata: "="},
        link: function(scope, element, attrs) {
            if (scope.tagsdata) {
                $(element).tags(scope.tagsdata);
                scope.tagsdata.data = $(element).data('tags'); // make tagsData object easily accesible from controller
            } else {
                console.log("no tags data specified");
            }

        }
    };
});