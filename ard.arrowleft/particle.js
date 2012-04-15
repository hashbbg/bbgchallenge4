var Particle = function(x, y, velX, velY, speed) {
	
	this.x = x;
	this.y = y;
	this.velX = velX;
	this.velY = velY;
	this.speed = speed || 1;
	this.slowDown = 10;

	this.duration = 6;
}

Particle.prototype.update = function(dt) {

	this.speed = this.speed - this.slowDown * dt;

	this.velX = this.velX + this.speed * dt;
	this.velY = this.velY + this.speed * dt;

	this.x = this.x + this.velX * dt;
	this.y = this.y + this.velY * dt;

	this.duration--;

}

Particle.prototype.render = function(context) {

	context.save();
	context.translate( this.x, this.y );
	context.fillStyle = "orange";
	context.fillRect( -1, -1, 2, 2);
	context.restore();

}

Particle.prototype.isFinished = function() {
	return this.duration < 0;
}
