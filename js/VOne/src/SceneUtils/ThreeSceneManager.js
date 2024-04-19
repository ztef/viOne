/**
* Provides easy management for a THREE.js webGL scene.
*
* @class VOne.ThreeSceneManager
* @constructor VOne.ThreeSceneManager
* @param {THREE.Scene} scene A three.js scene Object.
* @param {Object} interactiveModels An interactiveModels object.
**/

VOne.ThreeSceneManager = function(scene, interactiveModels){


	this.type = 'ThreeSceneManager';

	/**
	* The scene that will be managed.
	*
	* @property _scene
	* @type {THREE.Scene}
	*
	**/
	this._scene = scene;

	this.sceneModel = { };

	this.objectIndex = 0;

	this._interactiveModels = interactiveModels;



	/**
	* The scene's created (or reused) camera instance.
	*
	* @property camera
	* @type {THREE.Camera}
	*
	**/
	this.camera = scene.camera;


	/**
	* Controls instance used for camera movement.
	*
	* @property controls
	* @type {THREE.Controls}
	*
	**/
	this.controls = undefined;


	/**
	* A collection of objects containing functions to be executed on every render call. Use the @setOnRender method to add functions to this collection.
	*
	* @property onRender
	* @type {Array}
	**/
	this.onRender = [ ];


	VOne.Scenes.push(this);


};


