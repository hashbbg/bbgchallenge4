/**
 * ~ Blazing Race ~
 * Apache Licence 2.0
 * Gaëtan Renaudeau <renaudeau.gaetan@gmail.com>
 * 2012
 */
$(function(){
  var b2Vec2 = Box2D.Common.Math.b2Vec2
  , b2AABB = Box2D.Collision.b2AABB
  , b2Math = Box2D.Common.Math.b2Math
  ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
  ,	b2Body = Box2D.Dynamics.b2Body
  ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
  ,	b2Fixture = Box2D.Dynamics.b2Fixture
  ,	b2World = Box2D.Dynamics.b2World
  ,	b2MassData = Box2D.Collision.Shapes.b2MassData
  ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
  ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
  ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
  , b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
  , b2ContactListener = Box2D.Dynamics.b2ContactListener
  ;

  var DRAW_SCALE = 30;

  DEBUG = false;

  function clamp (min, max, value) { return Math.max(min, Math.min(max, value)) }
  function smoothstep (min, max, value) { return Math.max(0, Math.min(1, (value-min)/(max-min))); }

  // Game Logic


  function GfxLoader (images, dir, ext) {
    var self = this;
    var count = 0;
    var onloaded = function () {};
    dir = dir || "";
    ext = ext || "";

    var resources = {};

    for (var i = 0; i<images.length; ++i) {
      var name = images[i];
      var imgSrc = dir+name+ext;
      var img = new Image();
      img.onload = function () {
        if (++count == images.length)
          onloaded();
      }
      img.src = imgSrc;
      resources[name] = img;
    }

    self.ready = function (callback) {
      if (count==images.length)
        callback();
      else
        onloaded = callback;
    }

    self.getResource = function (name) {
      return resources[name];
    }
  }

  function Camera (world, player, width, height) {
    var self = this;
    // non normalized position
    self.x = 0;
    self.y = 0;

    self.E = BlazingRace.util.makeEvent({});

    self.getRealPosition = function (p) {
      return new b2Vec2(
        (-self.x + p.x)/DRAW_SCALE,
        (-self.y + p.y)/DRAW_SCALE
      )
    }

    self.start = function () {
    }

    self.move = function () {
      var x, y;
      var v = player.body.GetPosition();
      if (world.width > width) {
        if (v.x*DRAW_SCALE < (world.width - width/2) && v.x*DRAW_SCALE > width/2) {
          x = -(v.x*DRAW_SCALE)+(width/2);
        }
        else if(v.x*DRAW_SCALE >= (world.width-width/2)) {
          x = width-world.width;
        }
        else {
          x = 0;
        }
        self.x = x;
      }
      if(world.height > height) {
				if(v.y*DRAW_SCALE < (world.height - height/2) && v.y*DRAW_SCALE > height/2) {
					y = -(v.y*DRAW_SCALE)+(height/2);
				}
				else if(v.y*DRAW_SCALE >= (world.height - height/2)) {
					y = (height - world.height);
				}
				else {
					y = 0;
				}
        self.y = y;
			}
    }

    world.E.sub("update", function (i) {
      self.move();
    });
  }

  function MouseControls (node) {
    var self = this;
    var position = { x: 0, y: 0 };
    self.E = BlazingRace.util.makeEvent({});

    function getCanvasPosition (e) {
      var o = node.offset();
      var x = e.clientX;
      var y = e.clientY;
      return { 
        x: x-(o.left-$(window).scrollLeft()), 
        y: y-(o.top-$(window).scrollTop())
      };
    }

    node.on("mousemove", function (e) {
      e.preventDefault();
      position = getCanvasPosition(e);
      self.E.pub("move", position);
    });
    node.on("mousedown", function (e) {
      e.preventDefault();
      position = getCanvasPosition(e);
      self.E.pub("down", position);
    });
    node.on("mouseup", function (e) {
      e.preventDefault();
      position = getCanvasPosition(e);
      self.E.pub("up", position);
    });

    self.start = function () {}
  }

  function World (map) {
    var self = this;
    self.map = map;
    self.width = map.width;
    self.height = map.height;
    self.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);

    self.grounds = [];
    self.waters = [];
    self.candles = [];

    self.E = BlazingRace.util.makeEvent({});

    var groundFixDef = new b2FixtureDef;
    groundFixDef.density = 1.0;
    groundFixDef.friction = 0.5;
    groundFixDef.restitution = 0.1;


    function initBounds (world, BORDER) {
      var fixDef = new b2FixtureDef;
      fixDef.density = groundFixDef.density;
      fixDef.friction = groundFixDef.friction;
      fixDef.restitution = groundFixDef.restitution;
      var bodyDef = new b2BodyDef;

      //create ground
      bodyDef.type = b2Body.b2_staticBody;
      fixDef.shape = new b2PolygonShape;
      fixDef.shape.SetAsBox(self.width / DRAW_SCALE, BORDER);

      bodyDef.position.Set(0, self.height / DRAW_SCALE);
      (body=world.CreateBody(bodyDef)).CreateFixture(fixDef);
      self.grounds.push(body);

      bodyDef.position.Set(0, 0);
      (body=world.CreateBody(bodyDef)).CreateFixture(fixDef);
      self.grounds.push(body);

      fixDef.shape.SetAsBox(BORDER, self.height / DRAW_SCALE);
      
      bodyDef.position.Set(0, 0);
      (body=world.CreateBody(bodyDef)).CreateFixture(fixDef);
      self.grounds.push(body);

      bodyDef.position.Set(self.width / DRAW_SCALE, 0);
      (body=world.CreateBody(bodyDef)).CreateFixture(fixDef);
      self.grounds.push(body);
    }

    function asArray (raw) {
      var arr = [];
      for (var j = 0; j<raw.length/2; ++j) {
        arr[j] = new b2Vec2((raw[2*j])/DRAW_SCALE, (raw[2*j+1])/DRAW_SCALE);
      }
      return arr;
    }

    function init (world) {
      initBounds(world, 20/DRAW_SCALE);
      var fixDef = new b2FixtureDef;
      fixDef.density = groundFixDef.density;
      fixDef.friction = groundFixDef.friction;
      fixDef.restitution = groundFixDef.restitution;
      fixDef.shape = new b2PolygonShape;
      var bodyDef = new b2BodyDef;
      bodyDef.type = b2Body.b2_staticBody;

      for (var type in map.objects) {
        var value = map.objects[type];
        if (type == "grounds") {
          for (var i = 0; i<value.length; ++i) {
            var arr = asArray(value[i]);
            fixDef.shape.SetAsArray(arr, arr.length);
            bodyDef.position.Set(0,0);
            var ground = world.CreateBody(bodyDef);
            ground.CreateFixture(fixDef);
            ground.SetUserData({ type: "ground" });
            self.grounds.push(ground);
          }
        }
        if (type == "candles") {
          for (var i = 0; i<value.length; ++i) {
            var raw = value[i];
            var x = raw[0], y = raw[1];
            fixDef.shape.SetAsBox(0.3, 0.3);
            bodyDef.position.Set(x/DRAW_SCALE, y/DRAW_SCALE);
            var body = world.CreateBody(bodyDef);
            body.SetUserData({ type: "candle" });
            body.CreateFixture(fixDef);
            self.candles.push(body);
          }
        }
        if (type == "waters") {
          for (var i = 0; i<value.length; ++i) {
            var arr = asArray(value[i]);
            fixDef.shape.SetAsArray(arr, arr.length);
            bodyDef.position.Set(0,0);
            var water = world.CreateBody(bodyDef);
            water.SetUserData({ type: "water" });
            water.CreateFixture(fixDef);
            self.waters.push(water);
          }
        }
      }
    }

    var i = 0;
    function update() {
      self.world.Step(1 / 60, 10, 10);

      self.E.pub("update", ++i);

      self.world.ClearForces();
    }

    self.createPlayerBody = function (size, x, y) {
      var bodyDef = new b2BodyDef;
      bodyDef.type = b2Body.b2_dynamicBody;
      bodyDef.position.x = x;
      bodyDef.position.y = y;
      bodyDef.angularDamping = 0.2;
      var player = self.world.CreateBody(bodyDef);
      var fixDef = new b2FixtureDef;
      fixDef.density = 1.0;
      fixDef.friction = 0.2;
      fixDef.restitution = 0.1;
      fixDef.shape = new b2CircleShape(size);
      player.CreateFixture(fixDef);
      player.SetUserData({ type: "player" });
      return player;
    }

    self.update = update;
    self.start = function () {
      init(self.world);
    }
  }

  function Player (world, _x, _y) {
    var self = this;
    self.size = 0.5;
    self.body = world.createPlayerBody(self.size, _x/DRAW_SCALE, _y/DRAW_SCALE);

    var POWER_FORCE = 15;
    var POWER_LOAD_SPEED = 4000;

    self.oxygen = 1;

    self.power = 1;
    var lastPowerUse = 0;
    var lastPowerUseRemaining = 0;

    world.E.sub("update", function (i) {
      var now = +new Date();
      if (self.power < 1) {
        self.power = clamp(0, 1, lastPowerUseRemaining+(now-lastPowerUse)/POWER_LOAD_SPEED);
      }
    });

    self.start = function () {
    }

    self.isDead = function () {
      return self.oxygen <= 0;
    }

    self.consumePower = function (intensity) {
      var powerUsage = self.power * intensity;
      self.power -= powerUsage;
      lastPowerUse = +new Date();
      lastPowerUseRemaining = self.power;
      return powerUsage * POWER_FORCE;
    }
  }

  function Game (world, player, camera, mouse) {
    var self = this;
    self.world = world;
    self.player = player;
    self.camera = camera;
    self.mouse = mouse;

    self.startTime = 0;
    self.candleCount = 0;

    mouse.E.sub("down", function (canvasPosition) {
      var click = camera.getRealPosition(canvasPosition);
      var position = player.body.GetPosition();
      var force = click.Copy();
      force.Subtract(position);
      var dist = force.Normalize();
      var intensity = smoothstep(0, 5, dist);
      var power = player.consumePower(intensity);

      force.Multiply(power);
      player.body.ApplyImpulse(force, position);
    });

    function start() {
      self.startTime = +new Date();
      var contactListener = new b2ContactListener;
      contactListener.BeginContact = function (contact) {
        var aData = contact.GetFixtureA().GetBody().GetUserData();
        var bData = contact.GetFixtureB().GetBody().GetUserData();
        if (aData && bData) {
          if (aData.type=="water" && bData.type=="player") {
            player.oxygen = 0;
          }
          else if (aData.type=="candle" && bData.type=="player") {
            if (player.oxygen && !aData.lighted) {
              aData.lighted = true;
              contact.GetFixtureA().GetBody().SetUserData(aData);
              ++ self.candleCount;
            }
          }
        }
      }
      self.world.world.SetContactListener(contactListener);
    }

    function won () {
      return self.candleCount >= world.map.candlesToWin;
    }

    self.checkGameState = function () {
      if (won())
        return 1;
      if (player.isDead())
        return -1;
      return 0;
    }

    self.start = function () {
      self.world.start();
      self.player.start();
      self.camera.start();
      self.mouse.start();
      start();
    }
  }

  // Game Render

  function GameRendering (game, node, loader) {

    var canvas = node.find("canvas.game")[0];
    var ctx = canvas.getContext("2d");

    var pe;

    function setup ()  {
      var debugDraw = new Box2D.Dynamics.b2DebugDraw();
      debugDraw.SetSprite(ctx);
      debugDraw.SetDrawScale(DRAW_SCALE);
			debugDraw.SetFillAlpha(0.5);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			game.world.world.SetDebugDraw(debugDraw);

      pe = new cParticleEmitter();
      pe.maxParticles = 250;
      pe.size = DRAW_SCALE*0.6;
      pe.sizeRandom = 10;
      pe.gravity = cParticleVector.create(-0.001, -0.02*DRAW_SCALE);
      pe.speed = 1;
      pe.speedRandom = 0.5;
      pe.sharpness = 20;
      pe.lifeSpan = 10;
      pe.lifeSpanRandom = 5;
      pe.position.x = -1000;
      pe.position.y = -1000;
		  pe.init();
    }

    var coal;

    function drawBackground () {
      ctx.fillStyle = 'rgb(100, 70, 50)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function fillPolygon (vertices) {
      var vertexCount = vertices.length;
      if (!vertexCount) return;
      var s = ctx;
      var drawScale = DRAW_SCALE;
      s.beginPath();
      s.moveTo(Math.floor(vertices[0].x * drawScale), Math.floor(vertices[0].y * drawScale));
      for (var i = 1; i < vertexCount; i++) {
         s.lineTo(
             Math.floor(vertices[i].x * drawScale), 
             Math.floor(vertices[i].y * drawScale)
         );
      }
      s.lineTo(
        Math.floor(vertices[0].x * drawScale), 
        Math.floor(vertices[0].y * drawScale)
      );
      s.closePath();
      s.fill();
   }

    function drawGround (ground) {
      var position = ground.GetPosition();
      for (var fixture = ground.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.save();
        var shape = fixture.GetShape();
        ctx.translate(position.x*DRAW_SCALE, position.y*DRAW_SCALE);
        fillPolygon(shape.GetVertices());
        ctx.restore();
      }
    }

    function drawWater (water) {
      var position = water.GetPosition();
      for (var fixture = water.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.save();
        var shape = fixture.GetShape();
        ctx.translate(position.x*DRAW_SCALE, position.y*DRAW_SCALE);
        fillPolygon(shape.GetVertices());
        ctx.restore();
      }
    }

    var candleOn, candleOff, CANDLE_W = 30, CANDLE_H = 30;

    function drawCandle (candle) {
      var position = candle.GetPosition();
      for (var fixture = candle.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
        ctx.save();
        var lighted = fixture.GetBody().GetUserData().lighted;
        ctx.translate(position.x*DRAW_SCALE, position.y*DRAW_SCALE);
        if (lighted) {
          ctx.fillStyle = 'rgb(255, 200, 150)';
          ctx.drawImage(candleOn, -CANDLE_W/2, -CANDLE_W/2-(CANDLE_H-CANDLE_W), CANDLE_W, CANDLE_H);
        }
        else {
          ctx.fillStyle = 'rgb(200, 170, 160)';
          ctx.drawImage(candleOff, -CANDLE_W/2, -CANDLE_W/2-(CANDLE_H-CANDLE_W), CANDLE_W, CANDLE_H);
        }
        ctx.restore();
      }
    }

    var lastEmit = 0;
    function drawPlayer (player) {
      if (player.isDead()) {
        pe.duration = 0;
      }
      var body = player.body;
      var p = body.GetPosition();
      ctx.save();
      ctx.translate(p.x*DRAW_SCALE, p.y*DRAW_SCALE);
      ctx.rotate(body.GetAngle());
      var playerBg = ctx.createPattern(coal, "repeat");
      ctx.fillStyle = playerBg;
      ctx.beginPath();
      ctx.arc(0, 0, player.size*DRAW_SCALE, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle="rgba(255, 100, 0, "+(Math.floor(player.oxygen*100*0.7+0.1)/100)+")";
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(0, 0, player.size*DRAW_SCALE, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      var now = +new Date();
      if (now >= lastEmit + 20) {
        pe.update(1);
        lastEmit = now;
      }
      pe.position.x = p.x*DRAW_SCALE - 11;
      pe.position.y = p.y*DRAW_SCALE - 8;
      pe.renderParticles(ctx);
      
      ctx.restore();
    }

    function render () {
      var world = game.world.world;
      ctx.save();
      drawBackground();

      ctx.translate(game.camera.x, game.camera.y);

      if (DEBUG) world.DrawDebugData();

      for (var i = 0; i < game.world.waters.length; ++i) {
        drawWater(game.world.waters[i]);
      }
      for (var i = 0; i < game.world.grounds.length; ++i) {
        drawGround(game.world.grounds[i]);
      }
      for (var i = 0; i < game.world.candles.length; ++i) {
        drawCandle(game.world.candles[i]);
      }
      drawPlayer(game.player);
      ctx.restore();
    }

    var lastSeconds, lastMinutes;
    var $seconds = node.find(".chrono .seconds");
    var $minutes = node.find(".chrono .minutes");
    var ended = false;
    function DOM_render () {
      if (ended) return;
      var duration = +new Date() - game.startTime;
      var seconds = Math.floor(duration / 1000) % 60;
      var minutes = Math.floor(duration / 60000) % 60;
      if (seconds != lastSeconds) {
        $seconds.text(seconds<=9 ? "0"+seconds : seconds);
        lastSeconds = seconds;
      }
      if (minutes != lastMinutes) {
        $minutes.text(minutes);
        lastMinutes = minutes;
      }

      var state = game.checkGameState();
      if (state) {
        ended = true;
        if (state>0) {
          win();
        }
        else {
          lose();
        }
      }
    }

    var $end = node.find(".end");

    function win() {
      $end.fadeIn().find(".message").text("All candles are lighted! You succeed!");
    }

    function lose() {
      $end.fadeIn().find(".message").text("You haven't kept the flame lighted!");
    }

    this.start = function () {
      coal = loader.getResource("coal");
      candleOn = loader.getResource("candle-on");
      candleOff = loader.getResource("candle-off");
      CANDLE_H = Math.floor(CANDLE_W * candleOn.height/candleOn.width);

      setup();
      requestAnimFrame(function loop () {
        requestAnimFrame(loop);
        game.world.update();
        render();
      }, canvas);

      setInterval(function () {
        DOM_render();
      }, 100);
    }
  }

(function main () {



var MAP_BIG = {
  width: 3000,
  height: 2250,
  start: { x: 125, y: 485 },
  candlesToWin: 2,
  objects: {
    candles: [
      //[100, 380],
      [110, 850],
      [1000, 2150]
    ],
    grounds: [ 
     [ 0, 410, 200, 410, 210, 430, 0, 430 ]
    ,[ 70, 530, 210, 530, 210, 555, 70, 555 ]
    ,[ 200, 410, 560, 270, 580, 640, 420, 710, 210, 555 ]
    ,[ 0, 670, 190, 660, 320, 850, 220, 850, 0, 690 ]
    ,[ 320, 850, 520, 1120, 300, 1140, 220, 850 ]
    ,[ 0, 940, 230, 1260, 215, 1325, 0, 1070 ]
    ,[ 230, 1260, 570, 1260, 600, 1320, 215, 1325 ]
    ,[ 420, 710, 580, 640, 660, 710, 1060, 1750, 930, 1800 ]
    ,[ 130, 1430, 750, 1400, 800, 1470, 150, 1500 ]
    ,[ 300, 1450, 350, 1450, 370, 1900, 300, 1900 ]
    ,[ 350, 1850, 450, 1850, 450, 1900, 350, 1900 ]
    ,[ 0, 1900, 150, 1900, 150, 1910, 0, 1910 ]
    ,[ 120, 2000, 320, 2000, 320, 2010, 120, 2010 ]
    ,[ 430, 2070, 1020, 2150, 1020, 2250, 450, 2250 ]
    ,[ 450, 1570, 560, 1540, 570, 1600, 450, 1600 ]
    ,[ 520, 2100, 520, 1600, 570, 1600, 620, 2110 ]
    ,[ 630, 1620, 750, 1600, 800, 1700, 750, 1700, 630, 1660 ] 
    ,[ 750, 1700, 800, 1700, 900, 1850, 750, 1820 ]
    ,[ 580, 1750, 770, 1740, 780, 1824, 590, 1800 ]
    ,[ 930, 1800, 1060, 1750, 1000, 2000, 980, 2020 ]
    ,[ 700, 1920, 970, 1900, 980, 2020, 700, 2020 ]


    // TODO
    ],
    waters: [
      [0, 2150, 450, 2150, 450, 2250, 0, 2250]
    ]
  }
}

  
  var MAP_SMALL = {
    width: 700,
    height: 500,
    start: { x: 100, y: 400 }
  }

  var MAP = MAP_BIG;

  var node = $("#game");
  var W = 800;
  var H = 600;

  var loader = new GfxLoader([
    "coal",
    "candle-off",
    "candle-on"
  ], "gfx/", ".png");
  var world = new World(MAP);
  var player = new Player(world, MAP.start.x, MAP.start.y);
  var camera = new Camera(world, player, W, H);
  var controls = new MouseControls(node);
  var game = new Game(world, player, camera, controls);
  var rendering = new GameRendering(game, node, loader);

  loader.ready(function(){
    rendering.start();
    game.start();
  });

}());

});
