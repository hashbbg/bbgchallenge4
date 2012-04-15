function Timer(obj_ref, type, update_interval, pause_on_blur) {
  var MAX_FPS = 60,
      self = this;

  if (!type) {
    type = "simple";
  }

  // allows for more accurate predictable updates with fixed update interval 
  // obj_ref requires render method renders every requestAnimFrame 
  // and update method updates the logics (receives dt and time as arguments)
  if (type == "deterministic") {
    this.interval = (update_interval || 16.666) / 1000; // defaults to 16.666ms ~60ups logic update loop interval
    this.accured_time = 0;
    Timer.prototype.tick = Timer.prototype.tickDeterministic;

    // simpler updates with updates rate fixed with rendering fps 
  } else if (type == "simple") {
    Timer.prototype.tick = Timer.prototype.tickSimple;
    // even simpler updater model with dt and time passed to the render method - no update is required - if present will be ignored
  } else if (type == "render") {
    Timer.prototype.tick = Timer.prototype.tickRender;
  }

  if (!pause_on_blur) pause_on_blur = false;

  if (pause_on_blur) {
    function onFocus() {
      if (self.start_on_focus) {
        self.start_on_focus = false;
        self.start();
      }
    }

    function onBlur() {
      if (self.running) {
        self.start_on_focus = true;
        self.stop();
      }
    }

    window.addEventListener('focus', onFocus, false);
    window.addEventListener('blur', onBlur, false);
  }

  this.type = type;
  this.target = obj_ref;
  this.time = 0;
  this.prev_time = +new Date() / 1000;
  this.start_on_focus;
  this.total = 0;

  if(!window.requestAnimFrame) {
    // fix requestAnimationFrame
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
        window.setTimeout(callback, 1000 / MAX_FPS);
        };
        })();
  }

  this.start();

};

Timer.prototype.stop = function() {
  if (this.running) {
    this.last_update = 0;
    this.accured_time = 0;
    this.running = false;      
  }
};

Timer.prototype.start = function() {
  if (!this.running) {
    this.running = true;
    this.prev_time = +new Date() / 1000;
    this.tick();      
  }
};

Timer.prototype.tick = null;

Timer.prototype.tickDeterministic = function() {
  var self = this,
      interval = this.interval,
      target = this.target,
      tick = function t() {
        if(self.running) {
          if (requestAnimFrame) {

            var cur_time = +new Date() / 1000,
            time_change = cur_time - self.prev_time;

            self.accured_time += time_change;
            self.time += time_change;
            self.prev_time = cur_time;


            while (self.accured_time >= interval) {
              var i = 0;

              self.accured_time -= interval;
              target.update(interval, self.time - self.accured_time);

            }

            target.render();

            requestAnimFrame(tick);
          }

        }   
      };

  tick();

};

Timer.prototype.tickSimple = function tickSimple() {
    var self = this,
        target = this.target,
        tick = function() {
            if (self.running) {
                if (requestAnimFrame) {

                    var cur_time = +new Date() / 1000,
                    dt = cur_time - self.prev_time;

                    self.time += dt;
                    self.prev_time = cur_time;
                    target.update(dt, self.time);
                    target.render();            
                    //console.log(target);            
                    requestAnimFrame(tick);
                }
            }   
        };
        tick();
};

Timer.prototype.tickSkip = function() {
  var self = this,
      target = this.target,
      tick = function() {
        if(self.running) {
          if (requestAnimFrame) {

            var cur_time = +new Date() / 1000,
            dt = cur_time - self.prev_time;

            self.time += dt;
            self.prev_time = cur_time;
            if (self.total++%2 == 1) {
              target.update(dt, self.time);
            } else {
              target.render();
            }

            requestAnimFrame(tick);
          }

        }
      };

  tick();
}

Timer.prototype.tickRender = function() {
  var self = this,
      target = this.target,
      tick = function() {
        if(self.running) {
          if (requestAnimFrame) {

            var cur_time = +new Date() / 1000,
            dt = cur_time - self.prev_time;

            self.time += dt;
            self.prev_time = cur_time;            

            target.render(dt, self.time);

            requestAnimFrame(tick);
          }

        }   
      };

  tick();
}
