    var DEBUG = 3;

    var GAPI = false;


    // Keep track of how many messages were sent
    var messageLastSeen = {};
    var myMessageCount = 0;
    var missedMessages = 0;
    

    // users that have app enabled ( players )
    var players_ = null;

    // is game started
    var started_ = false;


    GAME = (function(){

        var defaults = {
                suits       : ['s','h','c','d'],
                vals        : ['2','3','4','5','6','7','8','9','10','J','Q','K','A'],
                deck        : [],
                players     : null,
                pile        : null,
                winner      : null,
                $hands      : $('#hands'),
            },
            o = {};

        defaults.suits = ['c','h'];

        function _options( opts ){ _log('_options');
            o = _.extend( defaults, opts );
        }

        function _makeDeck(){ _log('_makeDeck()');

            for( var i=0; i<o.suits.length; i++ ){
                for( var j=0; j<o.vals.length; j++ ){
                    o.deck.push(o.vals[j] + o.suits[i]);
                }
            }

            o.deck = o.deck.shuffle();

        }

        function _start(){
            console.log( '_start()' );
            gapi.hangout.data.sendMessage(
                JSON.stringify(['_start'])
            );
        }

        function _cardVal( card ){ _log('_cardVal('+card+')');
            // this should be fixed - should be a better way to do this
            //_log( '_cardVal: ' + card );

            // removing suit from card
            var v = card.replace('c','').replace('d','').replace('h','').replace('s','');
            // changing face cards to number value
            v = v.replace('J',11).replace('Q',12).replace('K',13).replace('A',14);
            // return a number
            return parseInt(v);
        }

        function _deal(){ _log('_deal()');
        
            var p=o.players;

            // loop through all players in name array
            _.each(o.players,function(v,i){
                //_log( {msg:['player',v.playername,v.playerid],type:3})
                
                // Create each player 
                o.players[i] = new PLAYER({ name:v.playername, id:v.playerid  });

                // Create player hand div
                var n = o.players[i].name(),
                    h = o.players[i].div(),
                    t = $('<h5>').html(n),
                    d = $('<div>').addClass('hand').attr('id',h).html(t);
                o.$hands.append(d);             

            });

            // Deal each card to all playes
            _.each(o.deck,function(v,i){
                var d = i % p.length;
                o.players[d].winCards( v );
            });

        }

        function _play(){ _log('_play()');

            var p = o.players,  // players
                m = 0,          // max
                w = [],         // winners
                d = '',         // display
                pile = [];


            _.each(p, function(v){
                var c   = v.playCard(),
                    cv  = _cardVal( v.card() );

                    // add each card to the pile
                    pile.push(c);

                    // clear winners if card is higher
                    if( cv > m ) { w=[]; }

                    // set max and add to winners
                    if( cv >= m ){
                        m = cv;
                        w.push(v);
                    }

                d += v.name() + '('+ v.hand().length +'): ' + cv + "\t";
                return cv;
            });

            // log the display
            _log( d ); //_log( 'max: ' + m );

            // if more then one winner - declare war
            if( w.length > 1 ){
                pile = _playWar(pile);
                _log( 'War! : ' + pile );
            }

            // Set Winner
            if( w.length == 1){
                var winner = w[0];
                //_log( 'Winner: ' + winner.name() );

                // Push to Winner
                winner.winCards(pile);

                // Clear all players card
                _endTurn();

            }
        }

        function _endTurn(){
            _.each(o.players,function(v,i){
                w = v.endTurn();
            });
        }

        function _playCards(){
            var pile = [];
            _.each(o.players,function(v,i){
                pile.push( v.playCard() );
            });
            return pile;
        }

        function _playWar(pile){
            pile = pile.concat( _playCards() );
            _endTurn();
            pile = pile.concat( _playCards() );
            _endTurn();
            pile = pile.concat( _playCards() ); 
            _endTurn();
            return pile;
        }

        function _init( options ){ _log( '_init' );
            _options( options );
            _makeDeck();
            //_deal();
        }

        function _players(){
            return o.players;
        }

        function _get(v){
            return o[v];
        }

        function _sync(){
            var data = JSON.stringify(GAME.shared);
            sendData({GAME:data});
        }

        return {
            init    : _init,
            play    : _play,
            players : _players,
            deal    : _deal,
            sync    : _sync,
            shared  : { started: 'true' }
        }

    })(),

    PLAYER = (function( options ){

        var defaults = {
                name        : 'player',
                id          : null,
                hand        : [],
                played      : null,
                card        : null,
                lost        : false,
            },
            o = _.extend( defaults, options );

        function _set(k,v){
            o[k] = v;
        }

        function _playCard() { //_log( '_playCard ' + o.name );

            // check if played - if so return that card
            if( o.card ){
                return o.card;
            }

            // did not play yet - play top/first card
            var card = o.hand.shift();


            // GAME.remove.card

                // send trigger to remove card from play
                var event = new CustomEvent("playCard", {
                        detail: {
                            player: o.name,
                            card: card,
                            time: new Date(),
                        },
                        bubbles: true,
                        cancelable: true
                    });

                document.getElementById("main").dispatchEvent(event);

            //-------------------

            // set card
            _set('card',card);

            return o.card;
        }

        function _endTurn(){
            o.card      = null;
            o.played    = null;

            if( ! o.hand.length ){

                //GAME.player.Lost

                    var event = new CustomEvent("playerLost", {
                        detail: {
                            name: o.name,
                            time: new Date(),
                        },
                        bubbles: true,
                        cancelable: true
                    });

                    document.getElementById("main").dispatchEvent(event);

                //-------------------
                
                //_log( o.name + ' Lost' );
                o.lost = true;

            }
        }

        function _winCards( cards ) { _log( {msg:['_winCards', cards],type:4} );
            o.hand = o.hand.concat( cards );

            // GAME.winCards

                // send trigger to add cards to winners hand
                var event = new CustomEvent("winCards", {
                        detail: {
                            player: o.name,
                            cards: cards,
                            div: this.div(),
                            time: new Date(),
                        },
                        bubbles: true,
                        cancelable: true
                    });

                document.getElementById("main").dispatchEvent(event);

            //---------------------

        }

        function _get(v){
            return o[v];
        }

        return {
            playCard:   _playCard,
            winCards:   _winCards,
            endTurn:    _endTurn,
            get:        _get,
            hand: function(){ return o.hand; },
            name: function(){ return o.name; },
            card: function(){ return o.card; },
            div:  function(){ return 'hand_'+o.id; },
        }

    });


    //--------------------------------------------------------
    //   Buttons
    //--------------------------------------------------------

    $('#start a:first').click(function(){

        if (GAPI) {
            var p = gapi.hangout.getEnabledParticipants(),
                info = {
                    'getParticipants' : gapi.hangout.getParticipants(),
                    'getLocalParticipant' : gapi.hangout.getLocalParticipant(),
                    },
                init_players = new Array();

            $.each(p,function(i,v){

                var player = {
                    playerid:   v.person.id,
                    playername:     v.person.displayName,
                };

                init_players.push( player )
            })
        } else {
            init_players = [
                {playerid: 1, playername: 'Player 1'},
                {playerid: 2, playername: 'Player 2'},
            ];
        }

        GAME.init({
            players: init_players
        });

        started_ = true;

        GAME.sync();
        
    });

    $('#btn_play').click(function(){
        GAME.play();
    });


    //--------------------------------------------------------
    //   Functions
    //--------------------------------------------------------

    function addCards(hand,cards){ _log('addCards()');
        var id = '#' + hand,
            $h = $(id);

        if( typeof(cards) === 'string' ){
            cards = [cards];
        }

        $.each(cards,function(i,v){
            var suit=v.charAt(v.length-1),
                value=v.replace(suit,'');
            $h.append( '<span id="'+v+'" class="card s_'+suit+'" data-suit="'+suit+'" data-val="'+value+'">'+v+'</span>' );
        });
    }


    //--------------------------------------------------------
    //   Events
    //--------------------------------------------------------

    // add player lost event
    document.addEventListener("playerLost", playerLostHandler, false);

    // playerLost event handler
    function playerLostHandler(e){
        //_log( e );
        alert( e.detail.name + ' Lost!' );
    }

    // add play card event
    document.addEventListener("playCard", playCardHandler, false);

    // playCard event handler
    function playCardHandler(e){
        var c = '#' + e.detail.card;
        $(c).remove();
    }

    // add win cards event
    document.addEventListener("winCards", winCardsHandler, false);

    // winCards event handler
    function winCardsHandler(e){

        //console.log(e.detail)
        var h = e.detail.div,
            c = e.detail.cards;

        addCards(h,c);
    }


    //--------------------------------------------------------
    //   Helpers
    //--------------------------------------------------------

    function _log(msg){
        if( DEBUG !== undefined && DEBUG ){

            var message, type; 

            // Message Types
            // 1 = Error
            // 2 = Warning
            // 3 = Notice
            // 4 = Debug

            type = 4;
            message = msg;

            if( msg.type !== undefined ) {
                type    = msg.type;
            }

            if( msg.msg !== undefined ){
                message = msg.msg; 
            }

            if( type <= DEBUG ) { 
                console.log( message );
            }

        }
    }

    Array.prototype.shuffle = function(){
        for(var j, x, o = this, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x); return o;
    };

    /** Standard requestAnimFrame; see paulirish.com */
    window.requestAnimFrame = ( function(callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 30);
            };
    })();

    //--------------------------------------------------------
    //   Google API
    //--------------------------------------------------------



    /**
    * Creates a user block
    */
    function createParticipantElement(participant) {
        var avatar = $('<img />').attr({
            'width' : '27',
            'alt'   : 'Avatar',
            'class' : 'avatar',
            'src'   : participant.person.image && participant.person.image.url ? participant.person.image.url : ''
        });

        var name = $('<h2 />').text(participant.person.displayName);

        var statusText      = getStatusMessage(participant.id) || '';
        //var statusAnchor  = $('<p />').addClass('status-anchor').text(statusText + ' ');
        
        if (participant.id === getUserHangoutId()) {
            var triggerLink = $('<a href="#" class="link" />')
                .text(statusText ? 'Edit' : 'Set your status')
                .click(function() {
                    onSetStatus(this);
                    return false;
                });

            //statusAnchor.append(triggerLink);
        }

        return $('<li />').append(avatar, name);//, statusAnchor);
    }
    //--------------------------------------------------------

    function defer(func) {
        window.setTimeout(func, 10);
    }

    function deferInit(func) {
        window.setTimeout(func, 500);
    }

    /** Get a message.
     * @param {MessageReceievedEvent} event An event.
     */
    function onMessageReceived(event) {
        try {
            var data = JSON.parse(event.message);

            tileColor[data[2]][data[3]] = data[1];
            droppedPackageCount(event.senderId, parseInt(data[0]));
            showLossRates();
        } catch (e) {
            _log(e);
        }
    }

    function onStateChanged(addedKeys, metadata, removedKeys, state){

        console.log( addedKeys, metadata, removedKeys, state );
    }


    function _game_start(){

    }

    function onEnabledParticipantsChanged(){

        players = gapi.hangout.getEnabledParticipants();

        if( ! started_ ){

            console.log( players );

            $('div.players ul').empty()

            for (var i = players.length - 1; i >= 0; i--) {
                var p = players[i];
                //console.log( p );

                // if new 
                if( true ){
                    players_ = p;
                    $('div.players ul').append( createParticipantElement(p) );
                }
            };
        }
    }



    function onParticipantsChange() {
        participants =  gapi.hangout.getParticipants();

        for (var i = participants.length - 1; i >= 0; i--) {
            var p = participants[i];
            console.log( p );
        };
    }


    function sendData(data){
        // setup shared data
        console.log( 'sendData()', data );
        if (GAPI) {
            console.log( 'working...' );
            gapi.hangout.data.submitDelta( data );
        }
        
    }   

    /**
    * @param {!string} participantId The temporary id of a Participant.
    * @return {string} The status of the given Participant.
    */
    function getStatusMessage(participantId) {
        return '';//getState(makeUserKey(participantId, 'status'));
    }

    /**
    * Sets the status for the current user.
    * @param {!string} message The user's new status.
    */
    function setStatusMessage(message) {
        //saveValue(makeUserKey(getUserHangoutId(), 'status'), message);
    }


    /**
     * @return {string} The user's ephemeral id.
     */
    function getUserHangoutId() {
        
        console.log( 'getUserHangoutId()' );
        if (GAPI) {
            return gapi.hangout.getParticipantId();
        }
        
    }


    (function() {

        if (typeof gapi == 'undefined' || typeof gapi.hangout == 'undefined') {
            return false;
        }

        GAPI = true;

        var initHangout = function(apiInitEvent) {
            if (apiInitEvent.isApiReady) {
                
                // StateChange Events
                gapi.hangout.data.onStateChanged.add(onStateChanged);

                // Message Events
                gapi.hangout.data.onMessageReceived.add(onMessageReceived);

                // Participants that join
                gapi.hangout.onParticipantsChanged.add(onParticipantsChange);

                // Participants that start the APP
                gapi.hangout.onEnabledParticipantsChanged.add(onEnabledParticipantsChanged);


                // if just started add players
                deferInit( onEnabledParticipantsChanged );

                gapi.hangout.onApiReady.remove(initHangout);
            }
        };

        gapi.hangout.onApiReady.add(initHangout);

    })();

    // Wait for gadget to load.
    //gadgets.util.registerOnLoadHandler(init);
