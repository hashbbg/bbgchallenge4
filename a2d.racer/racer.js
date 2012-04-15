/*global a2d */

function Racer() {
    'use strict';
    var tileSize = new a2d.Dimension(0, 0),
        gridSize = new a2d.Dimension(0, 0),
        terrain,
        car = null,
        self = this,
        accel = false,
        left = false,
        right = false,
        raceStart = 0,
        raceFinish = 0,
        death = false,
        difficulty = "hurtmeplenty",
        frameTime = 0,
        highscores = localStorage.highscores ? JSON.parse(localStorage.highscores) : [],
        state = {},
        menu = {PLAY : 0, HISCORES: 1, CREDITS: 2, TOOYOUNGTODIE: 3, HURTMEPLENTY: 4, NIGHTMARE: 5},
        currentState,
        canvas = a2d.canvas,
        set = function(newState) {
            newState.init();
            currentState = newState;
        };

    state.HIGHSCORES = {
        labels: [],
        keyDown: function(keyCode) {
            set(state.MENU);
        },
        keyUp: function(keyCode) {},
        init: function() {
            a2d.root.length = 0;
            state.HIGHSCORES.labels = [];
            if(highscores.length > 0) {          
                for(var i = 0; i < highscores.length; i++) {
                    state.HIGHSCORES.labels.push (highscores[i].name + " " + highscores[i].time + "ms");
                }
            } else {
                state.HIGHSCORES.labels.push("No scores!");
            }

        },
        onDraw: function() {
            a2d.canvas.width = a2d.canvas.width;
            a2d.context.font="14px 'Press Start 2P'";            
            for(var i = 0; i < currentState.labels.length; i++){
                a2d.context.fillStyle = "black";
                a2d.context.fillText(currentState.labels[i], 100 ,100 + i * 25);                   
            }            
        }
    };
    state.NEWHIGHSCORE = {
        initials: "",
        submit: false,
        welcome: "New highscore!",
        instruction: "enter your initials:",
        qualfied: false,
        keyDown: function(keyCode) {
            var ch = String.fromCharCode(keyCode);
            if(currentState.qualified) {
                switch(keyCode) {
                    case a2d.key.BACKSPACE:
                        currentState.initials = currentState.initials.substring(0, currentState.initials.length - 1);
                        break
                    case a2d.key.ENTER:
                        currentState.submit = true;
                        break;
                    default:
                        currentState.initials += ch.toUpperCase();
                        break;
                }            
                if(currentState.submit) {
                    if(highscores.length ===  0) {
                        highscores.push({"name" : currentState.initials, "time": raceFinish});
                    } else {                            
                        var inserted = false;
                        for(var i = 0; i < highscores.length; i++) {
                            if(highscores[i].time > raceFinish && i < 10) {
                                console.log(i);
                                highscores.splice(i, 0, {"name" : currentState.initials, "time": raceFinish});
                                inserted = true;
                                break;
                            }
                        }
                        if(!inserted) {
                            highscores.push({"name" : currentState.initials, "time": raceFinish});
                        }                        
                        if(highscores.length > 10) { 
                            highscores.length = 10;
                        }
                    }
                    localStorage.highscores = JSON.stringify(highscores);
                    currentState.qualified = false;
                    currentState.submit = false;
                    set(state.HIGHSCORES);
                }
            } else {
                set(state.MENU);
            }
        },
        keyUp: function(keyCode) {
        },
        init: function() {
            a2d.root.length = 0;
            state.NEWHIGHSCORE.initials = "";
            if(highscores.length < 10) { 
                state.NEWHIGHSCORE.qualified = true; 
            } else {
                for(var i =0; i < highscores.length; i++) {
                    if(highscores[i].time > raceFinish && i < 10) {
                        state.NEWHIGHSCORE.qualified = true;
                        break;
                    }
                }            
            }
            if(!state.NEWHIGHSCORE.qualified) {
                state.NEWHIGHSCORE.welcome = "That score does not qualify";
                state.NEWHIGHSCORE.instruction = "for a highscore :(";
                state.NEWHIGHSCORE.initials = "press any key to return to menu";
            }
        },
        onDraw: function() {
            a2d.canvas.width = a2d.canvas.width;
            a2d.context.font="14px 'Press Start 2P'";
            var labels = [currentState.welcome, currentState.instruction, currentState.initials];
            for(var i = 0; i < labels.length; i++){
                a2d.context.fillStyle = "black";
                a2d.context.fillText(labels[i], 100 ,100 + i * 50);                   
            }            
        }        
    };
    state.CREDITS = {
        keyDown: function(keyCode) {
            set(state.MENU);
        },
        keyUp: function(keyCode) {},
        init: function() {
            a2d.root.length = 0;
        },
        onDraw: function() {
            a2d.canvas.width = a2d.canvas.width;
            a2d.context.font="14px 'Press Start 2P'";
            var labels = ["Programming by Armen138", "A2D Engine by Armen138", "Graphics borrowed from lostgarden.com", "Font from Google webfonts(Press Start 2P)"];
            for(var i = 0; i < labels.length; i++){
                a2d.context.fillStyle = "black";
                a2d.context.fillText(labels[i], 100 ,100 + i * 50);                   
            }            
        }
    };
    state.DIFFICULTY = {
        selected: menu.TOOYOUNGTODIE,
        keyDown: function(keyCode) {
            switch(keyCode) {
                case a2d.key.ARROW_DOWN:
                    //select next                
                    currentState.selected++;
                    if(currentState.selected > menu.NIGHTMARE) {
                        currentState.selected = menu.TOOYOUNGTODIE;
                    }
                    break;
                case a2d.key.ARROW_UP:
                    //select previous
                    currentState.selected--;
                    if(currentState.selected < menu.TOOYOUNGTODIE) {
                        currentState.selected = menu.NIGHTMARE;
                    }
                    break;
                case a2d.key.ESC:
                    set(state.MENU);
                    break;
                case a2d.key.ENTER:
                case a2d.key.SPACE:
                switch(currentState.selected) {
                    case menu.TOOYOUNGTODIE:
                        difficulty = "tooyoungtodie";
                        set(state.PLAY);
                        break;
                    case menu.HURTMEPLENTY:
                        difficulty = "hurtmeplenty";
                        set(state.PLAY);
                        break;
                    case menu.NIGHTMARE:
                        difficulty = "nightmare";
                        set(state.PLAY);
                        break;
                }
                break;
                default:
                    break;
            }
        },
        keyUp: function(keyCode) {
        },
        init: function() {
            a2d.root.length = 0;
            death = false;
        },
        onDraw: function() {
            a2d.canvas.width = a2d.canvas.width;
            a2d.context.font="18px 'Press Start 2P'";
            a2d.context.fillText("pick your difficulty: ".toUpperCase(), 100 ,50);                   
            a2d.context.font="32px 'Press Start 2P'";
            var labels = ["too young to die", "hurt me plenty", "nightmare"];
            for(var i = 0; i < labels.length; i++){
                if(currentState.selected === i + 3) {
                    a2d.context.fillStyle = "red";
                } else {
                    a2d.context.fillStyle = "black";
                }
                a2d.context.fillText(labels[i].toUpperCase(), 100 ,120 + i * 50);                   
            }            
        }
    };    
    state.MENU = {
        selected: menu.PLAY,
        keyDown: function(keyCode) {
            switch(keyCode) {
                case a2d.key.ARROW_DOWN:
                    currentState.selected++;
                    if(currentState.selected > menu.CREDITS) {
                        currentState.selected = menu.PLAY;
                    }
                    //select next
                    break;
                case a2d.key.ARROW_UP:
                    //select previous
                    currentState.selected--;
                    if(currentState.selected < menu.PLAY) {
                        currentState.selected = menu.CREDITS;
                    }
                    break;
                case a2d.key.SPACE:                    
                case a2d.key.ENTER:
                    switch(currentState.selected) {
                        case menu.PLAY:
                            set(state.DIFFICULTY);
                            break;
                        case menu.HISCORES:
                            set(state.HIGHSCORES);
                            break;
                        case menu.CREDITS:
                            set(state.CREDITS);
                            break;
                    }                
                    break;
                default:
                    break;
            }
        },
        keyUp: function(keyCode) {
        },
        init: function() {
            a2d.root.length = 0;

        },
        onDraw: function() {
            a2d.canvas.width = a2d.canvas.width;
            a2d.context.font="48px 'Press Start 2P'";
            var labels = ["play", "highscores", "credits"];
            for(var i = 0; i < labels.length; i++){
                if(currentState.selected === i) {
                    a2d.context.fillStyle = "red";
                } else {
                    a2d.context.fillStyle = "black";
                }
                a2d.context.fillText(labels[i].toUpperCase(), 100 ,100 + i * 50);                   
            }
            
        }

    };
    state.PLAY = {
        ready: false,
        keyDown: function(keyCode) {
            switch(keyCode) {
                case a2d.key.ARROW_DOWN:               
                    break;
                case a2d.key.ARROW_UP:                
                    if(raceStart === 0) {
                        raceStart = (new Date()).getTime();
                    }
                    accel = true;                
                    break;
                case a2d.key.ARROW_LEFT:
                    left = true;
                    break;
                case a2d.key.ARROW_RIGHT:
                    right = true;
                    break;                
                default:
                    break;
            }
        },
        keyUp: function(keyCode) {
            switch(keyCode) {
                case a2d.key.ESC:
                    set(state.MENU);
                    break;
                case a2d.key.SPACE:
                    if(death) {
                        currentState.init();
                    }
                    break;
                case a2d.key.ARROW_UP:
                    accel = false;
                    break;
                case a2d.key.ARROW_LEFT:
                    left = false;
                    break;
                case a2d.key.ARROW_RIGHT:
                    right = false;
                    break;                
                default:
                    break;
            }
        },
        init: function() {
            a2d.root.length = 0;
            accel = false;
            left = false;
            right = false;
            raceStart = 0;
            raceFinish = 0;
            death = false;
            frameTime = 0;  
            a2d.context.fillStyle = "black";      
            self.loadJSON(difficulty + ".json", self.loadLevel);            
        },        
        onDraw: function() {
            var t = (new Date()).getTime();
            if(car){
                var moveSpeed = (t !== 0) ? (t - frameTime) / 2 : 1;//16;
                var tile = terrain.getTileAt(car.position).tile;
                var safeTiles = 18 * 14;
                var deathTiles = [2 * 14, 8 * 14];
                if(tile > safeTiles && tile < safeTiles + 14) {                        
                    moveSpeed = moveSpeed;
                } else {
                    moveSpeed = moveSpeed / 4.0;
                }
                for(var i = 0; i < deathTiles.length; i++) {
                    if(tile > deathTiles[i] && tile < deathTiles[i] + 14 && !death && raceStart !== 0) {
                        console.log("death occured");
                        raceFinish = t - raceStart;
                        death = true;
                        var explosion = new a2d.AnimatedTileNode(a2d.resources["explosion"]);
                        explosion.position = car.position;        
                        explosion.frameLoop(new a2d.Vector(0, 13));
                        explosion.tileSize = new a2d.Dimension(64, 64);
                        explosion.setTile(0);
                        explosion.addEventListener("animationend", function() {
                            a2d.root.remove(explosion);
                            a2d.root.remove(car);
                        });
                        a2d.root.push(explosion);
                        car.visible = false;
                    }
                }
                if(!death) {
                    if(accel && car.position.Y > 400) {
                        car.position.Y -= moveSpeed;
                    } else {
                        if(car.position.Y <= 400 && raceFinish === 0 && raceStart !== 0) {
                            console.log("finish");
                            raceFinish = t - raceStart;
                            set(state.NEWHIGHSCORE);    
                        }
                    }
                    if(left && car.position.X > moveSpeed) {
                        car.position.X -= moveSpeed;
                    }
                    if(right && car.position.X + moveSpeed < 600 ) {
                        car.position.X += moveSpeed;
                    }
                    if(raceStart !== 0) {
                        a2d.context.font="48px 'Press Start 2P'";
                        var tLabel = (raceFinish === 0 ? (t - raceStart) : (raceFinish)) + "";
                        a2d.context.fillText(tLabel, 100 ,100);
                    }
                } else {
                    a2d.context.font="48px 'Press Start 2P'";
                    var tLabel = "Game Over";
                    a2d.context.fillText(tLabel, 100 ,100);                
                }

                if(-car.position.Y < a2d.offset.Y + 400) {
                    a2d.offset.Y = -car.position.Y + 400;
                }
            }
            frameTime = t;
        }
    };

    document.addEventListener("keydown", function(e) {
        if(currentState) {
            currentState.keyDown(e.keyCode);
        }
        return false;
    }, false);

    document.addEventListener("keyup", function(e) {
        if(currentState){
            currentState.keyUp(e.keyCode);
        }
        return false;
    }, false);

    this.loadJSON = function(file, cb) {
        var http = new XMLHttpRequest();
        http.open("GET", file, true);
        http.onreadystatechange = function() {
            if (http.readyState==4) {
                if(http.responseText != "") {
                    var data = JSON.parse(http.responseText);
                    cb.call(self, data);
                } else {
                    alert("no data.");
                }
            }
        };
        http.send(null);

    }

    this.loadLevel = function (level) {
        terrain = new a2d.TileGridNode(level);
        tileSize.Width = level.tileSize[0];
        tileSize.Height = level.tileSize[1];
        gridSize.Width = level.gridSize[0];
        gridSize.Height = level.gridSize[1];
        a2d.root.push(terrain);
        self.createCar();
    };

    this.createCar = function() {
        car = new a2d.AnimatedTileNode(a2d.resources["car"]);
        car.position = terrain.toPix(new a2d.Position(9, 392));
        car.setTile(1);
        a2d.root.push(car);
    };

    a2d.on("load", function() { 
        set(state.MENU);
    });
    a2d.load({"terrain": "images/terrain32.png",
                  "car": "images/vehicle132.png",
            "explosion": "images/explosion132.png" });
    a2d.on("draw", function() {
        if(currentState) {
            currentState.onDraw();
        }
    });
}


//application entry
window.addEventListener("load",  function () {
    'use strict';
    var racer = new Racer();
});