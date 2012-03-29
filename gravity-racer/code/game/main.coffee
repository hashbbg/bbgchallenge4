module "main", [ "rendering", "input", "graphics", "logic" ], ( rendering, input, graphics, logic ) ->
	( images ) ->
		display = rendering.initDisplay()
		context = display.context

		currentInput = input.createCurrentInput()
		gameState    = logic.createGameState()
		renderState  = graphics.createRenderState()

		lastTimeInMs = Date.now()

		main = ( timeInMs ) ->
			passedTimeInMs = timeInMs - lastTimeInMs
			passedTimeInS  = passedTimeInMs / 1000

			lastTimeInMs = timeInMs

			logic.updateGameState( passedTimeInS, currentInput, gameState )
			graphics.updateRenderState( gameState, currentInput, renderState )
			rendering.render( display, images, renderState.renderables )

			webkitRequestAnimationFrame( main )

		main( lastTimeInMs )
