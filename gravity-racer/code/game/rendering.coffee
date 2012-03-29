module "rendering", [], ->
	module =
		initDisplay: ->
			canvas  = document.getElementById "canvas"
			context = canvas.getContext "2d"
			size    = [ canvas.width, canvas.height ]

			context.translate size[ 0 ] / 2, size[ 1 ] / 2

			display =
				canvas : canvas
				context: context
				size   : size

		createRenderable: ( imageId, args ) ->
			renderable =
				imageId : imageId
				position: [ 0, 0 ]
				scale   : 1

		render: ( display, images, renderables ) ->
			context = display.context

			context.clearRect -display.size[ 0 ] / 2, -display.size[ 1 ] / 2, display.size[ 0 ], display.size[ 1 ]

			for renderable in renderables
				context.save()

				image = images[ renderable.imageId ]

				pos    = renderable.position
				offset = image.offset
				scale  = renderable.scale

				context.translate pos[ 0 ], pos[ 1 ]
				context.scale scale, scale
				context.translate offset[ 0 ], offset[ 1 ]
				context.drawImage image.image, 0, 0

				context.restore()

