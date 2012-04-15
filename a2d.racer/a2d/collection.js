/*global a2d */
/**
 * @class 
 * Implements an array-like collection
 */
a2d.Collection = function() {
    /**
     * length of the collection
     */
	this.length = 0;

    /**
     * Add an item to the end of the collection
     * @param {any} item item to be added
     */
	this.push = function(item) {
        if(typeof(item) === "object") {
            item.parent = this;
        }
		this[this.length] = item;        
		this.length += 1;
	};
    
	/**
     * Remove item from the end of the collection
     * and return it.
     * @returns {any} the removed item     
     */
	this.pop = function() {
		this.length -= 1;
		return this[this.length];
	};
    
	/**
     * Remove item at given index
     * @param {number} idx Index of the item to be removed
     * @returns {any} the removed item     
     */
	this.remove = function(idx) {
		var item = this[idx],
			i;
        delete this[idx];
		for(i = idx + 1; i < this.length; i++) {
			this[i - 1] = this[i];
		}
		this.length -= 1;
		return item;
	};
	
    /**
     * Remove the first item from the collection and return it.
     * @returns {any} the removed item
     */
	this.shift = function() {
		return this.remove(0);
	};

    /**
     * Add an item to the beginning of this collection
     * @param {any} item The item to be added;
     * @returns the new length of the collection
     */
	this.unshift = function(item) {
		for(i = 0; i < this.length; i++) {
			this[i + 1] = this[i];
		}
		this[0] = item;
		this.length += 1;
		return this.length;
	};
	/**
     * Get the index of the given item in the collection
     * @param {any} item The item to look up
     * @returns {number} the index
     */
	this.indexOf = function(item) {
		var i;
		for(i = 0; i < this.length; i++){
			if(this[i] == item) {
				return i;
			}
		}
		return -1;
	};
	/**
     * Append the contents of another collection to this one.
     * @param {a2d.Collection} other Other collection
     */
	this.append = function(other) {
		var i;
		for(i = 0; i < other.length; i++) {
			this.push(other[i]);
		}	
	};
};