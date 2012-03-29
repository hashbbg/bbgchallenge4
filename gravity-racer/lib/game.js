(function() {

  window.module = function(name, dependencies, definition) {
    if (window.modules == null) window.modules = {};
    return window.modules[name] = {
      name: name,
      dependencies: dependencies,
      definition: definition
    };
  };

  window.load = function(name, loadedModules) {
    var dependencies, dependency, module;
    if (loadedModules == null) loadedModules = {};
    if (loadedModules[name] != null) {
      return loadedModules[name];
    } else {
      module = window.modules[name];
      dependencies = (function() {
        var _i, _len, _ref, _results;
        _ref = module.dependencies;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dependency = _ref[_i];
          _results.push(load(dependency, loadedModules));
        }
        return _results;
      })();
      loadedModules[name] = module.definition.apply(void 0, dependencies);
      return loadedModules[name];
    }
  };

  module("imageTools", [], function() {
    var module;
    return module = {
      load: function(imagePaths, onLoad) {
        var image, images, numberOfImagesToLoad, path, _i, _len, _results;
        numberOfImagesToLoad = imagePaths.length;
        images = {};
        _results = [];
        for (_i = 0, _len = imagePaths.length; _i < _len; _i++) {
          path = imagePaths[_i];
          image = new Image;
          images[path] = image;
          image.onload = function() {
            numberOfImagesToLoad -= 1;
            if (numberOfImagesToLoad === 0) return onLoad(images);
          };
          _results.push(image.src = path);
        }
        return _results;
      },
      enrich: function(rawImages) {
        var id, images, rawImage;
        images = {};
        for (id in rawImages) {
          rawImage = rawImages[id];
          images[id] = {
            image: rawImage,
            offset: [-rawImage.width / 2, -rawImage.height / 2]
          };
        }
        return images;
      }
    };
  });

  module("graphics", ["rendering", "vec2", "transform2d", "mat3x3"], function(rendering, vec2, transform2d, mat3x3) {
    var createCamera, createCameraTransform, module, updateCamera, updateFocus, updateZoom;
    createCamera = function() {
      var camera;
      return camera = {
        center: [0, 0],
        rotation: 0,
        zoom: 1
      };
    };
    updateCamera = function(gameState, focus, camera) {
      var focusedEntity;
      focusedEntity = focus.entities[focus.currentFocus];
      return camera.center = gameState.bodies[focusedEntity].position;
    };
    createCameraTransform = function(camera) {
      var rotation, scale, translation;
      translation = transform2d.createTranslation(vec2.scale(camera.center, -1));
      rotation = transform2d.createRotation(camera.rotation);
      scale = transform2d.createScale([camera.zoom, camera.zoom]);
      return mat3x3.multiply(mat3x3.multiply(scale, translation), rotation);
    };
    updateFocus = function(currentInput, focus) {
      var left, right;
      left = currentInput[37];
      right = currentInput[39];
      if (left || right) {
        if (!focus.justUpdated) {
          if (right) focus.currentFocus += 1;
          if (left) focus.currentFocus -= 1;
          focus.currentFocus = (focus.currentFocus + focus.entities.length) % focus.entities.length;
          return focus.justUpdated = true;
        }
      } else {
        return focus.justUpdated = false;
      }
    };
    updateZoom = function(currentInput, camera) {
      var down, up;
      up = currentInput[38];
      down = currentInput[40];
      if (up) camera.zoom *= 1.1;
      if (down) return camera.zoom *= 0.9;
    };
    return module = {
      createRenderState: function() {
        var camera, renderState;
        camera = createCamera();
        camera.zoom = 8e-7;
        return renderState = {
          camera: camera,
          renderables: [],
          focus: {
            entities: ["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune"],
            currentFocus: 0,
            justUpdated: false
          }
        };
      },
      updateRenderState: function(gameState, currentInput, renderState) {
        var body, cameraTransform, entityId, imageId, renderable, _ref, _results;
        updateFocus(currentInput, renderState.focus);
        updateZoom(currentInput, renderState.camera);
        updateCamera(gameState, renderState.focus, renderState.camera);
        cameraTransform = createCameraTransform(renderState.camera);
        renderState.renderables.length = 0;
        _ref = gameState.imageIds;
        _results = [];
        for (entityId in _ref) {
          imageId = _ref[entityId];
          body = gameState.bodies[entityId];
          renderable = rendering.createRenderable(imageId);
          renderable.position = mat3x3.multiplyVec2(cameraTransform, body.position);
          _results.push(renderState.renderables.push(renderable));
        }
        return _results;
      }
    };
  });

  module("main", ["rendering", "input", "graphics", "logic"], function(rendering, input, graphics, logic) {
    return function(images) {
      var context, currentInput, display, gameState, lastTimeInMs, main, renderState;
      display = rendering.initDisplay();
      context = display.context;
      currentInput = input.createCurrentInput();
      gameState = logic.createGameState();
      renderState = graphics.createRenderState();
      lastTimeInMs = Date.now();
      main = function(timeInMs) {
        var passedTimeInMs, passedTimeInS;
        passedTimeInMs = timeInMs - lastTimeInMs;
        passedTimeInS = passedTimeInMs / 1000;
        lastTimeInMs = timeInMs;
        logic.updateGameState(passedTimeInS, currentInput, gameState);
        graphics.updateRenderState(gameState, currentInput, renderState);
        rendering.render(display, images, renderState.renderables);
        return webkitRequestAnimationFrame(main);
      };
      return main(lastTimeInMs);
    };
  });

  module("transform2d", [], function() {
    var module;
    return module = {
      createRotation: function(angle) {
        return [[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]];
      },
      createTranslation: function(translation) {
        return [[1, 0, translation[0]], [0, 1, translation[1]], [0, 0, 1]];
      },
      createScale: function(scale) {
        return [[scale[0], 0, 0], [0, scale[1], 0], [0, 0, 1]];
      }
    };
  });

  module("mat3x3", [], function() {
    var module;
    return module = {
      multiply: function(m1, m2) {
        return [[m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0], m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1], m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2]], [m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0], m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1], m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2]], [m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0], m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1], m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2]]];
      },
      multiplyVec2: function(m, v) {
        return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2]];
      }
    };
  });

  module("input", [], function() {
    var module;
    return module = {
      createCurrentInput: function() {
        var currentInput;
        currentInput = {};
        window.addEventListener("keydown", function(event) {
          return currentInput[event.keyCode] = true;
        });
        window.addEventListener("keyup", function(event) {
          return currentInput[event.keyCode] = false;
        });
        return currentInput;
      }
    };
  });

  /*
  A few words on units:
  - All distances are in km.
  - All times are in s.
  - This means speed is in km/s, acceleration is in km/s^2.
  - Mass is in kg.
  */

  module("logic", ["vec2"], function(vec2) {
    var G, buildPairs, computeAcceleration, createBody, integratePosition, integrateSpeed, module;
    G = 6.647e-20;
    createBody = function() {
      var body;
      return body = {
        position: [0, 0],
        speed: [0, 0],
        acceleration: [0, 0],
        mass: 1,
        radius: 1
      };
    };
    buildPairs = function(bodies) {
      var bodyA, bodyB, entityId, pairs, used;
      pairs = [];
      used = {};
      for (entityId in bodies) {
        bodyA = bodies[entityId];
        used[entityId] = true;
        for (entityId in bodies) {
          bodyB = bodies[entityId];
          if (!used[entityId]) pairs.push([bodyA, bodyB]);
        }
      }
      return pairs;
    };
    computeAcceleration = function(bodies) {
      var a, aToB, aToBUnit, accelerations, b, body, distance, force, index, pair, pairs, _i, _len, _results;
      pairs = buildPairs(bodies);
      _results = [];
      for (_i = 0, _len = pairs.length; _i < _len; _i++) {
        pair = pairs[_i];
        a = pair[0];
        b = pair[1];
        aToB = vec2.subtract(b.position, a.position);
        distance = vec2.length(aToB);
        force = G * a.mass * b.mass / (distance * distance);
        aToBUnit = vec2.unit(aToB);
        accelerations = [force / a.mass, -force / b.mass];
        _results.push((function() {
          var _len2, _results2;
          _results2 = [];
          for (index = 0, _len2 = pair.length; index < _len2; index++) {
            body = pair[index];
            _results2.push(body.acceleration = vec2.add(body.acceleration, vec2.scale(aToBUnit, accelerations[index])));
          }
          return _results2;
        })());
      }
      return _results;
    };
    integrateSpeed = function(passedTime, bodies) {
      var body, entityId, _results;
      _results = [];
      for (entityId in bodies) {
        body = bodies[entityId];
        body.speed = vec2.add(body.speed, vec2.scale(body.acceleration, passedTime));
        _results.push(body.acceleration = [0, 0]);
      }
      return _results;
    };
    integratePosition = function(passedTime, bodies) {
      var body, entityId, _results;
      _results = [];
      for (entityId in bodies) {
        body = bodies[entityId];
        _results.push(body.position = vec2.add(body.position, vec2.scale(body.speed, passedTime)));
      }
      return _results;
    };
    return module = {
      createGameState: function() {
        var earth, gameState, jupiter, mars, mercury, moon, neptune, saturn, sun, uranus, venus;
        sun = createBody();
        sun.mass = 1989100e24;
        sun.radius = 696000;
        mercury = createBody();
        mercury.mass = 0.3302e24;
        mercury.radius = 2439.7;
        mercury.position = [0, 69.82e6];
        mercury.speed = [38.86, 0];
        venus = createBody();
        venus.mass = 4.8685e24;
        venus.radius = 6051.8;
        venus.position = [0, 108.94e6];
        venus.speed = [34.79, 0];
        earth = createBody();
        earth.mass = 5.9736e24;
        earth.radius = 6371.0;
        earth.position = [0, 152.10e6];
        earth.speed = [29.29, 0];
        moon = createBody();
        moon.mass = 0.0734924;
        moon.radius = 1737.1;
        moon.position = [0, 152.51e6];
        moon.speed = [30.25, 0];
        mars = createBody();
        mars.mass = 0.64185e24;
        mars.radius = 3389.5;
        mars.position = [0, 249.23e6];
        mars.speed = [21.97, 0];
        jupiter = createBody();
        jupiter.mass = 1898.6e24;
        jupiter.radius = 69911;
        jupiter.position = [0, 816.62e6];
        jupiter.speed = [12.44, 0];
        saturn = createBody();
        saturn.mass = 568.46e24;
        saturn.radius = 58232;
        saturn.position = [0, 1514.5e6];
        saturn.speed = [9.09, 0];
        uranus = createBody();
        uranus.mass = 86.832e24;
        uranus.radius = 25362;
        uranus.position = [0, 3003.62e6];
        uranus.speed = [6.49, 0];
        neptune = createBody();
        neptune.mass = 102.43e24;
        neptune.radius = 24622;
        neptune.position = [0, 4545.67e6];
        neptune.speed = [5.37, 0];
        return gameState = {
          bodies: {
            sun: sun,
            mercury: mercury,
            venus: venus,
            earth: earth,
            moon: moon,
            mars: mars,
            jupiter: jupiter,
            saturn: saturn,
            uranus: uranus,
            neptune: neptune
          },
          imageIds: {
            sun: "images/star.png",
            mercury: "images/planet.png",
            venus: "images/planet.png",
            earth: "images/planet.png",
            moon: "images/moon.png",
            mars: "images/planet.png",
            jupiter: "images/planet.png",
            saturn: "images/planet.png",
            uranus: "images/planet.png",
            neptune: "images/planet.png"
          }
        };
      },
      updateGameState: function(passedTimeInS, currentInput, gameState) {
        var passedTimeInYears;
        passedTimeInYears = passedTimeInS * 525600;
        computeAcceleration(gameState.bodies);
        integrateSpeed(passedTimeInYears, gameState.bodies);
        return integratePosition(passedTimeInYears, gameState.bodies);
      }
    };
  });

  module("vec2", [], function() {
    var module;
    return module = {
      scale: function(v, s) {
        return [v[0] * s, v[1] * s];
      },
      add: function(v1, v2) {
        return [v1[0] + v2[0], v1[1] + v2[1]];
      },
      subtract: function(v1, v2) {
        return [v1[0] - v2[0], v1[1] - v2[1]];
      },
      length: function(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
      },
      unit: function(v) {
        var length;
        length = module.length(v);
        return module.scale(v, 1 / length);
      }
    };
  });

  module("rendering", [], function() {
    var module;
    return module = {
      initDisplay: function() {
        var canvas, context, display, size;
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        size = [canvas.width, canvas.height];
        context.translate(size[0] / 2, size[1] / 2);
        return display = {
          canvas: canvas,
          context: context,
          size: size
        };
      },
      createRenderable: function(imageId, args) {
        var renderable;
        return renderable = {
          imageId: imageId,
          position: [0, 0],
          scale: 1
        };
      },
      render: function(display, images, renderables) {
        var context, image, offset, pos, renderable, scale, _i, _len, _results;
        context = display.context;
        context.clearRect(-display.size[0] / 2, -display.size[1] / 2, display.size[0], display.size[1]);
        _results = [];
        for (_i = 0, _len = renderables.length; _i < _len; _i++) {
          renderable = renderables[_i];
          context.save();
          image = images[renderable.imageId];
          pos = renderable.position;
          offset = image.offset;
          scale = renderable.scale;
          context.translate(pos[0], pos[1]);
          context.scale(scale, scale);
          context.translate(offset[0], offset[1]);
          context.drawImage(image.image, 0, 0);
          _results.push(context.restore());
        }
        return _results;
      }
    };
  });

  module("loader", ["main", "imageTools"], function(main, imageTools) {
    var imagePaths;
    imagePaths = ["images/star.png", "images/planet.png", "images/moon.png"];
    return imageTools.load(imagePaths, function(rawImages) {
      var images;
      images = imageTools.enrich(rawImages);
      return main(images);
    });
  });

}).call(this);
