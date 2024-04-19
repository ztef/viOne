/**
* @class VOne.SceneCreator
* @constructor VOne.SceneCreator
*/

VOne.SceneCreator = function(){

	this.type = 'SceneCreator';

};


VOne.SceneCreator.prototype = {

	constructor: VOne.SceneCreator,



	/**
	* Creates a scene with specific parameters.
	*
	* @method createScene
	* @param {Object} config Config options for the scene that will be created
	* @param {Number} config.width Sets the scene width. Defaults to window.innerWidth.
	* @param {Number} config.height Sets the scene height. Defaults to window.innerHeight.
	* @param {THREE.Color} config.bgColor Sets the background color for the scene. Default is 0x51008b.
	* @param {Float} config.bgAlpha Value betweeen 0 and 1 that defines the scene background alpha. Default is 1.
	* @param {Object} config.glRenderer Renderer to use in webGL scene.
	* @param {Number} config.verticalDegFOV Specifies the vertical FOV in degrees. Default is 45.
	* @param {THREE.Camera} config.camera Sets the camera instance to be used. If not provided, a new camera will be created.
	* @param {Float} config.cameraNear Sets the camera near to be used in the scene..
	* @param {Float} config.cameraFar Sets the camera far to be used in the scene.
	* @param {THREE.Controls} config.controls Specifies a camera controller (THREE.TrackballControls, THREE.OrbitControls, etc).
	* @param {Object} config.controlsConfig A custon config for the supplied controls.
	* @param {Object} config.useControls If you need to reuse a camera controls instance, use this param to provide the controls instance.
	* @param {String} config.parentType Container type element ('div' or 'window').
	* @param {String} config.containerId Allows to set an id for the scene.VOneData.container.
	* @param {Number} config.raycastThreshold Sets the scene.VOneData.raycaster threshold for points geometry.
	* @param {Boolean} config.useTweenAnimations If this is set to true, tween animations will be available to be used in the scene. Default is false. (Only available for WebGLRenderer).
	* @param {Object} config.glRendererCustomProperties A set of properties to be set on the WebGLRenderer.
	* @param {hex} config.bodyBGColor Sets the color for the whole canvas for being used as page background color.
	*
	* @return {VOne.SceneManager}
	*
	**/


	createScene: function(config) {

		var _config = config || { };

		var scene = new THREE.Scene();

		scene.VOneData = { };



		var WIDTH = _config.width || window.innerWidth;

		var HEIGHT = _config.height || window.innerHeight;

		var widthProportion = WIDTH / window.innerWidth;

		var heightProportion = HEIGHT / window.innerHeight;

		var bgColor = _config.bgColor || 0x000000;

		var bgAlpha = _config.bgAlpha || 1;

		var parentType = _config.parentType || 'window';

		var _renderer = _config.glRenderer || THREE.WebGLRenderer;

		var verticalDegFOV = _config.verticalDegFOV || 45;

		var verticalVisibleUnits = _config.verticalVisibleUnits || 20000;

		var _controls = _config.controls || undefined;

		var useControls = _config.useControls || undefined;

		var camera = _config.camera || undefined;

		scene.VOneData.container = parentType === 'div' ? document.createElement('div') : document.body;


		scene.VOneData.containerId = _config.containerId || 'VOneContainer';

		if(_config.width || _config.height){

			scene.VOneData.containerDimensions = { width: WIDTH, height: HEIGHT  };

		}

		var raycastThreshold = _config.raycastThreshold || 20;

		var cameraNear = _config.cameraNear || 0.1;

		var cameraFar = _config.cameraFar || 250000;

		var useTweenAnimations = _config.useTweenAnimations || false;


		var PROPORTION = WIDTH / HEIGHT;



		scene.VOneData.interactiveObjects = [ ];


		scene.VOneData.interactiveModels = {


			add: function(meshObject){

				scene.VOneData.interactiveObjects.push(meshObject);

			}

		};


		var  renderer, animate;


		scene.VOneData.container.style.margin = '0';
		scene.VOneData.container.style.padding = '0';




		var cameraZ = verticalVisibleUnits / 2 / Math.tan(toRadians(verticalDegFOV / 2));


		scene.redererPaused = false;


		scene.VOneData.bgColor = bgColor;

		scene.VOneData.bgAlpha = bgAlpha;


		scene.VOneData.rendererType = _renderer === THREE.WebGLRenderer ? 'webGL' : 'other';

		scene.VOneData.rendererClass = _renderer;



		if(parentType === 'div'){

			document.body.appendChild(scene.VOneData.container);

			scene.VOneData.container.style.width = WIDTH + 'px';
			scene.VOneData.container.style.height = HEIGHT + 'px';
			scene.VOneData.container.style.zIndex = "-1";

			scene.VOneData.container.id = scene.VOneData.containerId;

			scene.VOneData.containerType = 'div';

		}



		if(!camera){

			scene.camera = new THREE.PerspectiveCamera(verticalDegFOV, PROPORTION, cameraNear, cameraFar);
			scene.camera.position.z = cameraZ;

		}

		else
			scene.camera = camera;



		scene.add(scene.camera);





		if(_controls){

			scene.VOneData.controls = new _controls(scene.camera, scene.VOneData.container);

			if(config.controlsConfig){

				var controlKeys = Object.keys(config.controlsConfig);

				for(var i = 0; i < controlKeys.length; i++){

					scene.VOneData.controls[controlKeys[i]] = config.controlsConfig[controlKeys[i]];

				}

			}


		}


		if(useControls){

			scene.VOneData.controls = useControls;

		}



		scene.VOneData.sceneManager = new VOne.ThreeSceneManager(scene, scene.VOneData.interactiveModels);

		scene.VOneData.sceneManager.controls = scene.VOneData.controls;


		VOne.RenderersManager.addScene(scene);

		if(config.bodyBGColor){
			VOne.RenderersManager.bgColor = config.bodyBGColor;
		}
		if(config.bodyBGAlpha){
			VOne.RenderersManager.bgAlpha = config.bodyBGAlpha;
		}

		if(scene.VOneData.rendererType === 'webGL'){

			var isBufferGeometry;


			scene.mouse = new THREE.Vector2();
			scene.mouseOnScreen = new THREE.Vector2();

			scene.VOneData.raycaster = new THREE.Raycaster();

			scene.VOneData.raycaster.params.Points.threshold = raycastThreshold;


			scene.VOneData.INTERSECTED = null;

			var intersectedInterestProperty;


			scene.VOneData.rendererProperties = config.glRendererCustomProperties;


			scene.render = function(){


				if(scene.VOneData.interactiveObjects.length > 0){


					scene.VOneData.raycaster.setFromCamera(scene.mouse, scene.camera);


					var intersections = scene.VOneData.raycaster.intersectObjects(scene.VOneData.interactiveObjects);



					if(intersections.length > 0){

						var model;



						if(intersections[0].object.geometry instanceof THREE.BufferGeometry){

							var intersection = intersections[0];

							if(intersection.hasOwnProperty('faceIndex')){

								scene.VOneData.lastInteractiveModelName = intersections[0].object.name;

								var index = Math.floor(intersections[0].faceIndex * scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel.length / intersections[0].object.geometry.attributes.position.count);

								intersectedInterestProperty = index;

							}

							else {

								intersectedInterestProperty = intersections[0].index;

							}

							isBufferGeometry = true;


						} else if(intersections[0].object.geometry instanceof THREE.Geometry) {

							intersectedInterestProperty = intersections[0].object;

							isBufferGeometry = false;


						}


						if(scene.VOneData.INTERSECTED != intersectedInterestProperty){


							if(scene.VOneData.INTERSECTED !== null){


								model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


								if(typeof model.onMouseOut === 'function'){


									if(isBufferGeometry){

										var element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

										model.onMouseOut(element, scene.VOneData.INTERSECTED);

									} else {

										model.onMouseOut(intersectedInterestProperty);

									}


								}


							}



							scene.VOneData.INTERSECTED = intersectedInterestProperty;

							scene.VOneData.lastInteractiveModelName = intersections[0].object.name;


							model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


							if(typeof model.onMouseOver === 'function'){


								if(isBufferGeometry){

									var element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];


									model.onMouseOver(element, scene.VOneData.INTERSECTED);


								} else {

									model.onMouseOver(intersectedInterestProperty);

								}


							}




						}


					} else {


						if(scene.VOneData.INTERSECTED !== null){


							var model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


							if(typeof model.onMouseOut === 'function'){


								if(isBufferGeometry){

									var element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

									model.onMouseOut(element, scene.VOneData.INTERSECTED);

								} else {

									model.onMouseOut(intersectedInterestProperty);

								}


							}

							scene.VOneData.INTERSECTED = null;

						}

					}


				}



				if(scene.VOneData.controls)
					scene.VOneData.controls.update();


				if(scene.VOneData.sceneManager.onRender.length > 0){

					scene.VOneData.sceneManager.onRender.forEach(function(f){

						f.fn(f.params);

					});

				}


				renderer.render(scene, scene.camera);

			};


			if(useTweenAnimations){

				scene.VOneData.sceneManager.registerAnimationEngine();

			}


		} else  {

			render = function(){

				if(controls)
					controls.update();


				if(scene.VOneData.sceneManager.onRender.length > 0){

					scene.VOneData.sceneManager.onRender.forEach(function(f){

						f.fn(f.params);

					});

				}


				renderer.render(scene, scene.camera);

			};

		}



		return scene.VOneData.sceneManager;

	}

};
