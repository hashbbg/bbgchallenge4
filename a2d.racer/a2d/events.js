/*global a2d */
/**
 * Anything that fires events inherits from this.
 * @class
 */
a2d.Events = function() {
    "use strict";
	var self = this,
		eventList = {};
    /**
     * Check if this event is known to this event emitter.
     * @param {string} eventName
     */
    this.hasEvent = function(eventName) {
        if(eventList[eventName]) {
            return true;
        }
        return false;
    };
    /**
     * Adds an event handler for given event.
     * @param {string} eventName the name of the event
     * @param {Function} callback the event handler to call when the event is fired
     */
    this.addEventListener = function(eventName, callback) {
        if(!eventList[eventName]) {
            eventList[eventName] = [];
        }
        eventList[eventName].push(callback);
    };
    
	/** 
     * Alias for fireEvent
     * @param {string} eventName The name of the event to fire
     * @param {object} [eventObject] An object to pass along to the receiving function
     */
	this.emit = function(eventName, eventObject) {
		this.fireEvent(eventName, eventObject);
	};
	
    /** 
     * Alias for addEventListener
     * @param {string} eventName the name of the event
     * @param {Function} callback the event handler to call when the event is fired
     */
    this.on = function(eventName, callback) {        
        this.addEventListener(eventName, callback);
    };
    
    /**
     * Fires given event and passes it an object if applicable
     * @param {string} eventName The name of the event to fire
     * @param {object} [eventObject] An object to pass along to the receiving function
     */
    this.fireEvent = function(eventName, eventObject) {
        var i,
			eventFunction = "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);		
        if(eventList[eventName]) {
            for(i = 0; i < eventList[eventName].length; i++) {
                eventList[eventName][i](eventObject);
            }			
        }
		if(self[eventFunction]) {
			self[eventFunction](eventObject);
		}

    };
    /**
     * Removes an event handler from the list for a given event
     * @param {string} eventName the name of the event
     * @param {Function} callback the callback to remove from the list
     */
    this.removeEventListener = function(eventName, callback) {
        var idx = -1;
        if(eventList[eventName]) {
            idx = eventList[eventName].indexOf(callback);
            if(idx != -1) {
                eventList[eventName].splice(idx, 1);
            }
        }
    };
};

a2d.Events.apply(a2d);