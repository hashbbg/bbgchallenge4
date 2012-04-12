module "graphics", [ "rendering", "vec2", "transform2d", "mat3x3" ], ( rendering, vec2, transform2d, mat3x3 ) ->
	createCamera = ->
		camera =
			center  : [ 0, 0 ]
			rotation: 0
			zoom    : 1

	updateCamera = ( gameState, focus, camera ) ->
		focusedEntity = focus.entities[ focus.currentFocus ]
		camera.center = gameState.bodies[ focusedEntity ].position

	createCameraTransform = ( camera ) ->
		translation = transform2d.createTranslation( vec2.scale( camera.center, -1 ) )
		rotation    = transform2d.createRotation( camera.rotation )
		scale       = transform2d.createScale( [ camera.zoom, camera.zoom ] )

		mat3x3.multiply( mat3x3.multiply( scale, translation ), rotation  )

	updateFocus = ( currentInput, focus ) ->
		left  = currentInput[ 37 ]
		right = currentInput[ 39 ]

		if left or right
			unless focus.justUpdated
				focus.currentFocus += 1 if right
				focus.currentFocus -= 1 if left

				focus.currentFocus =
					( focus.currentFocus + focus.entities.length ) % focus.entities.length

				focus.justUpdated = true
		else
			focus.justUpdated = false

	updateZoom = ( currentInput, camera ) ->
		up   = currentInput[ 38 ]
		down = currentInput[ 40 ]

		if up
			camera.zoom *= 1.1
		if down
			camera.zoom *= 0.9


	module =
		createRenderState: ->
			camera = createCamera()
			camera.zoom   = 8e-7

			renderState =
				camera: camera
				renderables: []
				focus:
					entities: [
						"sun"
						"mercury"
						"venus"
						"earth"
						"moon"
						"mars"
						"jupiter"
						"saturn"
						"uranus"
						"neptune" ]
					currentFocus: 0
					justUpdated: false

		updateRenderState: ( gameState, currentInput, renderState ) ->
			updateFocus currentInput, renderState.focus
			updateZoom currentInput, renderState.camera

			updateCamera( gameState, renderState.focus, renderState.camera )
			cameraTransform = createCameraTransform( renderState.camera )

			renderState.renderables.length = 0

			for entityId, imageId of gameState.imageIds
				body = gameState.bodies[ entityId ]

				renderable = rendering.createRenderable imageId

				renderable.position = mat3x3.multiplyVec2(
					cameraTransform,
					body.position )

				renderState.renderables.push( renderable )
