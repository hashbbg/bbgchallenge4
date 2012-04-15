
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
};

function checkPixelCollision(x, y, bitmap) {
	var p = tctx.getImageData(x, y, 1, 1).data;

	var collides = false;

	if ( p[0] == 0 && p[1] == 0 && p[2] == 0) {
		collides = "crash";
	} else if ( p[0] == 221 && p[1] == 221 && p[2] == 221) {
		collides = "start";
	} else if ( p[0] == 115 && p[1] == 116 && p[2] == 97) {
		collides = "waypoint";
	}

	return collides;
}

function showBoom() {

	document.querySelector("#boom").className = "visible";
}

function millisToHuman(millis) {
	return typeof millis == "number" ?
			millis / 1000 : "?";
}

function clamp(val, min, max) {
	if (val > max) {
		val = max;
	} else if (val < min) val = min;
	return val;
}

var lapStartTime;
var fastestLap = Infinity;

var game = {

	end: function() {
		timer.stop();
		showBoom();
	},

	waypointChecked: true,

	newLap: function() {

		var currentTime = Date.now();
		var lastLap;

		if (lapStartTime) {
			lastLap = currentTime - lapStartTime;
		} else {
			lastLap = "?";
		}

		lapStartTime = Date.now();

		var humanLastLap = millisToHuman( lastLap );

		// document.querySelector("#last").innerHTML = humanLastLap;
		track1.renderLastLap( tctx, humanLastLap );

		if (lastLap < fastestLap) {
			fastestLap = lastLap;
			// document.querySelector("#fastest").innerHTML = millisToHuman(fastestLap);
			track1.renderFastestLap( tctx, humanLastLap );
		}

		this.waypointChecked = false;
	},

	waypoint: function() {
		this.waypointChecked = true;
	}

}

var canvas = document.querySelector("#screen");
var ctx = canvas.getContext("2d");

var trackCanvas = document.querySelector("#track");
var tctx = trackCanvas.getContext("2d");

// var camera = new Camera(scene);

scene.init( canvas, ctx, null, tctx );

var timer = new Timer(scene);

var track1 = new Track( canvas.width/2, canvas.height/2,
						canvas.height/2, 50);

track1.render( tctx );

var p = new Player( canvas.width/2, 40).initTrail( tctx );

scene.addActor( p );

var avoidRadius = 25;

document.addEventListener("keydown", function(e) {

	if (e.keyCode == 37) {
		p.turn();
	}

})

var particleEmitter = {
	particles: [],
	counter: 0,

	update: function(dt) {

		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].update(dt);
			if ( this.particles[i].isFinished() ) {
				this.particles.splice( i, 1 );
			}
		}

		var newParticlesCount;
		
		if ( this.counter++ % 10 == 1 ) {
			newParticlesCount = p.speed / 30;
			for (var i = 0; i < newParticlesCount; i++) {
				var pt = new Particle( p.x, p.y, 
										-p.velX * Math.random(), 
										-p.velY * Math.random());
				this.particles.push( pt );
			}

		}

	},

	render: function() {
		ctx.globalCompositeOperation = "lighter";
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].render( ctx );
		}
		ctx.globalCompositeOperation = "source-over";
	}

}

scene.addActor( particleEmitter );

// canvas.addEventListener("mousemove", function(event) {

// 	var targets = [];
// 	var translationPoint = camera.getTranslationPoint();

// 	// TODO: get right coords from camera transform matrix
// 	// (switch camera to use transform matrix)

// 	var x = event.clientX;
// 	var y = event.clientY;

// 	for (var i = 0; i < scene.actors.length; i++) {

// 		var t = scene.actors[i];

// 		var d = Math.sqrt( (x-t.x)*(x-t.x) + (y-t.y)*(y-t.y) );

// 		var f;

// 		if (d < avoidRadius) {

// 			f = new Force(  x - t.x,
// 						    y - t.y, 
// 						   Math.random() * 100 );

// 			t.addForce( f );

// 		}


// 	}

// })