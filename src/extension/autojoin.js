
Chatterbox.Extension.Autojoin = function( ui, client, ext ) {

    var settings = client.ext.defaults.autojoin;
    ext.autojoin = {};
    
    var init = function() {
    
        ui.on('settings.open', ext.autojoin.page);
        ui.on('settings.save', settings.save);
    
    };
    
    ui.nav.add_button( {
        'icon': 'chat',
        'label': '',
        'title': 'Join your autojoin channels',
        'href': '#autojoin-do',
        'handler': settings.join
    });
    
    ext.autojoin.page = function( event, ui ) {
    
        var page = event.settings.page('Autojoin');
        var ul = '<ul>';
        var orig = {};
        orig.ajon = settings.on;
        orig.chan = settings.channel;
        
        if( settings.channel.length == 0 ) {
            ul+= '<li><i>No autojoin channels set</i></li></ul>';
        } else {
            for( var i in settings.channel ) {
                if( !settings.channel.hasOwnProperty( i ) )
                    continue;
                ul+= '<li>' + settings.channel[i] + '</li>';
            }
            ul+= '</ul>';
        }
        
        page.item('Checkbox', {
            'ref': 'eaj',
            'title': 'Autojoin',
            'text': 'Turn on autojoin to automatically join selected channels\
                    when you connect to the chat server.',
            'items': [
                { 'value': 'yes', 'title': 'On', 'selected': orig.ajon }
            ],
            'event': {
                'change': function( event ) {
                    if( event.target.value == 'yes' )
                        settings.on = event.target.checked;
                },
                'save': function( event ) {
                    orig.ajon = settings.on;
                    client.config_save();
                },
                'close': function( event ) {
                    settings.on = orig.ajon;
                }
            }
        });
        
        var imgr = page.item('Items', {
            'ref': 'channelss',
            'title': 'Channels',
            'text': 'Add any channels you want to join automatically when you\
                    connect to the chat server.',
            'items': settings.channel,
            'prompt': {
                'title': 'Add Channel',
                'label': 'Channel:',
            },
            'event': {
                'up': function( event ) {
                    var swap = event.args.swap;
                    settings.channel[swap['this'].index] = swap.that.item;
                    settings.channel[swap.that.index] = swap['this'].item;
                    imgr.options.items = settings.channel;
                },
                'down': function( event ) {
                    var swap = event.args.swap;
                    settings.channel[swap['this'].index] = swap.that.item;
                    settings.channel[swap.that.index] = swap['this'].item;
                    imgr.options.items = settings.channel;
                },
                'add': function( event ) {
                    var item = client.deform_ns(event.args.item).toLowerCase();
                    var index = settings.channel.indexOf(item);
                    
                    if( index != -1 )
                        return;
                    
                    settings.channel.push( item );
                    imgr.options.items = settings.channel;
                },
                'remove': function( event ) {
                    settings.channel.splice( event.args.index, 1 );
                    imgr.options.items = settings.channel;
                },
                'save': function( event ) {
                    orig.chan = settings.channel;
                    client.config_save();
                },
                'close': function( event ) {
                    client.config_load();
                }
            }
        });
    
    };
    
    init();

};

