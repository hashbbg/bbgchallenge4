/*global a2d */

/** 
 *  Vector
 *  @class
 *  @param {number} x X
 *  @param {number} y Y
 * */
a2d.Vector = function (x, y) {
    'use strict';
    /** the X value */
	this.X = x;
    /** the Y value */
	this.Y = y;
	/**
	 * Returns a Vector object with the same values.
	 * @returns {a2d.Vector} a clone of this Vector object
	 */
	this.clone = function() {
		return new a2d.Vector(this.X, this.Y);
	};
};

/** 
 *  Position
 *  @class
 *  @augments a2d.Vector
 *  @param {number} x Horizontal coordinate
 *  @param {number} y Vertical coordinate
 * */
a2d.Position = function (x, y) {
    'use strict';
    a2d.Vector.apply(this, [x, y]);
	/**
	 * Scales coordinates.
	 * @param {a2d.Position} _scale X and Y scale
	 * @public
	 */
	this.scale = function (scale) {
        if(scale.Width) {
            this.X = Math.floor(this.X * scale.Width);
            this.Y = Math.floor(this.Y * scale.Height);            
        } else {
            this.X = Math.floor(this.X * scale.X);
            this.Y = Math.floor(this.Y * scale.Y);
        }
	};
	/**
	 * Adds coordinates.
	 * @param {a2d.Position} diff Other position
	 * @public
	 */
	this.add = function (diff) {
		this.X += diff.X;
		this.Y += diff.Y;
	};
	/**
	 * Subtracts coordinates.
	 * @param {a2d.Position} diff other position
	 * @deprecated In favor of a2d.Position#subtract
     * @see a2d.Position#subtract
	 */
    this.substract = function (diff) {
        this.subtract(diff);
    };
	/**
	 * Subtracts other position from this one
	 * @param {a2d.Position} diff other position
	 */    
	this.subtract = function (diff) {
		this.X -= diff.X;
		this.Y -= diff.Y;
	};
	/**
	 * Divides this position by another
	 * @param {a2d.Position} diff other position
	 */        
    this.divide = function (diff) {
        this.X = Math.floor(this.X / diff.X);
        this.Y = Math.floor(this.Y / diff.Y);
    };
	/**
	 * Checks if this position is inside a given rectangle.
	 * @param {a2d.Rectangle} rectangle Rectangle to check against.
	 */
	this.isInside = function (rectangle) {
		if (this.X > rectangle.topLeft.X && this.X < rectangle.bottomRight.X &&
                this.Y > rectangle.topLeft.Y && this.Y < rectangle.bottomRight.Y) {
            return true;
		}
		return false;
	};
    /** 
     * Checks if two positions are equal
     * @param {a2d.Position} position2 The other position
     * @returns {boolean} true if the positions are the same
     */
	this.is = function (position2) {
		return (this.X === position2.X && this.Y === position2.Y);
	};
    /** 
     * Checks if two positions are not equal
     * @param {a2d.Position} position2 The other position
     * @returns {boolean} true if the positions are not the same
     */    
	this.not = function (position2) {
		return (this.X !== position2.X || this.Y !== position2.Y);
	};
    /**
     * Get the distance between two points
     * @param {a2d.Position} position2 The other position
     * @returns {number} The distance between the two points
     */
	this.distanceTo = function (position2) {
		var xdiff = Math.abs(this.X - position2.X),
            ydiff = Math.abs(this.Y - position2.Y);
		return Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
	};
	/**
	 * Returns a Position object with the same coordinates
	 * @returns {a2d.Position} a clone of this Position object
	 */
	this.clone = function() {
		return new a2d.Position(this.X, this.Y);
	};

};

/** 
 *  Rectangle
 *  @class
 *  @param {a2d.Position} topLeft top left coordinates
 *  @param {a2d.Position} bottomRight bottom right coordinates
 * */
a2d.Rectangle = function (topLeft, bottomRight) {
    'use strict';
    /** @type a2d.Position */
	this.topLeft = topLeft;
    /** @type a2d.Position */
	this.bottomRight = bottomRight;
    /** @type a2d.Position */
	this.topRight = new a2d.Position(bottomRight.X, topLeft.Y);
    /** @type a2d.Position */
	this.bottomLeft = new a2d.Position(topLeft.X, bottomRight.Y);
    /**
     * Moves a rectangle by a position
     * @param {a2d.Position} pos The position to move by
     */
	this.add = function (pos) {
		this.topLeft.add(pos);
		this.topRight.add(pos);
		this.bottomLeft.add(pos);
		this.bottomRight.add(pos);
	};
	/**
	 * Checks if this rectangle overlaps another.
	 * @param {a2d.Rectangle} other Another rectangle to check against
     * @returns {boolean} true if the rectangles overlap.
	 */
	this.overlaps = function (other) {
		return (other.topLeft.isInside(this) ||
                other.bottomRight.isInside(this) ||
                other.topRight.isInside(this) ||
                other.bottomLeft.isInside(this));
	};
};

/** 
 *  Dimension
 *  @class
 *  @param {number} width Width
 *  @param {number} height Height
 * */
a2d.Dimension = function (width, height) {
    'use strict';
    /** @type number */
	this.Width = width;
    /** @type number */
	this.Height = height;
    /**
     * Effectively multiplies this Dimension by a position or vector
     * @param {a2d.Position|a2d.Vector} scale The scale to apply
     */
	this.scale = function (scale) {
		this.Width = Math.floor(this.Width * scale.X);
		this.Height = Math.floor(this.Height * scale.Y);
	};    
};

