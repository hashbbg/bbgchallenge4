/*global a2d, a2d */
/** 
 *  a2d.TileGridNode
 *  @constructor
 *  @augments a2d.SceneNode
 *  @param {object} data data, possibly loaded as JSON from some source or other
 * */
a2d.TileGridNode = function (data) {
    'use strict';
    a2d.SceneNode.apply(this);
    var self = this,
        $draw = this.draw.bind(this),
        $fireEvent = this.fireEvent.bind(this),
        tiles = [],
        tileSize = new a2d.Dimension(0, 0),
        gridSize = new a2d.Dimension(0, 0),
        lastOffset = null,
        canvasCache = document.createElement("canvas"),
        canvasDraw = a2d.canvas;
    canvasCache.width = a2d.dimension.Width;
    canvasCache.height = a2d.dimension.Height;
    this.boundingBox = new a2d.Rectangle(new a2d.Position(0, 0), new a2d.Position(a2d.dimension.Width, a2d.dimension.Height));
    this.setData = function (data) {
        var x, y, tileCount = 0;
        gridSize = new a2d.Dimension(data.gridSize[0], data.gridSize[1]);
        tileSize = new a2d.Dimension(data.tileSize[0], data.tileSize[1]);
        for(x = 0; x < gridSize.Width; x++) {
            if (!tiles[x]) { 
                tiles[x] = [];
            }
            for(y = 0; y < gridSize.Height; y++) { 
                tiles[x][y] = new a2d.AnimatedTileNode(a2d.resources[data.tileSet]);
                tiles[x][y].tileSize = tileSize;
                tiles[x][y].setTile(data.tiles[tileCount]);
                if(data.tiles[tileCount] !== -1) {
                   tiles[x][y].edit = true;
                }
                tiles[x][y].position = new a2d.Position(x * tileSize.Width + (tileSize.Width / 2), y * tileSize.Height + (tileSize.Height / 2));
                tileCount++;
            }
        }
    };
    /**
     * Hijack the fireEvent method to add a little tile-related information to each click event
     */
    this.fireEvent = function(eventName, eventObject) {
        //console.log("delegate firing: " + eventName);
        if(eventName === "click") {
            if(!eventObject) {
                eventObject = {};
            }
            eventObject.tile = self.getTile(a2d.mousePosition);
            eventObject.tileType = tiles[eventObject.tile.X][eventObject.tile.Y].tile;
        }
        $fireEvent(eventName, eventObject);
    }
    /**
     * @returns {number} grid width
     */
    this.getWidth = function () {
        return gridSize.Width;
    };
    /**
     * @returns {number} grid height
     */    
    this.getHeight = function () {
        return gridSize.Height;
    };
    /**
     * @returns {a2d.Position} tile position from pixel position
     * @param {a2d.Position} pos pixel position
     */    
    this.getTile = function (pixelPosition) {
        return (new a2d.Position(Math.floor(pixelPosition.X / tileSize.Width), Math.floor(pixelPosition.Y / tileSize.Height)));
    };
    this.getTileAt = function (pixelPosition) {
        var tPos = self.getTile(pixelPosition);
        return tiles[tPos.X][tPos.Y];
    };
     /**
     * @returns {a2d.Position} pixel position from tile position
     * @param {a2d.Position} pos tile position
     */ 
    this.toPix = function(pos) {
        return new a2d.Position(pos.X * tileSize.Width + parseInt(tileSize.Width / 2, 10), pos.Y * tileSize.Height + parseInt(tileSize.Height / 2, 10));  
    };
    /** 
     * @returns {Array} array of tiles
     */
    this.getTiles = function () {
        return tiles;
    };
    this.draw = function () {
        var x, y,
            fromTile,
            toTile;
        if (this.visible) {
            if(!lastOffset || lastOffset.not(a2d.offset)) {
                fromTile = this.getTile(a2d.offset);
                fromTile.add(new a2d.Position(1, 1)); //correction for top/left tiles
                fromTile.scale(new a2d.Position(-1, -1));
                toTile = new a2d.Position((fromTile.X + Math.floor(a2d.dimension.Width / tileSize.Width) + 1) + 1,
                (fromTile.Y + Math.floor(a2d.dimension.Height / tileSize.Height) + 1) + 1);
                if(toTile.X > gridSize.Width){ toTile.X = gridSize.Width; }
                if(toTile.Y > gridSize.Height){ toTile.Y = gridSize.Height; }
                if(fromTile.X < 0){ fromTile.X = 0; }
                if(fromTile.Y < 0){ fromTile.Y = 0; }
                for(x = fromTile.X; x < toTile.X; x++){
                    for(y = fromTile.Y; y < toTile.Y; y++){
                        if(tiles[x][y].tile !== -1) {
                            tiles[x][y].draw(canvasCache); 
                        }
                    }
                } 
                lastOffset = new a2d.Position(a2d.offset.X, a2d.offset.Y);
            }
            a2d.context.drawImage(canvasCache, 0, 0);    
        } 
        $draw();
    };
    //if data is supplied in the constructor, use it.
    if(data) {
        this.setData(data);
    }
};