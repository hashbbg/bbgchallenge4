// imports
var lucid = require('./libs/lucid')
  , _     = require('underscore')


var player = function(){

  var p = _.extend({
        x       : 596
      , y       : 24
      , width   : 10
      , height  : 10
      , alpha   : 1
      , offsetX : 150
      , offsetY : 300
      , camera  : null
      , move    : false
      , onTrack : true
      , speed   : 0
      , accel   : 0.1
      , maxSpeed: 8
      , onBoost : false
      , boostMax: 12
      , boostTime: 0
      , angle   : 0
      , grip    : 1
      , image   : null
      , context : document.getElementById("player-canvas").getContext('2d')
      , snapshot: function(){
            this.lastFrame = {
                x: this.x
              , y: this.y
              , angle: this.angle
            }
        }
      , lastFrame: null         // a snapshot of the last frame for cleaning
      , clean   : function(){
            if ( !this.lastFrame ) this.snapshot()
            var old = this.lastFrame
              , c   = this.context

              c.clearRect(0, 0, c.canvas.width, c.canvas.height)

        }
      , render  : function(){
            var halfheight = this.height / 2
              , halfwidth  = this.width  / 2

            this.context.globalAlpha = this.alpha
            this.context.save()
            this.context.fillStyle = "red"
            this.context.translate(this.width, this.height)
            this.context.rotate(this.angle)
            this.context.drawImage(this.image, -halfwidth, -halfheight, this.width, this.height)
            this.context.restore()
        } 
      , update: function(td){
            var loopMS = td/20

            this.snapshot()

            this.boostTime -= td
            if ( this.boostTime <= 0 ) this.onBoost = false
            
            if ( !this.started && this.key.up ) this.trigger('start')

            if ( this.move ) { 
                if ( this.key.left ) this.angle -= 0.05 * this.grip * loopMS
                if ( this.key.right) this.angle += 0.05 * this.grip * loopMS

                if ( this.key.up && !this.onBoost)   
                    this.speed += this.accel * loopMS
                else if ( this.key.up && this.onBoost )
                    this.speed += this.accel * 3 * loopMS
                else 
                    this.speed -= this.accel * loopMS

            } else {
                this.speed -= this.accel * 3 * loopMS
            }

            if ( !this.onTrack ) this.speed -= this.accel * loopMS

            if ( this.speed < 0 ) this.speed = 0
            else if ( this.onBoost && this.speed > this.boostMax ) this.speed = this.boostMax
            else if ( !this.onBoost && this.speed > this.maxSpeed ) this.speed = this.maxSpeed
            
            if ( this.onBoost && this.speed < this.maxSpeed ) this.onBoost = false

            if ( this.dead ) this.alpha -= 0.1
            if ( this.alpha < 0 ) this.alpha = 0

            // move
            this.x += Math.sin(this.angle) * this.speed * loopMS
            this.y -= Math.cos(this.angle) * this.speed * loopMS

            this.camera.x = this.x - this.offsetX
            this.camera.y = this.y - this.offsetY
        }
      , kill: function(){
        }
    }, lucid.emitter())

    p.on('kill', function(){
        p.move = false
        p.dead = true 
    })
    
    p.on('start', function(){ p.started = true })

    p.on('offtrack', function(time){
        if ( p.onTrack ) {  p.timeOffTrack = time; p.onTrack = false; }
        else if ( time > p.timeOffTrack + 250 ) { 
            p.move = false
            if ( p.speed == 0 ) p.trigger('kill') 
        }
    })

    p.on('ontrack', function(){
        p.move = true
        p.onTrack = true
    })

    p.on('boost', function(){
        p.onBoost = true
        p.boostTime = 1000
    })

    p.on('win', function(){
        p.move = false
    })


    return p
}

// exports
module.exports = player