VOne.ThreeSceneManager.prototype = {


	constructor: VOne.ThreeSceneManager,


	/**
	* Adds objects to the scene.
	*
	* @method add
	* @param {Object3D || [Object3D]} mesh Object(s) to be added to the scene.
	* @param {String} name A name to indentify the objects.
	* @param {String} [parent] A previously added parent's object name.
	**/
	add: function(mesh, name, parent){


		this.objectIndex++;

		var _name = name || 'g' + this.objectIndex;

		mesh.sceneManager = this;


		if(Array.isArray(mesh)){

			var group = parent || new THREE.Object3D();

			mesh.forEach(function(mesh){

				group.add(mesh);

			});


			if(!parent){

				this._scene.add(group);
				this.sceneModel[_name] = group;

			}


			return group;

		} else {

			if(!parent){

				this._scene.add(mesh);
				this.sceneModel[_name] = mesh;
				return;

			} else {

				var parentObject = this.sceneModel[parent];

				if(!parentObject){

					parentObject = new THREE.Object3D();
					this.sceneModel[parent] = parentObject;
					this._scene.add(parentObject);

				}

				this.sceneModel[parent].add(mesh);

				return this.sceneModel[parent];

			}


		}

	},


	/**
	* Register an object with a THREE.BufferGeometry (such as THEE.Points) to be used as an interactive object to the scene's raycaster
	*
	* @method registerInteractiveBufferGeometry
	* @param {VOne.BufferGeometryModel} model The geometry model to be registered.
	**/
	registerInteractiveBufferGeometry: function(model){


		var modelName;

		if(typeof model.name === 'undefined'){
			modelName = 'bufferGeometry' + this.objectIndex;
			model.mesh.name = modelName;
		} else {
			modelName = model.name;
		}

		this._interactiveModels[modelName] = model;
		this._interactiveModels.add(model.mesh);


	},


	/**
	* Un-registers objects from being used as interactive objects.
	*
	* @method unRegisterInteractiveBufferGeometry
	* @param {VOne.GeometryModel} geometryModel the geometry containing geometries to un-register.
	*/
	unRegisterInteractiveBufferGeometry: function(model){

		var that = this;

		this._scene.VOneData.interactiveObjects.forEach(function(mesh, index){

			if(mesh === model.mesh){

				return that._scene.VOneData.interactiveObjects.splice(index, 1);


			}

		});

	},


	/**
	* Register geometries to be used as interactive objects. The geometry MUST have set an id property
	*
	* @method registerInteractiveGeometry
	* @param {VOne.GeometryModel} geometryModel the geometry containing geometries to interact with.
	*/
	registerInteractiveGeometry: function(model){

		var modelName = model.name;

		this._interactiveModels[modelName] = model;

		for(var i = 0; i < model.mesh.length; i++){

			model.mesh[i].name = modelName;
			this._interactiveModels.add(model.mesh[i]);

		}

	},




	/**
	* Returns the last object added to the scene.
	*
	* @method getLastObject
	* @return {Object} Last object added to the scene via the add method.
	**/
	getLastObject: function(){

		var keys = Object.keys(this.sceneModel);
		var last = keys[ keys.length - 1];

		return this.sceneModel[last];

	},


	/**
	* Returns the objects and groups count added to the scene.
	*
	* @method getObjectsCount
	**/
	getObjectsCount: function(){

		var keys = Object.keys(this.sceneModel);

		return keys.length;

	},


	/**
	*
	* Returns the object corresponding to the name provided.
	*
	* @method getObject
	* @param {string} objectName The object's given name.
	*
	* @return {Object} The object corresponding to the provided name.
	**/
	getObject: function(name){

		return this.sceneModel[name];

	},


	/**
	* Removes a given object from the scene. The object must have been added using this class.
	*
	* @method removeObject
	* @param {string} objectName The object's given name when added to the scene.
	**/
	removeObject: function(objectName){

		this._scene.remove(this.sceneModel[objectName]);

		delete(this.sceneModel[objectName]);

	},


	/**
	* Returns all the elements added to the scene using this class.
	*
	* @method getSceneObjects
	*/
	getSceneObjects: function(){

		return this.sceneModel;

	},


	/**
	* Removes the last object added to the scene.
	*
	* @method removeLastObjectFromScene
	*
	* @param {boolean} leaveSceneClear If set to false or not defined, the first element added will remain in the scene.
	*/
	removeLastObjectFromScene: function(leaveSceneClear){


		var keys = Object.keys(this.sceneModel);

		var last;

		if(!leaveSceneClear){

			if(keys.length > 1) {

				last = keys[ keys.length - 1];

				this._scene.remove(this.sceneModel[last]);

				delete(this.sceneModel[last]);

				return true;

			} else {

				return false;

			}


		} else {

			last = keys[ keys.length - 1];

			this._scene.remove(this.sceneModel[last]);

			delete(this.sceneModel[last]);

			return true;

		}

	},



	/**
	* Removes all objects from the scene.
	*
	* @method clear
	*
	*/
	clear: function(){

		var keys = Object.keys(this.sceneModel);

		for(var i = 0; i < keys.length; i++){

			this._scene.remove(this.sceneModel[keys[i]]);

			delete(this.sceneModel[keys[i]]);

		}

	},


	/**
	* Sets the scene camera position
	*
	* @method setCameraPosition
	* @param {x} x The camera's X new position
	* @param {y} y The camera's Y new position
	* @param {z} z The camera's Z new position
	**/
	setCameraPosition: function(x, y, z){

		this._scene.camera.position.set(x, y, z);

	},



	/**
	* Establishes what to do every render frame. This method can be called several times, each function added will be called every render frame.
	*
	* @method setOnRender
	* @param {function} actions to do on every render frame.
	* @param {Object} params to be passed to the function.s
	* @param {string} [name] An optional id for the particular function.
	**/
	setOnRender: function(onRender, params, renderFunctionId){

		if(typeof onRender !== 'function'){

			console.error('ERROR: You must provide a function!');

		} else {

			var renderFId = renderFunctionId || '';
			var fnParams = params || [ ];

			this.onRender.push( { id: renderFId, fn: onRender, params: fnParams } );

		}

	},


	/**
	* Removes a function from the onRender loop. The function to be removed must have been added providing an id for the function.
	*
	* @method removeFromOnRenderById
	* @param {string} id The function to be removed id.
	**/
	removeFromOnRenderById: function(id){


		if(!id || id === ''){

			console.warn('Can\'t remove a function without id.');
			return;

		}

		var count = this.onRender.length;

		var fn;

		for(var i = 0; i < count; i++){

			fn = this.onRender[i];

			if(fn.id === id){

				this.onRender.splice(i, 1);
				return fn;

			}

		}

	},



	registerAnimationEngine: function(){

		var animationEngine = new VOne.AnimationEngine(this);

		this.setOnRender(animationEngine.animate, this, 'animationEngine');

	},


	/**
	* Pauses the scene render cicle. If you have multiple scenes and renderers, this could help to keep a good performance.
	*
	* @method pauseRenderer
	**/
	pauseRenderer: function(){

		this._scene.redererPaused = true;

	},

	/**
	* Resumes the scene render cicle after a pause. If you have multiple scenes and renderers, this could help to keep a good performance.
	*
	* @method resumeRenderer
	**/
	resumeRenderer: function(){

		this._scene.redererPaused = false;

	},


	/**
	* Returns the mouse position in normalized coordinates.
	*
	* @method getMouse
	**/
	getMouse: function(){

		return this._scene.mouse;

	},


	/**
	* Returns the mouse position in screen coordinates.
	*
	* @method getMouseOnScreen
	**/
	getMouseOnScreen: function(){

		return this._scene.mouseOnScreen;

	}

};
