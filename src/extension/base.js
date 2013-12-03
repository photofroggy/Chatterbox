

Chatterbox.Extension = function( ui, client ) {

    var storage = client.storage.folder('ui');
    var ext = {
        page: {},
        cmd: {}
    };
    
    ui.storage = storage;
    
    var init = function(  ) {
    
        ui.on('settings.open', ext.page.settings);
        ui.on('settings.open.ran', ext.page.about);
        ui.on('settings.save.ui', ext.save);
        ui.on('settings.save', function(  ) { client.config_save(); } );
        
        client.bind( 'cmd.gettitle', ext.cmd.gett );
        client.bind( 'cmd.gettopic', ext.cmd.gett );
        
        client.bind('cmd.clear', ext.cmd.clear );
        client.bind('cmd.clearall', ext.cmd.clearall );
        
        client.bind( 'cmd.theme', ext.cmd.theme );
        
        Chatterbox.Extension.Away( ui, client, ext );
        Chatterbox.Extension.Autojoin( ui, client, ext );
        Chatterbox.Extension.Ignore( ui, client, ext );
        
        ext.load();
        ext.save();
        
    };
    
    ext.save = function(  ) {
        storage.set('theme', ui.settings.theme);
        storage.set('clock', ui.settings.clock.toString());
        storage.set('tabclose', ui.settings.tabclose.toString());
    };
    
    ext.load = function(  ) {
    
        ui.settings.theme = storage.get('theme', ui.settings.theme);
        ui.settings.clock = (storage.get('clock', ui.settings.clock.toString()) == 'true');
        ui.settings.tabclose = (storage.get('tabclose', ui.settings.tabclose.toString()) == 'true');
    
    };
    
    ext.page.settings = function( e, ui ) {
        
        var page = e.settings.page('Main');
        var orig = {};
        orig.username = client.settings.username;
        orig.pk = client.settings.pk;
        orig.devel = client.settings.developer;
        orig.theme = replaceAll(ui.settings.theme, 'wsct_', '');
        orig.clock = ui.clock();
        orig.tc = ui.nav.closer();
    
        var themes = [];
        for( i in ui.settings.themes ) {
            name = replaceAll(ui.settings.themes[i], 'wsct_', '');
            themes.push({ 'value': name, 'title': name, 'selected': orig.theme == name })
        }
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Main',
            'text': 'Use this window to view and change your settings.\n\nCheck\
                    the different pages to see what settings can be changed.',
        });
        
        page.item('Form', {
            'ref': 'login',
            'title': 'Login',
            'text': 'Here you can change the username and token used to\
                    log into the chat server.',
            'fields': [
                ['Textfield', {
                    'ref': 'username',
                    'label': 'Username',
                    'default': orig.username
                }],
                ['Textfield', {
                    'ref': 'token',
                    'label': 'Token',
                    'default': orig.pk
                }]
            ],
            'event': {
                'save': function( event ) {
                    client.settings.username = event.data.username;
                    client.settings.pk = event.data.token;
                }
            }
        });
        
        page.item('Form', {
            'ref': 'ui',
            'title': 'UI',
            'hint': '<b>Timestamp</b><br/>Choose between a 24 hour clock and\
                    a 12 hour clock.\n\n<b>Theme</b><br/>Change the look of the\
                    client.\n\n<b>Close Buttons</b><br/>Turn tab close buttons on/off.',
            'fields': [
                ['Dropdown', {
                    'ref': 'theme',
                    'label': 'Theme',
                    'items': themes
                }],
                ['Dropdown', {
                    'ref': 'clock',
                    'label': 'Timestamp Format',
                    'items': [
                        { 'value': '24', 'title': '24 hour', 'selected': orig.clock },
                        { 'value': '12', 'title': '12 hour', 'selected': !orig.clock }
                    ]
                }],
                ['Checkbox', {
                    'ref': 'tabclose',
                    'label': 'Close Buttons',
                    'items': [
                        { 'value': 'yes', 'title': 'On', 'selected': orig.tc }
                    ]
                }],
            ],
            'event': {
                'change': function( event ) {
                    ui.clock(event.data.clock == '24');
                    ui.theme(event.data.theme);
                    ui.nav.closer(event.data.tabclose.indexOf('yes') > -1);
                },
                'save': function( event ) {
                    orig.clock = ui.clock();
                    orig.theme = replaceAll(ui.theme(), 'wsct_', '');
                    orig.tc = ui.nav.closer();
                    
                    ui.trigger('settings.save.ui', {
                        'clock': orig.clock,
                        'tabclose': orig.tc,
                        'theme': 'wsct_' + orig.theme
                    } );
                },
                'close': function( event ) {
                    ui.clock(orig.clock);
                    ui.theme(orig.theme);
                    ui.nav.closer(orig.tc);
                }
            }
        });
        
        page.item('Form', {
            'ref': 'developer',
            'title': 'Developer Mode',
            'text': 'Turn developer mode on or off.\n\nDeveloper mode will expose any hidden\
                channel tabs, amongst other things. Keep this turned off unless you\'re working\
                on implementing something.',
            'fields': [
                ['Checkbox', {
                    'ref': 'enabled',
                    'items': [
                        { 'value': 'on', 'title': 'On', 'selected': orig.devel }
                    ]
                }]
            ],
            'event': {
                'change': function( event ) {
                    client.settings.developer = (event.data.enabled.indexOf('on') != -1);
                    ui.developer(client.settings.developer);
                },
                'save': function( event ) {
                    orig.devel = client.settings.developer;
                },
                'close': function( event ) {
                    client.settings.developer = orig.devel;
                    ui.developer(client.settings.developer);
                }
            }
        });
        
        page.item('Text', {
            'ref': 'debug',
            'wclass': 'faint',
            'title': 'Debug Information',
            'text': 'Chat Agent: <code>' + client.settings.agent + '</code>\n\nUser\
                    Agent: <code>' + navigator.userAgent + '</code>'
        });
    
    };
        
    ext.page.about = function( e, ui ) {
    
        var page = e.settings.page('About', true);
        page.item('Text', {
            'ref': 'about-wsc',
            'title': 'Wsc',
            'text': 'Currently using <a href="http://github.com/photofroggy/wsc/">wsc</a>\
                    version ' + wsc.VERSION + ' ' + wsc.STATE + '.\n\nWsc\
                    works using HTML5, javascript, and CSS3. WebSocket is used for the connection\
                    where possible. The source code for this client is pretty huge.\n\nWsc was created\
                    by ~<a href="http://photofroggy.deviantart.com/">photofroggy</a>'
        });
    
    };
    
    // Get the title or topic.
    ext.cmd.gett = function( event, client ) {
        var which = event.cmd.indexOf('title') > -1 ? 'title' : 'topic';
        ui.control.set_text('/' + which + ' ' + client.channel(event.target).info[which].content);
    };
    
    ext.cmd.theme = function( event, client ) {
        ui.theme(event.args.split(' ').shift());
    };
    
    // Clear the channel's log.
    ext.cmd.clear = function( e, client ) {
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            for( var i in users ) {
                if( !users.hasOwnProperty(i) )
                    continue;
                ui.channel( e.target ).clear_user( users[i] );
            }
        } else {
            ui.channel( e.target ).clear();
        }
    };
    
    // Clear all channel logs.
    ext.cmd.clearall = function( e, client ) {
        var method = null;
        
        if( e.args.length > 0 ) {
            var users = e.args.split(' ');
            method = function( ns, channel ) {
                for( var i in users ) {
                    if( !users.hasOwnProperty(i) )
                        continue;
                    channel.clear_user( users[i] );
                }
            };
        } else {
            method = function( ns, channel ) {
                channel.clear();
            };
        }
        
        ui.chatbook.each( method, true );
    };
    
    
    init();
    
    return ext;

};

