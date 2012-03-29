###
A few words on units:
- All distances are in km.
- All times are in s.
- This means speed is in km/s, acceleration is in km/s^2.
- Mass is in kg.
###

module "logic", [ "vec2" ], ( vec2 ) ->
	G = 6.647e-20 # gravitational constant

	createBody = ->
		body =
			position    : [ 0, 0 ]
			speed       : [ 0, 0 ]
			acceleration: [ 0, 0 ]
			mass        : 1
			radius      : 1

	buildPairs = ( bodies ) ->
		pairs = []
		used  = {}
		for entityId, bodyA of bodies
			used[ entityId ] = true

			for entityId, bodyB of bodies
				unless used[ entityId ]
					pairs.push( [ bodyA, bodyB ] )

		pairs

	computeAcceleration = ( bodies ) ->
		pairs = buildPairs( bodies )

		for pair in pairs
			a = pair[ 0 ]
			b = pair[ 1 ]

			aToB     = vec2.subtract( b.position, a.position )
			distance = vec2.length( aToB )

			force = G * a.mass * b.mass / ( distance*distance )

			aToBUnit = vec2.unit( aToB )

			accelerations = [ force / a.mass, -force / b.mass ]

			for body, index in pair
				body.acceleration =
					vec2.add(
						body.acceleration,
						vec2.scale(
							aToBUnit,
							accelerations[ index ] ) )

	integrateSpeed = ( passedTime, bodies ) ->
		for entityId, body of bodies
			body.speed = vec2.add(
				body.speed,
				vec2.scale(
					body.acceleration,
					passedTime ) )
			body.acceleration = [ 0, 0 ]

	integratePosition = ( passedTime, bodies ) ->
		for entityId, body of bodies
			body.position = vec2.add(
				body.position,
				vec2.scale(
					body.speed,
					passedTime ) )

	module =
		createGameState: ->
			sun = createBody()
			sun.mass   = 1989100e24
			sun.radius = 696000

			mercury = createBody()
			mercury.mass     = 0.3302e24
			mercury.radius   = 2439.7
			mercury.position = [ 0, 69.82e6 ]
			mercury.speed    = [ 38.86, 0 ]

			venus = createBody()
			venus.mass     = 4.8685e24
			venus.radius   = 6051.8
			venus.position = [ 0, 108.94e6 ]
			venus.speed    = [ 34.79, 0 ]

			earth = createBody()
			earth.mass     = 5.9736e24
			earth.radius   = 6371.0
			earth.position = [ 0, 152.10e6 ]
			earth.speed    = [ 29.29, 0 ]

			moon = createBody()
			moon.mass     = 0.0734924
			moon.radius   = 1737.1
			moon.position = [ 0, 152.51e6 ]
			moon.speed    = [ 30.25, 0 ]

			mars = createBody()
			mars.mass     = 0.64185e24
			mars.radius   = 3389.5
			mars.position = [ 0, 249.23e6 ]
			mars.speed    = [ 21.97, 0 ]

			jupiter = createBody()
			jupiter.mass     = 1898.6e24
			jupiter.radius   = 69911
			jupiter.position = [ 0, 816.62e6 ]
			jupiter.speed    = [ 12.44, 0 ]

			saturn = createBody()
			saturn.mass     = 568.46e24
			saturn.radius   = 58232
			saturn.position = [ 0, 1514.5e6 ]
			saturn.speed    = [ 9.09, 0 ]

			uranus = createBody()
			uranus.mass     = 86.832e24
			uranus.radius   = 25362
			uranus.position = [ 0, 3003.62e6 ]
			uranus.speed    = [ 6.49, 0 ]

			neptune = createBody()
			neptune.mass     = 102.43e24
			neptune.radius   = 24622
			neptune.position = [ 0, 4545.67e6 ]
			neptune.speed    = [ 5.37, 0 ]

			gameState =
				bodies:
					sun    : sun
					mercury: mercury
					venus  : venus
					earth  : earth
					moon   : moon
					mars   : mars
					jupiter: jupiter
					saturn : saturn
					uranus : uranus
					neptune: neptune

				imageIds:
					sun    : "images/star.png"
					mercury: "images/planet.png"
					venus  : "images/planet.png"
					earth  : "images/planet.png"
					moon   : "images/moon.png"
					mars   : "images/planet.png"
					jupiter: "images/planet.png"
					saturn : "images/planet.png"
					uranus : "images/planet.png"
					neptune: "images/planet.png"

		updateGameState: ( passedTimeInS, currentInput, gameState ) ->
			# 1 minute = 1 year
			passedTimeInYears = passedTimeInS * 525600

			computeAcceleration gameState.bodies
			integrateSpeed passedTimeInYears, gameState.bodies
			integratePosition passedTimeInYears, gameState.bodies
