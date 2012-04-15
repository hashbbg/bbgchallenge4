// import
var lucid       = require('./libs/lucid')
  , loadImages  = require('./libs/load_images')
  , _           = require('underscore')
  , player      = require('./player')
  , collmap     = require('./collmap')


var createLevel = function(key, levelConf){

    var loop = true
      , message = document.getElementById('message')
      , el = document.getElementById('main-container')

    message.innerHTML = 'Loading...'
    message.style.display = 'block'

    loadImages(levelConf.images, function(images){
        
        var message = document.getElementById('message')

        message.innerHTML = ''

        // create player
        var p = _.extend(player(), {
                    x: levelConf.playerX
                  , y: levelConf.playerY
                  , image: images[levelConf.playerImg]
                  , angle: levelConf.playerAngle || 0
                  , camera: { x: 0, y: 0 }
                  , key: key
                  , move: true
            })

        p.width = p.image.width
        p.height = p.image.height

        // create collision maps
        var cmap = collmap(images[levelConf.collisionMap])

        // create bgs
        var bgs = _.map(levelConf.backgrounds, function(obj){ 
            var img = images[obj.src]
            img.style.position = 'absolute'
            el.appendChild(img)

            return _.extend({ 
                img: img
              , parallax: obj.parallax || 1
              , move: function(x, y){
                    this.img.style.left = -x * this.parallax + 'px'
                    this.img.style.top = -y * this.parallax + 'px'
              }
            })
        })

        // create timer
        var timer = { 
            el: document.createElement('span')
          , time        : 0
          , cont        : false
          , update: function(amount){
                if ( !this.cont ) return
                
                this.time += amount
                this.el.innerHTML = (this.time/1000).toFixed(2)
            }
        }


        timer.el.id = 'timer'
        el.appendChild(timer.el)
        

        var message = document.getElementById('message')
        
        p.on('start', function(){
            timer.cont = true
        })
        p.on('win', function(){
            message.innerHTML = 'You WON!!'
            message.style.display = 'block'
            timer.cont = false
        })

        p.on('kill', function(){
            message.innerHTML = 'You Died'
            message.style.display = 'block'
            timer.cont = false
        })

        p.on('offtrack', function(){
            if ( message.innerHTML == '' ) message.innerHTML = 'Get Back On The Track'
        })

        p.on('ontrack', function(){
            if  ( message.innerHTML == 'Get Back On The Track' ) message.innerHTML =''
        })

        // LOOP
        var loopMS = 20
          , last   = +new Date

        setTimeout(function func(){
            if (loop) setTimeout(func, loopMS)

            // update player
            if ( p.lastFrame ) p.clean()
            p.update(loopMS)

            // update backgrounds
            _.invoke(bgs, 'move', p.camera.x, p.camera.y)

            // sort out timer 
            timer.update(loopMS)

            var onBlue = cmap.test(p.x + p.width / 2, p.y + p.height / 2, 'blue')
              , onRed  = cmap.test(p.x + p.width / 2, p.y + p.height / 2, 'red')

            // test player against going off the track
            if ( onBlue )
                p.trigger('offtrack', timer.time)
            else 
                p.trigger('ontrack')

            // test player against boost
            if ( onRed && !onBlue ) 
                p.trigger('boost')


            // test player against winning
            if ( p.y < levelConf.winY ) p.trigger('win')

            // draw
            p.render()

        }, loopMS)

    })
        
    var levelObj = _.extend({
        cleanup: function(){ 
            clearInterval(loop)
            el.innerHTML = ''
        }
    }, lucid.emitter())
    
    return levelObj
}


var setupGame = function(){

    // event handlers
    var keyPoll = { 
        down: false
      , left: false
      , right: false
      , up  : false
    }

    document.addEventListener('keydown', function(e){
        var code = e.keyCode

        var res = code == 37 ? keyPoll.left = true 
              : code == 40 ? keyPoll.down = true
              : code == 39 ? keyPoll.right = true
              : code == 38 ? keyPoll.up = true
              : /*otherwise*/ null

      if ( res ) e.preventDefault()
    })

    document.addEventListener('keyup', function(e){
        var code = e.keyCode

        var res =  code == 37 ? keyPoll.left = false
              : code == 40 ? keyPoll.down = false
              : code == 39 ? keyPoll.right = false
              : code == 38 ? keyPoll.up = false
              : /*otherwise*/ null

      if ( res ) e.preventDefault()
    })
    
    createMenu(keyPoll)
}

var levels = {
    speedway: require('./levels/speedway')
  , twisted: require('./levels/twisted')
  , skip: require('./levels/skip')
}

var createMenu = function(keyPoll){

    var menu = document.getElementById('menu')
      , back = document.getElementById('back')
      , links= document.getElementById('levels').getElementsByTagName('a')
    
    menu.style.display = 'block'
    back.style.display = 'none'

    _.each(links, function(a){
        a.addEventListener('click', function(e){
            var type = this.dataset.track
            e.preventDefault()
            
            menu.style.display = 'none'
            back.style.display = 'block'
            createLevel(keyPoll, levels[type])
        })
    })
    

}

setupGame()
