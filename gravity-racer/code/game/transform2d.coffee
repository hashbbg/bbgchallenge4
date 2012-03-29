module "transform2d", [], ->
	module =
		createRotation: ( angle ) ->
			[
				[ Math.cos( angle ), -Math.sin( angle ), 0 ]
				[ Math.sin( angle ),  Math.cos( angle ), 0 ]
				[                0,                   0, 1 ] ]

		createTranslation: ( translation ) ->
			[
				[ 1, 0, translation[ 0 ] ]
				[ 0, 1, translation[ 1 ] ]
				[ 0, 0,                1 ] ]

		createScale: ( scale ) ->
			[
				[ scale[ 0 ],          0, 0 ]
				[          0, scale[ 1 ], 0 ]
				[          0,          0, 1 ] ]
