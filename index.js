var id = 'summit-view-instagram';
var ig = require('instagram-node').instagram();
var config, settings, summit, recent = [], timeout;

var scheduleUpdate = function(remaining, limit) {
    /*
        Rate-limiting (assuming sandbox)

        CLIENT STATUS   RATE LIMIT
        Sandbox         500 / hour = max 1 poll every 7.2s
        Live            5000 / hour = max 1 poll every 0.72s
    */

    var pollrate = config.pollrate || 120;
    clearTimeout(timeout);
    timeout = setTimeout(updateRecent, pollrate * 1000);
};

var updateRecent = function() {
    if( settings.user_id ) {
        ig.user_media_recent(settings.user_id, function(err, medias, pagination, remaining, limit) {
            recent = (!err) ? medias : [];
            summit.io.emit('recent', recent);
            summit.io.emit('loaded');
            scheduleUpdate(remaining, limit);
        });
    }
    else {
        recent = [];
        summit.io.emit('recent', recent);
        summit.io.emit('loading', 'Need settings...');
        clearTimeout(timeout);
    }
};

var updateClient = function(conf) {
    if( (conf.client_id && conf.client_secret) || conf.access_token ) {
        ig.use({
            client_id: conf.client_id,
            client_secret: conf.client_secret,
            access_token: conf.access_token,
        });
    }
    else {
        clearTimeout(timeout);
        summit.io.emit('loading', 'Need settings...');
    }
};

module.exports = function(s) {
    summit = s;
    config = config || {};

    // emit the profiles on new connection
    summit.io.on('connection', function(socket) {
        socket.emit('recent', recent);

        if( recent.length ) {
            socket.emit('loaded');
        }
        else {
            socket.emit('loading', 'No images to show...');
        }
    });


    return summit.settings()
        .then(function(s) {
            settings = s || {};

            if( !config.client_id ) {
                summit.registerSetting({
                    name: 'client_id',
                    label: 'Client ID',
                    type: 'text',
                    value: settings.client_id || '',
                });
            }

            if( !config.client_secret ) {
                summit.registerSetting({
                    name: 'client_secret',
                    label: 'Client secret',
                    type: 'text',
                    value: settings.client_secret || '',
                });
            }

            if( !config.client_id ) {
                summit.registerSetting({
                    name: 'access_token',
                    label: 'Access token',
                    type: 'text',
                    value: settings.access_token || '',
                });
            }

            summit.registerSetting({
                name: 'user_id',
                label: 'User ID',
                type: 'text',
                value: settings.user_id || '',
            });

            if( (config.client_id && config.client_secret) || config.access_token ) {
                // assume config
                updateClient(config);
                updateRecent();
            }
            else if( (settings.client_id && settings.client_secret) || settings.access_token ) {
                // assume settings
                ig.use(settings);
                updateRecent();
            }

            return {
                id: id,
                branding: {
                    icon: {
                        fa: 'instagram',
                    },
                    color: {
                        background: 'instagram',
                        text: 'clouds',
                        icon: 'clouds',
                    },
                }
            };
        });

};

module.exports.id = id;

module.exports.client = __dirname + '/lib/client.js';

module.exports.style = __dirname + '/public/style.css';

module.exports.onSettings = function(s) {
    settings = s;
    if( (!config.client_id && settings.client_id && !config.client_secret && settings.client_secret) || !config.access_token && settings.access_token ) {
        updateClient(settings);
    }
    else {
        summit.io.emit('Need settings...');
    }
    updateRecent();
};

module.exports.init = function(cfg) {
    config = cfg;
    ig.use(config);
    return module.exports;
};
