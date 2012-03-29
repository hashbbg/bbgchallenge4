window.module = ( name, dependencies, definition ) ->
	unless window.modules?
		window.modules = {}

	window.modules[ name ] =
		name        : name
		dependencies: dependencies
		definition  : definition

window.load = ( name, loadedModules ) ->
	unless loadedModules?
		loadedModules = {}

	if loadedModules[ name ]?
		loadedModules[ name ]
	else
		module = window.modules[ name ]

		dependencies = for dependency in module.dependencies
			load( dependency, loadedModules )

		loadedModules[ name ] =
			module.definition.apply( undefined, dependencies )

		loadedModules[ name ]
