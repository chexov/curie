var dummy = function() {};

var hotkeys = {
    "Global" : {
        't j' : {
            doc : 'Choose a pack below',
            action : function() {
                curie.state.trigger("hotkey:packList", "down");
            }
        },
        't k' : {
            doc : 'Choose a pack above',
            action : function() {
                curie.state.trigger("hotkey:packList", "up");
            }
        },
        '/' : {
            doc : 'Activate search',
            action : function(e) {
                e && e.preventDefault();
                curie.state.trigger("search:show");
            }
        },
        's s' : {
            doc : 'Stop syncing',
            action : function(e) {
                e && e.preventDefault();
                curie.controllers.data.stopSync();
            }
        },
        '?' : {
            doc : 'Show hotkeys description',
            action : showHotkeysHelp
        },
        'esc' : {
            doc : 'Go one level up',
            action : function() {
                curie.state.trigger("hotkey:esc");
            }
        },
        '>' : {
            doc : 'Change background image',
            action : function(e) {
                e && e.preventDefault();

                CURRENT_BACKGROUND_I++;

                if (CURRENT_BACKGROUND_I > BACKGROUNDS.length) {
                    CURRENT_BACKGROUND_I = -1;
                    $("body").css({"background-image" : ""});
                } else {
                    $("body").css({"background-image" : "url(" + BACKGROUNDS[CURRENT_BACKGROUND_I] + ")"});
                }

                //document.cookie = "curie-background=" + CURRENT_BACKGROUND_I + "; expires=Thu, 1 Jan 2099 12:00:00 UTC; path=/";
                
            }
        },
        'q q' : {
            doc : 'Logout',
            action : function(e) {
                e && e.preventDefault();
                curie.state.trigger("logout");
            }
        },
        /*
        't l' : {
            doc : 'Show choosed pack',
            action : function() {
                curie.state.trigger("activateSelectedPack");
            }
        },
        'v t' : {
            doc : 'Show current pack as tiles',
            action : function() {
                curie.state.trigger("showPackAs", "tiles");
            }
        },
        'v l' : {
            doc : 'Show current pack as list',
            action : function() {
                curie.state.trigger("showPackAs", "list");
            }
        },
        'v c' : {
            doc : 'Show current pack as combined view',
            action : function() {
                curie.state.trigger("showPackAs", "combined");
            }
        },
        */
    },
    "List of messages" : {
        'j' : {
            doc : 'Select a message below',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("move", "down");
            }
        },
        'k' : {
            doc : 'Select a message above',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("move", "up");
            }
        },
        'l' : {
            doc : 'Open message',
            action : function () {
                curie.state.get("localHotkeysKeyListener").trigger("action", "open");
            }
        },
        'h' : {
            doc : 'Navigate to upper level',
            action : function () {
                Mousetrap.trigger("esc");
            }
        },
        'x' : {
            doc : 'Mark/unmark a message',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("action", "mark");
            }
        },
        'g g' : {
            doc : 'Select the latest message',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("move", "first");
            }
        },
        'G' : {
            doc : 'Select the earliest message',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("move", "last");
            }
        },
        'a a' : {
            doc : 'Archive marked messages',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("action", "archive");
            }
        },
        'a l' : {
            doc : 'Add label(s)',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("action", "add-labels");
            }
        },
        'D D' : {
            doc : 'Delete marked messages forever',
            action : function() {
                curie.state.get("localHotkeysKeyListener").trigger("action", "delete forever");
            }
        },
    },
    "Message" : {
        'm n' : {
            doc : 'Create a new message',
            action : function(e) {
                e && e.preventDefault();
                curie.controllers.layout.showDraft();
            }
        },
        /*
        'm u' : {
            doc : 'Mark a message as unread',
            action : dummy
        },
        'm l' : {
            doc : 'Add a label',
            action : dummy
        },
        */
        'm h' : {
            doc : 'Show opened message as HTML',
            action : function(e) {
                curie.state.trigger("message:show:type", "html");
            }
        },
        'm t' : {
            doc : 'Show opened message as plain text',
            action : function(e) {
                curie.state.trigger("message:show:type", "text");
            }
        },
    },
};

_.each(hotkeys, function(keys, actionType) {
    _.each(keys, function(value, hotkey) {
        Mousetrap.bind(hotkey, function(e, combo) {
            console.info("Hotkey '" + combo + "' pressed");
            value.action(e);
        });
    });
});

function showHotkeysHelp() {
    var tmpl = Handlebars.templates.hotkeysModal;

    var tmplData = [];
    _.each(hotkeys, function(keys, actionType) {
        var actionTypeData = [];
        _.each(keys, function(value, hotkey) {
            actionTypeData.push({
                hotkey : hotkey,
                doc : value.doc,
            })
        });
        tmplData.push({ name : actionType, actions : actionTypeData});
    });
    $("#hotkeysModal").html(tmpl({actionGroups : tmplData})).modal({
        keyboard : true
    });
}
