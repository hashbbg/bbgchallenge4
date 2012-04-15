
var scene = {

	canvas: null,
	context: null,
	width: 0,
	height: 0,
	camera: null,

	actors: [],

	init: function(canvas, context, camera, additionalContext) {
		this.canvas = canvas;
		this.context = context || canvas.getContext("2d");
		this.additionalContext = additionalContext;
		this.width = canvas.width;
		this.height = canvas.height;
		this.camera = camera;
	},

	addActor: function(actor) {
		this.actors.push(actor);
	},

	update: function(dt) {

		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].update(dt);
			if (this.actors[i].collider) {
				var coll = checkPixelCollision( this.actors[i].noseX, this.actors[i].noseY, this.additionalContext );

				if (coll == "crash") {
					game.end();					
				} else if (coll == "start" && game.waypointChecked) {
					game.newLap()
				} else if (coll == "waypoint") {
					game.waypoint()
				}
			}
		}

		if (this.camera) this.camera.update(dt);

	},

	render: function() {

		this.context.clearRect( 0, 0, this.width, this.height );

		var tPoint, rotation;

		if (this.camera) {
			tPoint = this.camera.getTranslationPoint();
			rotation = this.camera.getRotationAngle();
			this.context.translate( tPoint[0], tPoint[1] );
			this.context.rotate( -rotation );			
		}

		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].render( this.context, this.additionalContext );
		}

		if (this.camera) {
			this.context.rotate( rotation );
			this.context.translate( -tPoint[0], -tPoint[1] );
		}

	}

}