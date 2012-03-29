module "imageTools", [], ->
	module =
		load: ( imagePaths, onLoad ) ->
			numberOfImagesToLoad = imagePaths.length

			images = {}

			for path in imagePaths
				image = new Image
				images[ path ] = image
				
				image.onload = ->
					numberOfImagesToLoad -= 1

					if numberOfImagesToLoad == 0
						onLoad images

				image.src = path

		enrich: ( rawImages ) ->
			images = {}

			for id, rawImage of rawImages
				images[ id ] =
					image: rawImage,
					offset: [
						-rawImage.width  / 2
						-rawImage.height / 2 ]

			images
