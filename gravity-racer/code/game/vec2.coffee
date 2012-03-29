module "vec2", [], ->
	module =
		scale: ( v, s ) ->
			[ v[ 0 ]*s, v[ 1 ]*s ]

		add: ( v1, v2 ) ->
			[ v1[ 0 ] + v2[ 0 ], v1[ 1 ] + v2[ 1 ] ]

		subtract: ( v1, v2 ) ->
			[ v1[ 0 ] - v2[ 0 ], v1[ 1 ] - v2[ 1 ] ]

		length: ( v ) ->
			Math.sqrt( v[ 0 ]*v[ 0 ] + v[ 1 ]*v[ 1 ] )

		unit: ( v ) ->
			length = module.length( v )
			module.scale( v, 1 / length )
