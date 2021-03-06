
var requestsRegistry = {};

Backbone.sync = function (method, model, options) {

    console.info("Backbone.sync", method, model);

    if (!model) {
        console.warn("No model to sync", method, model, options);
        return;
    }

    model.syncRequests = model.syncRequests || {};

    //console.info(method, model.syncRequests[method]);

    var callID = model.syncRequests[method] = new Date().getTime();

    var socket = curie.controllers.data.getSocket(); // grab active socket from global namespace; io.connect() was used to create socket

    /*
     * Create signature object that will emitted to server with every request. 
     * This is used on the server to push an event back to the client listener.
     */
    var modelCast = function () {

        var obj = { url : getUrl(model) };
        /*
        if (model.id) {
            obj.url += "/" + model.id;
        }
        */
        if (model.ctx) obj.ctx = model.ctx;
        return obj;
    };
     
    /*
     * Create an event listener for server push. The server notifies
     * the client upon success of CRUD operation.
     */
    var eventSignature = function (operation, cast) {
        var signature = operation + ':' + cast.url;
        if (cast.ctx) signature += (':' + cast.ctx);
        return signature;
    };

     
    // Save a new model to the server.
    var create = function () {  
        var cast = modelCast(model); 
        var signature = eventSignature('create', cast);

        socket.once(signature, function (data) {
            if (data.error) {
                console.error("Error with sync.create", data.error);
                return;
            }
            options.success(data.response);
        });                           

        socket.emit('create', {'cast' : cast, item : model.attributes }); 
    };              
 
    // Get a collection or model from the server.
    var read = function () {
        var cast = modelCast(model); 
        var signature = eventSignature('read', cast);

        socket.once(signature, function (data) {
            if (model.syncRequests[method] != callID) {
                console.info("Call is outdated, ignoring:", method, model.cid);
                return;
            }
            if (data.error) {
                console.error("Error with sync.read", data.error);
                options.success();
                return;
            }
            options.success(data.response); // updates collection, model; fetch                      
        });   
        socket.emit('read', {'cast' : cast});  
    }; 
     
    // Save an existing model to the server.
    var update = function () {
        var cast = modelCast(model); 
        var signature = eventSignature('update', cast);

        socket.emit('update', {'cast' : cast, item : model.attributes }); // model.attribues is the model data
        //console.info("emitted!", {'cast' : cast, item : model.attributes });
        socket.once(signature, function (data) { 
            if (model.syncRequests[method] != callID) {
                console.info("Call is outdated, ignoring", method, model);
                return;
            }
            if (data.error) {
                console.error("Error with sync.update", data.error);
                return;
            }
            options.success(data.response);
        });
    };  

    // Patch an existing model on the server.
    var patch = function () {
        var cast = modelCast(model); 
        var e = eventSignature('patch', cast);
        socket.emit('patch', {'cast' : cast, 'changed' : options.attrs});
        socket.once(e, function (data) { 
            console.log("patch response", data);
            options.success(data);
        });
    };  
     
    // Delete a model on the server.
    var destroy = function () {
        var cast = modelCast(model); 
        var e = eventSignature('delete', cast);
        socket.emit('delete', {'cast' : cast, item : model.attributes }); // model.attribues is the model data
        socket.once(e, function (data) { 
            options.success(data);
        });                           
    };             
       
    // entry point for method
    switch (method) {
        case 'create':
            create();
            break;        
        case 'read':  
            read(); 
            break;  
        case 'update':
            update();
            break;
        case 'patch':
            patch();
            break;
        case 'delete':
            destroy();
            break; 
    }        
};
