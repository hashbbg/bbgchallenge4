module "loader", [ "main", "imageTools" ], ( main, imageTools ) ->
	imagePaths = [
		"images/star.png"
		"images/planet.png"
		"images/moon.png" ]

	imageTools.load imagePaths, ( rawImages ) ->
		images = imageTools.enrich rawImages
		main images
