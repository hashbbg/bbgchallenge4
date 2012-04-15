Player = function(x, y) {
	this.x = x;
	this.y = y;
	this.angle = 0;
	this.velX = 0;
	this.velY = 0;
	this.speed = 40;
	this.color = "#333";
	this.width = 20;
	this.height = 4;
	this.noseX = 0;
	this.noseY = 0;
	this.collider = true;
}

Player.prototype.initTrail = function(trackContext) {

	trackContext.moveTo(this.x, this.y);
	trackContext.strokeStyle = "#ccc";
	trackContext.lineWidth = 0.3;
	trackContext.lineCap = "round";
	trackContext.beginPath();

	return this;
}

Player.prototype.update = function(dt) {

  this.speed = this.speed + this.speed * 0.6 * dt;

  this.speed = clamp(this.speed, 40, 260);

  this.velX = Math.cos(this.angle) * this.speed;
  this.velY = Math.sin(this.angle) * this.speed;

  this.x = this.x + this.velX * dt;
  this.y = this.y + this.velY * dt;

  this.noseX = this.x + Math.cos(this.angle) * this.width/3;
  this.noseY = this.y + Math.sin(this.angle) * this.height/3;


}

Player.prototype.render = function(context, trackContext) {

	context.save();

	context.translate( this.x, this.y );
	context.rotate( this.angle );

	context.fillStyle = this.color;
	context.fillRect( -this.width/2 - this.speed / 260, -this.height/2, this.width/2, this.height );

	context.restore();

	// nose
	context.save();

	context.fillStyle = "black";
	context.strokeStyle = "red";

	
	context.lineWidth = 5;
	context.lineJoin = "butt";
	context.beginPath();
	context.moveTo(this.x, this.y);
	context.lineTo( this.noseX, this.noseY);

	context.translate( this.noseX, this.noseY );

	// context.rotate( this.angle*5 );
	context.stroke();

	context.arc(0, 0, 2, 0, Math.PI*2, false);
	context.fill();

	context.restore();

	trackContext.lineTo( this.x, this.y );
	trackContext.stroke();
	trackContext.beginPath();
	trackContext.moveTo( this.x, this.y );

}

Player.prototype.turn = function() {
	this.angle = this.angle + 0.1;
	this.speed = this.speed - this.speed / 9;
}