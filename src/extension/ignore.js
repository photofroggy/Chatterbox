

Chatterbox.Extension.Ignore = function( ui, client, ext ) {

    var settings = client.ext.defaults.ignore;
    ext.ignore = {};
    
    var stub = function() {};
    
    var init = function() {
    
        ui.on('settings.open', ext.ignore.page);
        
        client.bind('ignore.loaded', ext.ignore.loaded);
        client.bind('ignore.add', ext.ignore.add);
        client.bind('ignore.remove', ext.ignore.remove);
    
    };
    
    ext.ignore.loaded = function( event ) {
    
        for( var i = 0; i < event.ignored.length; i++ ) {
        
            if( !event.ignored.hasOwnProperty( i ) )
                continue;
            
            ui.mute_user( event.ignored[i] );
        
        }
    
    };
    
    ext.ignore.add = function( event ) {
    
        ui.mute_user( event.user );
        
        if( event.suppress )
            return;
        
        var msg = replaceAll( settings.fignore, '{user}', event.user );
        
        if( msg.indexOf( '/me' ) == 0 ) {
            msg = msg.substr( 4 );
            client.action( ui.chatbook.current.namespace, msg );
            return;
        }
        
        client.say( ui.chatbook.current.namespace, msg );
    
    };
    
    ext.ignore.remove = function( event ) {
    
        ui.unmute_user( event.user );
        
        if( event.suppress )
            return;
        
        var msg = replaceAll( settings.funignore, '{user}', event.user );
        
        if( msg.indexOf( '/me' ) == 0 ) {
            msg = msg.substr( 4 );
            client.action( ui.chatbook.current.namespace, msg );
            return;
        }
        
        client.say( ui.chatbook.current.namespace, msg );
    
    };
    
    ext.ignore.page = function( event, ui ) {
    
        var page = event.settings.page('Ignores');
        var orig = {};
        orig.im = settings.fignore;
        orig.uim = settings.funignore;
        orig.usr = settings.ignored;
        
        page.item('Text', {
            'ref': 'intro',
            'title': 'Ignores',
            'text': 'Use <code>ignore</code> to ignore people.\n\n\
                    You can "ignore" other users of the chat server using the\n\
                    <code>/ignore</code> command. Ignoring a user hides their\
                    messages from you in the channel log.',
        });
        
        page.item('Form', {
            'ref': 'msgs',
            'title': 'Messages',
            'text': 'Here you can set the messages displayed when you ignore or\
                    unignore a user.\n\nThe text <code>{user}</code> is replaced\
                    with the name of the user your are ignoring or unignoring.',
            'fields': [
                ['Textfield', {
                    'ref': 'ignore',
                    'label': 'Ignore',
                    'default': orig.im
                }],
                ['Textfield', {
                    'ref': 'unignore',
                    'label': 'Unignore',
                    'default': orig.uim
                }]
            ],
            'event': {
                'save': function( event ) {
                    settings.fignore = event.data.ignore;
                    settings.funignore = event.data.unignore;
                    settings.save();
                }
            }
        });
        
        var imgr = page.item('Items', {
            'ref': 'ignoreds',
            'title': 'Users',
            'text': 'This is the list of users that you have silenced.\n\nUse the\
                    commands <code>/ignore</code> and <code>/unignore</code>\
                    to edit the list.',
            'items': orig.usr,
            'prompt': {
                'title': 'Add User',
                'label': 'User:',
            },
            'event': {
                'up': function( event ) {
                    var swap = event.args.swap;
                    settings.ignored[swap['this'].index] = swap.that.item;
                    settings.ignored[swap.that.index] = swap['this'].item;
                    imgr.options.items = settings.ignored;
                },
                'down': function( event ) {
                    var swap = event.args.swap;
                    settings.ignored[swap['this'].index] = swap.that.item;
                    settings.ignored[swap.that.index] = swap['this'].item;
                    imgr.options.items = settings.ignored;
                },
                'add': function( event ) {
                    settings.add( event.args.item, true );
                    imgr.options.items = settings.ignored;
                },
                'remove': function( event ) {
                    settings.remove( event.args.item, true );
                    imgr.options.items = settings.ignored;
                },
                'save': function( event ) {
                    orig.usr = settings.ignored;
                    settings.save();
                },
                'close': function( event ) {
                    settings.load();
                }
            }
        });
    
    };
    
    init();

};

