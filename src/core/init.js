(function() {

	var VES = { // for the extension itself
		preInit: function() {
			//@TODO check if VES should run
			// VES shouldn't run/show on the API or CloudFlare pages

			// see if we can access storage(s):
			this.testStorage();
		},
		init: function() {
			this.loadOptions();

			// start loading the modules once <head> can be found
			asap((function() {
				return doc.head;
			}), this.loadModules);

			asap((function() {
				return doc.body;
			}), Options.addOptionsLink);
		},
		loadOptions: function() {
			var module;
			for (module in Modules) {
				if (typeof Modules[module] === 'object') {
					//cli.log('Running loadOptions('+module+')');
					Options.getOptions(module);
				}
			}
		},
		loadModules: function() {
			var module;
			// if there's preloading needed, do it
			for (module in Modules) {
				if (typeof Modules[module] === 'object') {
					if (typeof Modules[module].beforeLoad === 'function') {
						Modules[module].beforeLoad();
					}
				}
			}
			// run the modules' .go() function ASAP
			// often, the document body is not available yet, so wait
			asap((function() {
				return doc.body;
			}), function() {
				for (module in Modules) {
					if (typeof Modules[module] === 'object') {
						try {
							Modules[module].go();
						} catch (e) { // if one module breaks don't kill everything
							cli.log('\"' + Modules[module].moduleName + '\" initialization crashed!');
							cli.log(e.name + ': ' + e.message);
						}
					}
				}
			});
			// inject the CSS from all the modules
			Utils.applyCSS(Utils.css, 'VESStyles');
		},
		updated: function() {
			return get('previousversion', function(items) {
				if (items) {
					v = items.previousversion;
					if (v === G.v) {
						// we're running the same version as last run,
						// don't do anything
						return;
					}
					if (v) {
						alert('VES has been updated to version ' + G.v + '.');
						//@TODO point users to changelog, if desired
					}
				}
				return set('previousversion', G.v);
			});
		},
		testStorage: function() {
			var accessible = true;

			try {
				localStorage.setItem('VES.test', 'test');
				GM_setValue('VES.test', 'test');
				localStorage.removeItem('VES.test');
				GM_deleteValue('VES.test');
			} catch (e) {
				accessible = false;
			}

			if (!(accessible)) {
				cli.err('localStorage is unavailable. Are you in a private session?');
				cli.warn('VES will run using sessionStorage (no changes will persist).');
				localStorage = sessionStorage || unsafeWindow.sessionStorage;
			}
		}
	};
	VES.init();

}).call(this);
