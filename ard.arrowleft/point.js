Point = function(x, y, width, height, color) {

	this.x = x;
	this.y = y;
	this.width = width || 10;
	this.height = height || 10;
	this.angle = 0;

	this.color = color || "#ccc";

	this.forces = [];

	this.followed = false;

}

Point.prototype.update = function(dt) {

	for (var i = 0; i < this.forces.length; i++) {
		this.forces[i].update( dt );
		this.forces[i].applyTo( this, dt );

		if ( this.forces[i].isFinished() ) {
			this.forces.splice( i, 1 );
		}
	}

}

Point.prototype.addForce = function(force) {

	this.forces.push(force);

}
Point.prototype.render = function(context) {

	context.save();
	context.fillStyle = this.color;
	
	context.translate( this.x, this.y );
	context.rotate( this.angle );

	context.fillRect( 0, 0, this.width, this.height );
	
	if (this.followed) {
		context.strokeStyle = "blue";
	} else {
		context.strokeStyle = "black";
	}

	context.strokeRect( 0, 0, this.width, this.height);


	context.restore();

}