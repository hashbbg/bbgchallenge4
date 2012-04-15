/*global document, window */
/**
 * A happy namespace for all game engine stuffs.
 * @namespace
 * @augments a2d.Events
 * */
 var a2d = {
    /** @private */
    a2dCanvas: null,
    a2dRoot: null,
    a2dOffset: null,
    resources: [],
    loaded: false,
    offset: {
        X: 0, 
        Y: 0
    },
    /**
     * Load resources.
     * @param {object} loadData A key->value collection where key is the name of the resource, and value the path.
     */
    load: function (loadData) {
        var name;
        for (name in loadData) {
            if(loadData.hasOwnProperty(name)) {
                if (loadData[name].match(/png$|jpg$|jpeg$|gif$|bmp$/i)) {
                    this.resources[name] = new Image();
                } else {
                    this.resources[name] = new Audio();
                }
                this.resources[name].onload = this.progress;
                this.resources[name].onreadystatechange = function() { console.log("ReadyState"); this.progress(); };
                this.resources[name].src = loadData[name];
            }
        }
        this.progress();
    },
    /** @private */
    progress: function () {
        var name,
            total = 0,
            c = 0;
        if(!a2d.loaded) {
            for (name in a2d.resources) {
                if(a2d.resources.hasOwnProperty(name)) {
                    if((a2d.resources[name].width && a2d.resources[name].width > 0) || (a2d.resources[name].canPlayType)) {
                        c++;
                    } else {
                        console.log(a2d.resources[name].readyState);
                    }
                    total++;
                }
            }
            if(c == total) {
                a2d.loaded = true;
                a2d.fireEvent("load");
            } else {
                a2d.fireEvent("progress", { loaded : c, total: total });
            }
        }
    },
    /**
     * Get or set the canvas.
     * Assigning a string to this property will attempt to find the canvas with the given string as an ID.
     * If no canvas is set, an attempt is made to "auto-detect" a canvas in the DOM. If not found, one will be
     * created and added to the DOM.
     * @property {HTMLCanvasElement} canvas
     * @name a2d#canvas
     */
    get canvas() {
        if(!this.a2dCanvas){
            console.log("acquire canvas");
            this.a2dCanvas = document.getElementsByTagName("canvas")[0];
            //this is only the initial setup of the canvas element and its events
            if(!this.a2dCanvas) {
                this.a2dCanvas = document.createElement("canvas");
                document.body.appendChild(this.a2dCanvas);
                var windowSize = new a2d.Dimension(window.innerWidth, window.innerHeight);
                this.setSize(windowSize);
                a2d.mousePosition = new a2d.Position(0, 0);
                this.a2dCanvas.addEventListener("mousemove", function(e) {
                    var x = event.clientX + a2d.canvas.offsetLeft;
                    var y = event.clientY + a2d.canvas.offsetTop;
                    a2d.mousePosition = new a2d.Position(x, y);
                    a2d.mousePosition.subtract(a2d.offset);
                });
                this.a2dCanvas.addEventListener("mousedown", function(e) {
                    var clickedNode = a2d.root.findNodeAt(a2d.mousePosition);
                    if(clickedNode) {
                        clickedNode.fireEvent.call(clickedNode, "mousedown");
                    }
                });
                this.a2dCanvas.addEventListener("mouseup", function(e) {
                    var clickedNode = a2d.root.findNodeAt(a2d.mousePosition);
                    if(clickedNode) {
                        clickedNode.fireEvent.call(clickedNode, "mouseup");
                        clickedNode.fireEvent.call(clickedNode, "click");
                    }
                });
            }
            this.dimension = new a2d.Dimension(this.a2dCanvas.width, this.a2dCanvas.height);
            this.context = this.a2dCanvas.getContext("2d");
            
        }
        return this.a2dCanvas;
    },
    set canvas(canvasID){
        this.a2dCanvas = document.getElementById(canvasID);
    },
    /**
     * The root sceneNode. Attach nodes you want displayed to this.
     * @property {a2d.SceneNode} the root scene node.
     * @name a2d#root
     */
    get root() {
        if(!this.a2dRoot){
            console.log("acquire root node");
            this.a2dRoot = new a2d.SceneNode();
            this.frame();
        }
        return this.a2dRoot;
    },
    set root(node) {
        this.a2dRoot = node;
    },
    /** @private */
    frame : function () {
        //window.mozRequestAnimationFrame(a2d.frame);
        a2d.requestFrame.call(window, a2d.frame);        
        a2d.root.draw();
        a2d.fireEvent("draw");
    },
    /** @orivate */
    requestFrame: (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    }()),
    setSize: function (dimension) {
        if(this.canvas){
        console.log("set size: " + dimension.Width + ", " + dimension.Height);
        this.canvas.setAttribute("width", dimension.Width);
        this.canvas.setAttribute("height", dimension.Height);
        this.dimension = dimension;
        }
    },
    /**
     * named keys
     * @namespace
     */
    key: {
        /**#@+
         * @constant
         */
        BACKSPACE:8,
        TAB:9,
        ENTER:13,
        SHIFT:16,
        CTRL:17,
        ALT:18,
        PAUSE:19,
        CAPS_LOCK:20,
        ESC:27,
        SPACE:32,
        PAGEUP:33,
        PAGEDOWN:34,
        END:35,
        HOME:36,
        ARROW_LEFT:37,
        ARROW_UP:38,
        ARROW_RIGHT:39,
        ARROW_DOWN:40,
        INSERT:45,
        DELETE:46,
        F1:112,
        F2:113,
        F3:114,
        F4:115,
        F5:116,
        F6:117,
        F7:118,
        F8:119,
        F9:120,
        F10:121,
        F11:122,
        F12:123,
        NUM_LOCK:144,
        SCROLL_LOCK:145
        /**#@-*/
    }
};
/**
 * fired when a frame is drawn.
 * @event
 * @name a2d#draw
 */

/**
 * fired when all resources have been loaded.
 * @event
 * @name a2d#load
 */

/**
 * fired when progress is made loading resources.
 * @event
 * @name a2d#progress
 * @param {object} eventObject
 * @param {number} eventObject.loaded the number of resources loaded
 * @param {number} eventObject.total the total number of resources
 */

