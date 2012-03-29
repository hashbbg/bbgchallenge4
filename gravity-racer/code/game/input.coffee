module "input", [], ->
	module =
		createCurrentInput: ->
			currentInput = {}

			window.addEventListener "keydown", ( event ) ->
				currentInput[ event.keyCode  ] = true

			window.addEventListener "keyup", ( event ) ->
				currentInput[ event.keyCode ] = false

			currentInput
