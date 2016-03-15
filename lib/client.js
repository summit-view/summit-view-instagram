define([], function() {

    var cx = function(arg) {
        var keep = [];

        for( var key in arg ) {
            if( arg[key] ) {
                keep.push(key);
            }
        }

        return keep.join(' ');
    };

    var init = function(panel, socket) {
        socket.on('recent', function(recent) {
            var html = '';

            for (var i = 0; i < recent.length; i++) {
                var media = recent[i]
                html += '<img src="' + media.images.standard_resolution.url + '" />';
            }

            panel.innerHTML = html;
        });
    };

    return init;
});
