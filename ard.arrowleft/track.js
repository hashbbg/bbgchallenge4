function Track(centerX, centerY, radius, width) {

	this.centerX = centerX;
	this.centerY = centerY;
	this.radius = radius;
	this.width = width;
	
}

Track.prototype.update = function() {};

Track.prototype.render = function(context) {

	context.fillStyle = "darkgreen";

	context.fillRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = "black";

	context.lineWidth = 10;

	context.fillStyle = "#737462";

	context.save();
	context.translate( this.centerX, this.centerY );
	context.scale(2, 1);
	context.beginPath();
	context.arc(0, 0, 
			this.radius, 0, Math.PI*2, false);
	context.stroke();
	context.fill();
	context.closePath();

	context.fillStyle = "brown";

	context.scale( .7, .5);
	context.beginPath();
	context.arc(0, 0, 
			this.radius, 0, Math.PI*2, false);
	context.stroke();
	context.fill();
	context.closePath();

	context.restore();

	context.save();
	context.translate( this.centerX, 0 );
	context.fillStyle = "#ddd";
	context.fillRect( 3, 0, 20, 117);
	context.restore();

	context.save();
	context.translate( this.centerX, canvas.height );
	context.fillStyle = "#737461";
	context.fillRect( 3, 0, 20, -117);
	context.restore();

	context.save();
	context.font = "italic 60px monospace";
	context.translate( this.centerX - 200, this.centerY - 50 );
	context.fillStyle = "black";
	context.fillText( " speedway! ", 0, 0);

	context.translate( 6, 0 );
	context.fillStyle = "#d1d1d1";
	context.fillText( " speedway! ", 0, 0);

	context.translate( 6, 0 );
	context.fillStyle = "white";
	context.fillText( " speedway! ", 0, 0);

	context.restore();

}

Track.prototype.renderFastestLap = function(context, lapTime) {

	context.save();
	context.font = "20px monospace";
	context.translate( this.centerX - 100, this.centerY + 40 );
	context.fillStyle = "brown";
	context.strokeStyle = "black";
	context.fillRect( 0, -20, 250, 40);
	// context.strokeRect(0, -20, 200, 40);
	context.fillStyle = "white";
	context.fillText( "fastest lap: " + lapTime, 0, 0 );
	context.restore();

}

Track.prototype.renderLastLap = function(context, lapTime) {

	context.save();
	context.font = "20px monospace";
	context.translate( this.centerX - 100, this.centerY + 80 );
	context.fillStyle = "brown";
	context.strokeStyle = "black";
	context.fillRect( 0, -20, 250, 40);
	// context.strokeRect(0, -20, 200, 40);
	context.fillStyle = "white";
	context.fillText( "last lap: " + lapTime, 0, 0 );
	context.restore();
}
