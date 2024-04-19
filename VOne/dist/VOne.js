/*! VOne 2017-06-21 - Property of Geckode LCC */
var VOne = { VERSION: '1.1.1' };


if(typeof define === 'function' && define.amd) {

	define( 'VOne', VOne );

} else if ('undefined' !== typeof exports && 'undefined' !== typeof module){

	module.exports = VOne;
	var THREE = require('three');

}



Object.assign(VOne, {

	// Animation types
	PositionAnimation: 0,
	ScaleAnimation: 1,
	AlphaAnimation: 2,


	// Search types
	MeshNameProperty: 0,
	ChildNameProperty: 1,
	MeshClassName: 2,

	// Conversion cache
	degToRad: Math.PI / 180,
	radToDeg: 180 / Math.PI,


	// Fixed values
	SphericalIncrementRatio: Math.PI * 3 - Math.sqrt(5),
	GoldenRatio: (Math.sqrt(5)+1)/2 - 1,
	HalfPI: Math.PI / 2,
	DoublePI: Math.PI * 2,

});


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


/**
* Assigns properties for multilevel/multicontained data arrays by traversing the complete array. Allows to set properties for last child elements and calculate total values for parents based on a given child value.
*
* @method assignLevelData
* @for VOne
*
* @param {Array} data The dataset to assign properties. Must have be in the following format: <br/> [ { keyName: keyname, valuesPropertyName: [values] }, ... { keyName: keyname, valuesPropertyName: [values] } ];
*
* @param {Object} config Settings for generating the distribution
* @param {string} config.parentPropertyName The keyName property (parent elements name). Default is 'key'.
* @param {string} config.childPropertyName The values property name to search for for each parent. Default is 'values'.
* @param {function | number} config.setTotalBy Function to be evaluated | value to assign as totalValue for each last child element. Each parent will contain in the 'totalValue' property the sum of all children assigned values.
* @param {string} config.storeTotalValueAs Used in conjunction with config.setTotalBy, indicates the property name to be assigned for totals. Each parent will hold this property as the sum of this property name of every child. Defaults to 'totalValue'
* @param {string} config.extendRecordsOn If you want to generate records based on a given property, set this property with the property which value is the amount of records to append. The last child record will be copied as many times this property indicates.
* @param {function} config.processLastChildAs Function to be executed on every last child record.  The function will receive the record for allowing you to make any aditional calculations and/or set new properties on/for it.
**/
VOne.assignLevelData = function(data, config){

	config = config || { };

	var childPropertyName = config.childPropertyName || 'values';
	var parentPropertyName = config.parentPropertyName || 'key';
	var totalPropertyName = config.storeTotalValueAs || 'totalValue';
	var setTotalBy = config.setTotalBy || undefined;
	var extendRecords = config.extendRecordsOn || false;
	var processChild = config.setProcessLastChild || undefined;

	var lastChildCount = 0;

	var assign = function(_data, currentLevel){


		if(Array.isArray(_data)){


			for(var i = 0; i < _data.length; i++){

			 	if(setTotalBy){

			 		_data[i][totalPropertyName] = 0;

			 	}

			 	_data[i].level = currentLevel;


			 	if(childPropertyName in _data[i]){

			 		var nextLevel = currentLevel + 1;

			 		assign(_data[i][childPropertyName], nextLevel);

			 		var index = 0;


			 		_data[i][childPropertyName].forEach(function(record){


			 			record.groupIndex = index;
			 			record.parent = _data[i];

			 			index++;


			 			if(!record[childPropertyName]){


			 				if(extendRecords && !record.traversed){

				 				for(var j = 1; j < record[extendRecords]; j++){

				 					_data[i][childPropertyName].push(record);
				 					lastChildCount++;

				 				}

				 				record.traversed = true;

		 					}


		 					if(setTotalBy){

				 				if('function' === typeof setTotalBy){

				 					record[totalPropertyName] = setTotalBy(record);


				 				} else {

				 					record[totalPropertyName] = setTotalBy;

				 				}

			 				}


			 				if(processChild){

			 					processChild(record);

			 				}


			 				lastChildCount++;


			 			}


			 			if(setTotalBy)
			 				_data[i][totalPropertyName] += record[totalPropertyName];



			 		});


			 		if(setTotalBy){

				 		_data[i][childPropertyName].sort(function(a, b){

		 					return a[totalPropertyName] - b[totalPropertyName];

		 				});

				 	}


			 	} else {

			 		return;

			 	}


			 }


		}


	}


	assign(data, 0);

}


/**
* Generates radial distributions from arrays. Arrays must have the following structure:
*
*	[ key: "name", values: [ object, object, ..., object ]];
*
*	each object can have the same structure.
*
* @class VOne.RadialDistribution
* @constructor VOne.RadialDistribution
**/

VOne.RadialDistribution = function(){


	var _workingData;


	var radialDistribution = { };


	/**
	* Model (Array) to be used in a GeometryModel containing each element/record with position properties set.
	*
	* @property graphModel
	**/
	radialDistribution.graphModel = [];


	/**
	*	Sets the data model to work with.
	*
	* @method data
	* @param {Array} data the array with the specified form
	* @return {Object} a RadialDistribution object
	**/

	radialDistribution.data = function(data){

		_workingData = data;

		return radialDistribution;

	};


	/**
	* Asigns positions in a radial distribution to each object of the provided array.
	*
	* @method generateDistribution
	*
	* @param {Object} config options to create the distribution:
	* @param {Number} config.distanceFromParent Distance between data levels. Default is 3500.
	* @param {Boolean} config.firstNodeInCenter Indicates if the first level should be positioned at the distribution's center (this should be set to true when there's a main container element).
	*
	* @return {VOne.RadialDistribution}
	**/
	radialDistribution.generateDistribution = function(config){

		if(!_workingData){

			console.error('ERROR: no data to process. ');
			return;

		}


		if(!_workingData[0].key || !_workingData[0].values){

			console.error('ERROR: Data array objects must contain key:String and values:Array properties.');
			return;

		}


		var _distanceFromParent = config.distanceFromParent || 3500;


		radialDistribution.graphModel = [ ];

		distributeAmong(_workingData, 0, 360, _distanceFromParent, config.firstNodeInCenter ? -1 : 0);

		return radialDistribution;


	}




	/**
	* Generates a buffer geometry from the provided model data and adds the generated geometry to a VOne.Scene.
	*
	* @method attachToScene
	*
	* @param {Object} config Check VOne.GeometriesGenerator.GenerateGeometries config object.
	* @param {VOne.SceneManager} sceneManager, the VOne.SceneManager that will add the generated geometries to scene.
	* @param {String} name The name to identify the object in the scene.
	*
	* @return {Vone.GeometryModel} The VOne.GeometryModel corresponding to the provided model and the generated geometries.
	**/
	radialDistribution.attachToScene = function(config, scene, name){

		return VOne.CPSBufferGeometriesGenerator()
			.generateGeometries(config, scene, radialDistribution.graphModel, name);

	}



	function distributeAmong(data, startAngle, endAngle, _distanceFromParent, level){


		var _startAngle = startAngle || 0;
		var _endAngle = endAngle || 360;

		var _level = level || 0;


		// Dealing with last children


		if(!data[0].key) {

			_level++;


			var radius = _distanceFromParent * _level;

			var startXY = calculateXYInRadius(_startAngle, radius);

			var endXY = calculateXYInRadius(_endAngle, radius);

			var centerAngle = (_startAngle + _endAngle) / 2;

			var groupRadius =  Math.sqrt( Math.pow(endXY.x - startXY.x,  2) + Math.pow( endXY.y - startXY.y, 2)) / 2;



			var elementsGroupCenter = calculateXYInRadius(centerAngle, radius);


			data.forEach(function(element, index){

				var randomCoords = randomCoordsInRadius(groupRadius, true);


				element.position = {

					x: elementsGroupCenter.x + randomCoords.x,
					y: elementsGroupCenter.y + randomCoords.y

				};

				element.angle = getAngleInDegreesFromCenter(element.position);

				element.level = _level;


				radialDistribution.graphModel.push(element);



			});

			return;

		}


		// Dealing with parents


		var currentAngle = _startAngle;

		var angleDiff = (_endAngle - _startAngle) / data.length;


		_level++;


		data.forEach(function(element, index){

			element.startAngle = currentAngle;

			currentAngle += angleDiff;

			element.endAngle = currentAngle;

			element.angle = ( element.endAngle + element.startAngle ) / 2;

			element.position = calculateXYInRadius(element.angle, _level * _distanceFromParent);


			radialDistribution.graphModel.push(element);


			distributeAmong(element.values, element.startAngle, element.endAngle, _distanceFromParent, _level);


			element.values.forEach(function(child){

				child.parent = element;

			});

			element.level = _level;

		});

	}


	return radialDistribution;

};


// Based on Stephen G. Kobourov published chapter on Handbook of Graph Drawing and Visualization		
// edited by Roberto Tamassia, University of Arizona

VOne.ForceDirectedLayoutEngine = function(graph, config){

	config = config || { };

	this.averageForceUpdateThreshold = config.averageForceUpdateThreshold || 0.001;
	this.repulsion = config.repulsion || 0.5;
	this.springConstant = config.springConstant || 0.4;
	this.maxForce = config.maxForce || 40.0;
	this.edgeLength = config.edgeLength || 400;
	this.dampingFactor = config.dampingFactor || 0.1;

	this.setGraph(graph);
	
};




VOne.ForceDirectedLayoutEngine.prototype = {

	constructor: VOne.ForceDirectedLayoutEngine,


	setGraph: function(graph){

		this.graph = graph;
		this.graph.changed = true;
		this.randomNodePositions();

	},


	clearForces: function(){


		this.graph.nodes.forEach(function(node, index){

			node.force.set(0, 0, 0);

		});
		
	},



	addRepulsiveForces: function(nodeA, nodeB){

		var vectorAB = nodeA.getVector(nodeB);

		var scaledEdgeLength = vectorAB.length() / this.edgeLength;

		
		if (scaledEdgeLength < 0.01) 

			scaledEdgeLength = 0.01


		var scale = this.repulsion / (scaledEdgeLength * scaledEdgeLength);

		this.addForce(nodeA, vectorAB, -1 * scale);	

		this.addForce(nodeB, vectorAB, scale);
		
	},



	step: function(){

		this.doFDLStep();
		this.doFDLStep();

	},


	doFDLStep: function(){

		this.clearForces();

		var me = this;


		var nodes = this.graph.nodes;
		

		var graphLength = nodes.length;

		
		nodes.forEach(function(nodeA, index){
		
			for (var i = index + 1; i < graphLength; i++){

				var nodeB = nodes[i];

				me.addRepulsiveForces(nodeA, nodeB);		

			}

		});
		
		


		var edges = this.graph.edges;

		
		this.graph.edges.forEach(function(edge, index){

			me.addEdgeForces(edge);

		});


		
		this.updateNodePositions();


	},


	randomNodePositions: function(){

		var that = this;

		
		this.graph.nodes.forEach(function(node, index){

			node.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			node.position.normalize();
			node.position.multiplyScalar( Math.random() * that.edgeLength );

			node.update();

		});
	},


	addForce: function(node, vector, scalar){

		node.force.x = node.force.x + vector.x * scalar;
		node.force.y = node.force.y + vector.y * scalar;
		node.force.z = node.force.z + vector.z * scalar;

	},



	getAverageForce: function(){


		var graphTotalForce = 0;


		this.graph.nodes.forEach(function(node, index){

			graphTotalForce += node.force.length();

		});

		
		return graphTotalForce / this.graph.nodes.length;

	},



	addEdgeForces: function(edge){

		var originNode = edge.from;

		var targetNode = edge.to;

		var vectorAB = originNode.getVector(targetNode);

		var edgeLength = edge.defaultLength || this.edgeLength;

		var displacement = vectorAB.length() - edgeLength;


		if (displacement > 0.1){

			var scalar = this.springConstant * displacement;

			this.addForce(originNode, vectorAB, scalar);

			this.addForce(targetNode, vectorAB, -1 * scalar);

		}

	},



	updateNodePositions: function(){

		var me = this;


		this.graph.nodes.forEach(function(node, index){


			var forceLength = node.force.length();


			var force = node.force.clone();


			if (forceLength > me.maxForce) 

				forceLength = me.maxForce;
		

			force.normalize();

			
			force.multiplyScalar(forceLength * me.dampingFactor);

			
			node.position.add(force);


			node.update();
			
		});	



		this.graph.edges.forEach(function(edge, index){

			edge.update();

		});


	}

}

/**
* A directed graph model.
*
*
* @class VOne.Graph
* @constructor VOne.Graph
*
**/
VOne.Graph = function(){

	/**
	* An array conaining the graph nodes. 
	*
	* @property nodes
	* @type {VOne.GraphNode Array}
	* 
	**/
	this.nodes = [];

	/**
	* An array conaining the graph relations (edges). 
	*
	* @property edges
	* @type {VOne.GraphEdge Array}
	* 
	**/
	this.edges = [];


	/**
	* An associative array conaining the graph nodes by id. 
	*
	* @property nodeIdMap
	* @type {Object}
	* 
	**/
	this.nodeIdMap = {};


	this.nodeIdentifierMap = {};
	this.relationships = {};
	this.maxId = 0;

	/**
	* Center position for the graphic graph representation. 
	*
	* @property startingPosition
	* @type {THREE.Vector3}
	* 
	**/
	this.startingPosition = new THREE.Vector3(0,0,0);
	this.changed = false;

};



VOne.Graph.prototype = {

	constructor : VOne.Graph,
	

	/**
	* Adds a VOne.GraphNode to the graph model.
	*
	* @method addNode 
	* @param {VOne.GraphNode} node The node to be added to the model.
	**/
	addNode: function (node){

		this.nodes.push(node);

		this.nodeIdMap['n' + node.id] = node;

		if (node.identifier) 
			this.nodeIdentifierMap[node.identifier] = node;

		node.graph = this;

		this.maxId = Math.max(this.maxId, node.id);

		this.changed = true;

	},
	


	/**
	* Adds a VOne.GraphEdge to the graph model.
	*
	* @method addEdge 
	* @param {VOne.GraphEdge} edge The edge to be added to the graph model.
	**/
	addEdge: function (edge){

		this.edges.push(edge);

		edge.graph = this;

		this.changed = true;

		return edge;

	},
	
	
	/**
	* Searches for a VOne.GraphNode in the graph model.
	*
	* @method getNodeById 
	* @param {String} nodeId The VOne.GraphNode id.
	* @return {VOne.GraphNode} The VOne.GraphNode with the given id.
	**/
	getNodeById: function (id){

		return this.nodeIdMap['n' + id];

	},
	
	
	
	/**
	* Searches for a VOne.GraphEdge in the graph model.
	*
	* @method findEdge 
	* @param {VOne.GraphNode} souceNode The VOne.GraphNode edge source.
	* @param {VOne.GraphNode} targetNode The VOne.GraphNode edge target.
	* @return {VOne.GraphEdge} The VOne.GraphEdge that connects the given nodes.
	**/
	findEdge: function (sourceNode, targetNode){

		for (var i = 0; i < this.edges.length; i++){

			var edge = this.edges[i];

			if (edge.from == sourceNode && edge.to == targetNode){
				
				return edge;

			}

		}

		return false;

	},


	/**
	* Searches for a VOne.GraphNode in the graph model. If no node is found, creates a new VOne.GraphNode with the given id.
	*
	* @method findOrCreateNode 
	* @param {String} nodeId The VOne.GraphNode id to be found or created.
	* @return {VOne.GraphNode} The found or created VOne.GraphNode.
	**/
	findOrCreateNode: function(nodeId){

		var node = this.getNodeById(nodeId);

		if(!node){

			node = new VOne.GraphNode(nodeId);

			this.addNode(node);

		}


		

		return node;

	},


	/**
	* Searches for a VOne.GraphEdge in the graph model. If no edge is found, a new VOne.GraphEdge is created.
	*
	* @method findOrCreateEdge 
	* @param {VOne.GraphNode} sourceNode The edge's source VOne.GraphNode.
	* @param {VOne.GraphNode} targetNode The edge's target VOne.GraphNode.
	* @return {VOne.GraphEdge} The found or created VOne.GraphEdge.
	**/
	findOrCreateEdge: function(sourceNode, targetNode){

		var edge = this.findEdge(sourceNode, targetNode);

		if (edge) 
			return edge;


		edge = new VOne.GraphEdge(sourceNode, targetNode);

		this.addEdge(edge);

		return edge;

	},
	

	/**
	* Gets all the outgoing edges for a given VOne.GraphNode.
	*
	* @method getOutgoingEdges 
	* @param {VOne.GraphNode} node The node.
	* @return {[VOne.GraphEdge]} All outgoing edges from the given node.
	**/
	getOutgoingEdges: function(node){

		var outgoingEdges = [];

		this.edges.forEach(function(edge, index){

			if(edge.from == node && outgoingEdges.indexOf(edge) == -1){

				outgoingEdges.push(edge);

			}

		});

		return outgoingEdges;

	},

	
	/**
	* Gets all the incoming edges for a given VOne.GraphNode.
	*
	* @method getIncoming 
	* @param {VOne.GraphNode} node The node.
	* @return {[VOne.GraphEdge]} All incoming edges to the given node.
	**/
	getIncoming: function(node){

		var incomingEdges = [];

		this.edges.forEach(function(edge, index){

			if(edge.to == node && incomingEdges.indexOf(edge) == -1){

				incomingEdges.push(edge);

			}

		});

		return incomingEdges;

	},


	
	/**
	* Gets all the incoming and outgoing edges for a given VOne.GraphNode.
	*
	* @method getEdges 
	* @param {VOne.GraphNode} node The node.
	* @return {[VOne.GraphEdge]} All incoming and outgoing edges related to the given node.
	**/
	getEdges: function(node){

		var nodeEdges = [];

		this.edges.forEach(function(edge, index){

			if((edge.from == node || edge.to == node) && nodeEdges.indexOf(edge) == -1){

				nodeEdges.push(edge);

			}

		});

		return nodeEdges;
	},

	
	/**
	* Gets all the nodes with incoming edges.
	*
	* @method getTargetNodes 
	* @return {[VOne.GraphNode]} All nodes with incoming edges.
	**/
	getTargetNodes: function(){

		var targetNodes = [];

		this.nodes.forEach(function(node, index){

			if (node.isTarget()){

				targetNodes.push(node);

			}

		});

		return targetNodes;

	},


	/**
	* Gets all the nodes with outgoing edges.
	*
	* @method getSources 
	* @return {[VOne.GraphNode]} All nodes with outgoing edges.
	**/
	getSources: function(){
		var sources = [];
		$.each(this.nodes, function(index, node){
			if (node.isSource(node)){
				sources.push(node);
			}
		});
		return sources;
	},
	

	/**
	* Determines if a given node is a last target node (a node without outgoing edges).
	*
	* @method isLastTarget 
	* @return {Boolean} True if node is last target. False otherwise.
	**/
	isLastTarget: function(node){

		this.edges.forEach(function(edge, index){

			if (edge.from == node){

				return false;

			}

		});

		return true;
	},

	
	/**
	* Determines if a given node is a source node (a node without incoming edges).
	*
	* @method isSource 
	* @return {Boolean} True if node is source. False otherwise.
	**/
	isSource: function(node){

		this.edges.forEach(function(edge, index){

			if (edge.to == node){

				return false;

			}

		});

		return true;
	}

};

VOne.GraphBuilder = function(data, map){

	this.data = data;

	this.map = map || { };

}



VOne.GraphBuilder.prototype = {

	constructor: VOne.GraphBuilder,



	buildGraph: function() {

		var graph = new VOne.Graph();

		var idProperty = 'id';
		var targetIdProperty = 'id';

		if (this.map.id)
			idProperty = this.map.id;


		if (this.map.targetId)
			targetIdProperty = this.map.targetId;


		//Build nodes structure

		var nodeId;

		this.data.forEach(function(record, index){


			nodeId = record[idProperty];

			var node = new VOne.GraphNode(nodeId, graph);

			graph.addNode(node);


		});




		// Building relations

		this.data.forEach(function(record, index){

			var sourceNodeId = record[idProperty];


			record.friends.forEach(function(target, index){


				var targetNodeId = target[targetIdProperty];


				var sourceNode = graph.getNodeById(sourceNodeId);
				var targetNode = graph.getNodeById(targetNodeId);

				var edge = new VOne.GraphEdge(sourceNode, targetNode);

				graph.addEdge(edge);

			});

		});


		return graph;

	}

}


/**
* A directed graph model edge.
*
*
* @class VOne.GraphEdge
* @constructor VOne.GraphEdge
*
**/
VOne.GraphEdge = function(origin, target){

	this.from = origin;
	this.to = target;
	// this.relationship = relationship;
	// this.displayList = {};
	// this.subGraphs = {};
	// this.planes = [];

}


VOne.GraphEdge.prototype = {

	constructor: VOne.GraphEdge,


	getVector : function(){

		var vector = this.to.position.clone();
		vector.sub(this.from.position);
		return vector;

	},



	initNodePositions : function(startingPosition){

		if (this.to.atOrigin() && !this.from.atOrigin()){

			this.to.position.set(Math.random() + this.from.position.x,
								Math.random() + this.from.position.y,
								Math.random() + this.from.position.z);

		} else if (this.from.atOrigin() && !this.to.atOrigin()){

			this.from.position.set(Math.random() + this.to.position.x,
								Math.random() + this.to.position.y,
								Math.random() + this.to.position.z);

		} else if (startingPosition) {

			this.from.position.set(startingPosition.x, startingPosition.y, startingPosition.z);
			this.to.position.set(startingPosition.x, startingPosition.y, startingPosition.z)

		}

		this.graph.changed = true;

	},


	update: function(){


	}

};


/**
* A directed graph model node.
*
*
* @class VOne.GraphNode
* @constructor VOne.GraphNode
*
**/
VOne.GraphNode = function(nodeId){

	this.position = new THREE.Vector3(0, 0, 0);
	this.force = new THREE.Vector3(0, 0, 0);
	this.id = nodeId; 
	this.label = "node_x";
	this.graph = null;
	this.type = undefined;

};



VOne.GraphNode.prototype = {

	constructor: VOne.GraphNode,
 

	getVector: function(node){

		if(!node){

			console.log('no node');
			return;

		}

		var vector = node.position.clone();
		vector.sub(this.position);
		return vector;

	},


	atOrigin: function(){

		return this.position.x == 0 && this.position.y == 0 && this.position.z == 0;

	},
	

	getOutgoing: function(){

		return this.graph.getOutgoing(this);

	},
	

	getIncoming: function(){

		return this.graph.getIncoming(this);

	},
	

	getEdges: function(){

		return this.graph.getEdges(this);

	},


	
	getChildren: function(){

		var children = [];

		var outgoing = this.getOutgoing();

		outgoing.forEach(function(edge, index){

			if (children.indexOf(edge.to) == -1){

				children.push(edge.to);

			}

		});

		return children;
	},



	
	getParents: function(){

		var parents = [];

		var incoming = this.getIncoming();


		incoming.forEach(function(edge, index){

			var parent = edge.from;

			if (parents.indexOf(parent) == -1){

				parents.push(parent);

			}

		});


		return parents;
	
	},
	

	isSource: function(){

		return this.graph.isSource(this); 

	},

	
	isTarget: function(){

		return this.graph.isTarget(this); 

	},


	setLabel: function(label){

		this.label = label;

	},


	setType: function(type){

		this.type = type;

	},


	update: function(){

	}

};

/**
* Creates a series of points almost evenly distributed among a sphere surface.
*
* @method fibSphere
* @for VOne
*
* @param {number} pointsCount Number of points to draw
* @param {THREE.Vector3} startPosition Center of the sphere
* @param {number} radius Radius for the sphere
* @param {boolean} irregular If set to true, irregular-like distribution will be used.
*
* @return {Float32Array} An array of positions where x = index * 3, y = index * 3 + 1 and z = index * 3 + 2 (An array to be used as position attribute in a buffer geometry).
**/

VOne.fibSphere = function(pointsCount, startPosition, radius, irregular){

	var offset = 2 / pointsCount;

	var result = new Float32Array(pointsCount * 3);

	var x, y, z, phi, rFactor;

	var rnd = irregular ? Math.random() * pointsCount : 1;


	for(var i = 0; i < pointsCount; i++){

		y = ((i * offset) - 1) + offset / 2;

		rFactor = Math.sqrt(1 - y * y);

		phi = ((i + rnd) % pointsCount) * VOne.SphericalIncrementRatio;

		x = Math.cos(phi) * rFactor;

		z = Math.sin(phi) * rFactor;

		result[i * 3] = startPosition.x + x * radius;
		result[i * 3 + 1] = startPosition.y + y * radius;
		result[i * 3 + 2] = startPosition.z + z * radius;

	}

	return result;

};


/**
* Creates a circle packed layout based on calculating a tangent circle for two previus tangent circles.
*
* @method circlePackLayout
* @for VOne
*
* @param {Array} data The dataset to distribute.
*
* @param {Object} config Settings for generating the layout
* @param {string} config.childPropertyName The values property name to search for for each parent. Default is 'values'.
* @param {boolean} config.nestedData Indicates if data is nested. If set to true, childPropertyName must be set (unless child property name is 'values').
* @param {string} config.radiusPropertyName The name for the property that stores (or will store) the radius on each element. Default is 'radius';
* @param {function|number} config.setRadius A function that will receive each record from the data array for setting its corresponding center position. Must return a number. If not set, it's assumed that a radius property already exists.
* @param {string} config.positionPropertyName The name that will store the center position of each record. Default is 'center'.
* @param {number} config.centerX X position for the first element. Default is 0.
* @param {number} config.centerY Y position for the first element. Default is 0.
* @param {number} config.padding Distance between circles. Default is 0.
* @param {number} config.toleranceDistanceFactor Tolerance for meassuring distances between circles to prevent overlapping. Defaults to 0.001
**/

VOne.circlePackLayout = function(data, config){


	if(!Array.isArray(data)){

		console.error('Provided data must be an array!');
		return -1;

	}

	if(!config)
		config = { };


	var childPropertyName = config.childPropertyName || 'values';

	var recursive = config.nestedData || false;
	var setRadiusFor = config.setRadius || false;
	var radiusPropertyName = config.radiusPropertyName || 'radius';
	var positionPropertyName = config.positionPropertyName || 'center';
	var startX = config.centerX || 0;
	var startY = config.centerY || 0;
	var padding = config.padding || 0;
	var tolerance = config.toleranceDistanceFactor || 0.01;


	var distribute = function(_data, centerX, centerY){

		if(setRadiusFor){

			var isSetRadiusFn = 'function' === typeof setRadiusFor;

			_data.forEach(function(element) {

				element[radiusPropertyName] = isSetRadiusFn ? setRadiusFor(element) : setRadiusFor;

			});

		}


		if(Array.isArray(_data)){

			_data.sort(function(a, b) { return a[radiusPropertyName] < b[radiusPropertyName] ? -1 : a[radiusPropertyName] > b[radiusPropertyName] ? 1 : 0; });


			var currentCircle, x, y, angle = 0, currentPair = [], zeroToTargetRadii, lastAngle = 0, pos;

			x = centerX;
			y = centerY;

			_data[0][positionPropertyName] = new THREE.Vector3(x, y, 0);

			currentPair[0] = _data[0];

			if(recursive && childPropertyName in _data[0])
				distribute(_data[0][childPropertyName], x, y);




			if(_data.length > 1){


				x = centerX + _data[0][radiusPropertyName] + _data[1][radiusPropertyName] + padding;
				y = centerY;

				_data[1][positionPropertyName] = new THREE.Vector3(x, y, 0);

				currentPair[1] = _data[1];

				if(recursive && childPropertyName in _data[1])
					distribute(_data[1][childPropertyName], x, y);

			}



			if(_data.length > 2){


				var intersects, nextIndexToTry = 1, probableUseful;

				for(var i = 2; i < _data.length; i++){

					intersects = true;

					currentCircle = _data[i];

					probableUseful = i - 1;


					while(intersects){

						pos = getTangentCircle(currentPair[0], currentPair[1], currentCircle[radiusPropertyName] + padding);


						x = pos.x;
						y = pos.y;

						currentCircle[positionPropertyName] = new THREE.Vector3(x, y, 0);


						if(circleIntersects(currentCircle, _data, i-1, tolerance)){


							if(nextIndexToTry === i){

								probableUseful ++;
								nextIndexToTry = 1;

								if(probableUseful >= i - 1){
									probableUseful = 2;
								}

							}

							nextIndexToTry ++;

							currentPair[0] = _data[nextIndexToTry];
							currentPair[1] = _data[probableUseful];


						} else {

							intersects = false;

							currentPair[1] = currentCircle;

						}


					}


				 	if(recursive && childPropertyName in _data[i])
				 		distribute(_data[i][childPropertyName], x, y);


				}

			}



		}

	};



	var getTangentCircle = function(circle0, circle1, nextRadius){

		var positiveX = circle1[positionPropertyName].x >= circle0[positionPropertyName].x;
		var positiveY = circle1[positionPropertyName].y >= circle0[positionPropertyName].y;

		var dx, dy;

		var radii01 = circle1[radiusPropertyName] + circle0[radiusPropertyName];

		var angle01 = 0;
		var targetAngle = 0;

		var distance01 = circle0[positionPropertyName].distanceTo(circle1[positionPropertyName]);

		var targetRadii = circle0[radiusPropertyName] + nextRadius;


		if(positiveX){ // Determinating angle from 0 to 1

			if(positiveY){ //// 0 to 1 in first cuadrant
				dy = circle1[positionPropertyName].y - circle0[positionPropertyName].y;
				angle01 = Math.asin(dy / distance01);
			}

			else { // 0 to 1 in fourth cuadrant
				dx = circle1[positionPropertyName].x - circle0[positionPropertyName].x;
				angle01 = -Math.acos(dx / distance01);
			}

		} else {

			if(positiveY){ //// 0 to 1 in second cuadrant
				dx = circle1[positionPropertyName].x - circle0[positionPropertyName].x;
				angle01 = Math.acos(dx / distance01);
			}

			else{ // 0 to 1 in third cuadrant
				dy = circle1[positionPropertyName].y - circle0[positionPropertyName].y;
				angle01 = Math.PI - Math.asin(dy / distance01);
			}

		}

		var offsetDistance = 0;


		if(Math.abs(radii01 - distance01) > circle0[radiusPropertyName] * 0.02){

			var interDistance = distance01 - radii01;
			offsetDistance = interDistance / 2 * circle0[radiusPropertyName] / circle1[radiusPropertyName];

		}

		targetAngle = angle01 + Math.acos((circle0[radiusPropertyName] + offsetDistance) / targetRadii);

		var x = circle0[positionPropertyName].x + Math.cos(targetAngle) * targetRadii;
		var y = circle0[positionPropertyName].y + Math.sin(targetAngle) * targetRadii;

		return { x: x, y: y };


	};



	var circleIntersects = function(circle, circlesGroup, maxIndex, tolerance){

		maxIndex = maxIndex || circlesGroup.length - 1;
		tolerance = tolerance || 0.001;

		var toleranceFactor = 1 - tolerance;

		var distance01;


		for(var i = 0; i <= maxIndex; i++){

			if(circle !== circlesGroup[i]){

				distance01 = circle[positionPropertyName].distanceTo(circlesGroup[i][positionPropertyName]);


				if(distance01 * toleranceFactor < circle[radiusPropertyName] + padding){

					return true;

				}

			}

		}

		return false;

	};



	distribute(data, startX, startY);


};


/**
* Used to generate 'death spheres' (called like this due to death star is a copyrighted mark).
*
* @class VOne.DeathSphere
* @constructor VOne.DeathSphere
*
**/

VOne.DeathSphere = function(){

	this.type = 'VOne.DeathSphere';

};

VOne.DeathSphere.prototype.constructor = VOne.DeathSphere;


/**
*	Generates VOne.GeometryModels representing death spheres.
*
*	@method generate
*
*	@param {Array} data A nested array.
*	@param {Object} config An object containing configuration properties:
*	@param {string} config.childrenPropertyName The name of the children array property for each parent element. Default is 'values'.
*	@param {string} config.parentPropertyName The parents name property. Default is 'key'.
* 	@param {string} config.valueProperty The property name that stores each child and parent value to be used for width an height of every slice. If parents are missing this property, the sum of each child value property will be calculated. Default is 'totalValue'.
*	@param {number} config.marginDegrees Degrees to be left as margin in the sphere top and bottom. Default is 20.
*	@param {number} config.radius The sphere radius. Default is 500.
*	@param {number} config.segmentsResolution Number of segments to be used for each slice generated. Default is 32.
*
*	@return {Object} An object containing two VOne.GeometryModel objects. mainGeometryModel: contains the first level slices, secondaryGeometryModel: The second level slices. This geometry models have no mesh array property set.
**/
VOne.DeathSphere.prototype.generate = function(data, config, modelName){

	if(!Array.isArray(data)){

		console.error('An array must be provided to create a Death sphere.');
		return -1;

	}


	if(typeof modelName === 'undefined')
		modelName = 'deathSphere';



	var childrenPropertyName = config.childrenPropertyName || 'values';
	var parentPropertyName = config.parentPropertyName || 'key';
	var totalPropertyName = config.valueProperty || 'totalValue';
	var marginDegrees = config.marginDegrees || 20;
	var sphereRadius = config.radius || 500;
	var segmentsResolution = config.segmentsResolution || 32;


	var mainGeometries = [ ];
	var mainDataModel = [ ];

	var secondaryGeometries = [ ];
	var secondaryDataModel = [ ];


	var level0Total = 0;


	var calculateSphereSegmentPoints = function(startAngle, endAngle){

		var angleDiff = (endAngle - startAngle) * VOne.degToRad;
		var stopDiff = angleDiff / segmentsResolution;
		var points = [ ];
		var currentAngle = startAngle * VOne.degToRad;


		for(var i = 0; i <= segmentsResolution; i++){

			var x = sphereRadius * Math.cos(currentAngle);
			var y = sphereRadius * Math.sin(currentAngle);

			points.push(new THREE.Vector2(x, y));

			currentAngle += stopDiff;

		}

		return points;

	};



	calculateLevel0Total = function(){

		var total = 0;

		for(var i = 0; i < data.length; i++){

			total += data[i][totalPropertyName];

		}

		return total;

	};



	if(data[0][parentPropertyName] && data[0][parentPropertyName][totalPropertyName]){

		level0Total = data[0][parentPropertyName][totalPropertyName];

	} else {

		level0Total = calculateLevel0Total();

	}



	// 	****** 	Generating slices...  	******

	var currentStartAngle = 0;
	var currentEndAngle; //= mainSlicesAngleDiff * VOne.degToRad;
	var points, targetPhi;

	var vStartAngle = -90 + marginDegrees;
	var vEndAngle = 90 - marginDegrees;

	var totalVDistance = vEndAngle - vStartAngle;

	var recVStartAngle, recVEndAngle, vPoints, percent, mainMiddlePhi;


	for(var i = 0; i < data.length; i++){

		currentEndAngle = currentStartAngle + VOne.DoublePI * data[i][totalPropertyName] / level0Total;

		mainMiddlePhi = (currentStartAngle + currentEndAngle) / 2;


		points = calculateSphereSegmentPoints(vStartAngle, vEndAngle);

		targetPhi = currentEndAngle - currentStartAngle;



		data[i].geometry = new THREE.LatheGeometry(points, 32, currentStartAngle, targetPhi);

		data[i].middlePhi = mainMiddlePhi;


		mainGeometries.push(data[i].geometry);

		mainDataModel.push(data[i]);


		recVStartAngle = vStartAngle;


		for(var j = 0; j < data[i][childrenPropertyName].length; j++){


			percent = data[i][childrenPropertyName][j][totalPropertyName] / data[i][totalPropertyName];


			recVEndAngle = recVStartAngle + percent * totalVDistance;


			vPoints = calculateSphereSegmentPoints(recVStartAngle, recVEndAngle);

			data[i][childrenPropertyName][j].geometry = new THREE.LatheGeometry(vPoints, 12, currentStartAngle, targetPhi);


			data[i][childrenPropertyName][j].parentIndex = i;


			secondaryGeometries.push(data[i][childrenPropertyName][j].geometry);

			secondaryDataModel.push(data[i][childrenPropertyName][j]);


			recVStartAngle = recVEndAngle;

		}

		currentStartAngle = currentEndAngle;

	}


	var mainGeometryModel = new VOne.GeometryModel('main' + modelName, undefined, mainDataModel);

		mainGeometryModel.setGeometries(mainGeometries);

	var secondaryGeometryModel = new VOne.GeometryModel('secondary' + modelName, undefined, secondaryDataModel);

		secondaryGeometryModel.setGeometries(secondaryGeometries);


	return {
		mainGeometryModel: mainGeometryModel,
		secondaryGeometryModel: secondaryGeometryModel
	};


};


/**
* Creates a series of points almost evenly distributed among a partial cilinder surface.
*
* @method halfTube
* @for VOne
*
* @param {number} pointsCount Number of points to map
* @param {THREE.Vector3} center Center of the cilinder
* @param {Object} config
* @param {number} config.height Height of the cilinder. Default is 500.
* @param {number} config.radius Radius of the cilinder. Default is 1000;
* @param {number} config.startPhi Starting angle in degress of the partial cilinder. Default is 180.
* @param {number} config.endPhi Ending angle in degress of the partial cilinder. Default is 360.
* @param {number} config.pointsPerRow Points to draw for each row of points in the cilinder. Default is 12.
*
* @return {Float32Array} An array of positions where x = index * 3, y = index * 3 + 1 and z = index * 3 + 2 (An array to be used as position attribute in a buffer geometry).
**/
VOne.halfTube = function(pointsCount, center, config){

    pointsCount = pointsCount || 1000;

    center = center || { x: 0, y: 0, z: 0 };

    config = config || { };

    var height = config.height || 500;
    var radius = config.radius || 1000;
    var startPhi = config.startPhi || 180;
    var endPhi = config.endPhi || 360;
    var pointsPerRow = config.pointsPerRow || 12;


    var rows = Math.ceil(pointsCount / pointsPerRow);

    var dy = height / rows;

    if(startPhi > endPhi){

        var tmp = startPhi;

        startPhi = endPhi;

        endPhi = tmp;

    }


    var angleDiff = (endPhi - startPhi) / pointsPerRow * VOne.degToRad;

    var startAngle = startPhi * VOne.degToRad + angleDiff / 2;

    var currentAngle = startAngle;

    var currentY = center.y - height / 2;


    var positionArray = new Float32Array(pointsCount * 3);

    var x, z;


    for(var i = 1; i <= pointsCount; i++){

        var indx = i - 1;

        x = radius * Math.cos(currentAngle);

        z = radius * Math.sin(currentAngle);

        positionArray[indx * 3] = center.x + x;
        positionArray[indx * 3 + 1] = currentY;
        positionArray[indx * 3 + 2] = center.z + z;

        if(i % pointsPerRow !== 0 && i !== 0){

            currentAngle += angleDiff;

        } else {

            currentAngle = startAngle;
            currentY += dy;

        }

    }


    return positionArray;

};


/**
* Creates a spiral layout based on the Archimedes Spiral by assigning a position for each record in the provided data set.
*
* @method spiral
* @for VOne
*
* @param {Array} data The dataset to distribute.
*
* @param {Object} config Settings for generating the layout
* @param {Number} config.centerX The X center position. Default is 0.
* @param {Number} config.centerY The Y center position. Default is 0.
* @param {String} config.sizePropertyName The property name for each record. Default is radius. It can be set using config.setSize.
* @param {function || Number} config.setSize A function that can be used to set the radius for each element.<br/> ex: <br/>config: { ..., <br/> setSize: function(element, index) { <br/> return element.total * 6.66; <br/>}, <br/>... } <br/>
* @param {String} config.positionPropertyName The position property name where the result of each record in the data set will be stored.
* @param {Number} config.linearPadding Distance between elements along the spiral. Default is 0.
* @param {Number} config.radialPadding Padding applied each spiral cicle (proportional).
* @param {Number} config.z Z position for the spiral. Default is 0.
* @param {Bool} config.looseSpiral If set to true, padding params will be ignored and a loose spiral (Archimedes spiral) will be created.
* @param {Number} config.startRadius Initial radius (a margin radius at the center). Default is 0.
**/

VOne.spiral = function(data, config){

    config = config || { };
    var centerX = config.centerX || 0;
    var centerY = config.centerY || 0;
    var sizePropertyName = config.sizePropertyName || 'radius';
	var positionPropertyName = config.positionPropertyName || 'position';
    var setSize = config.setSize || false;
    var linearPadding = config.linearPadding || 0;
    var radialPadding = config.radialPadding || 0;
    var z = config.z || 0;
    var looseSpiral = config.looseSpiral || false;


    var lastRadius = config.startRadius || 0;;
    var lastSize = 0;
    var lastAngle = 0;

    var x, y, nextRadius, nextAngle;


    for(var i = 0; i < data.length; i++){

        if(setSize){

            if(typeof setSize === 'function') {
                data[i][sizePropertyName] = setSize(data[i], i);
            } else {
                data[i][sizePropertyName] = setSize;
            }

        }

        if(looseSpiral){

            nextRadius = lastRadius + data[i][sizePropertyName] * VOne.GoldenRatio;

        } else{

            nextRadius = lastRadius > 0 ? lastRadius + (2 * Math.pow(data[i][sizePropertyName], 2) + radialPadding) / Math.PI / lastRadius / 2 /** VOne.GoldenRatio*/ : data[i][sizePropertyName];

        }



        nextAngle = Math.atan((lastSize + data[i][sizePropertyName] + linearPadding) / lastRadius) + lastAngle;


        x = centerX + nextRadius * Math.cos(nextAngle);
        y = centerY + nextRadius * Math.sin(nextAngle);

        data[i][positionPropertyName] = new THREE.Vector3(x, y, z);

        lastSize = data[i][sizePropertyName];

        lastRadius = nextRadius;

        lastAngle = nextAngle;

    }

};


/**
* VOne geometry model. Allows to manage geometries' properties and interactions.
*
* @class VOne.GeometryModel
* @constructor VOne.GeometryModel
*
* @param {String} name A name to identify the model.
* @param {Object} 3DObject THREE.Points or [THREE.Mesh].
* @param {Array} [dataModel] An array of the data-model objects with properties for rendering them.
* @param {Object} [attributes] Buffer attributes for the graphical representation.
* @param {Float32Array} [attributes.size]
* @param {Float32Array} [attributes.color]
* @param {Float32Array} [attributes.position]

**/

VOne.GeometryModel = function(name, objs3D, dataModel, attributes) {


	this.type = 'GeometryModel';


	this.name = name + 'Nodes';

	/**
	* Datamodel array corresponding to the model.
	*
	* @property dataModel
	* @type {Array}
	*
	**/
	this.dataModel = dataModel;

	this.nodesAttributes = attributes;

	/**
	* THREE.Object3D array used on the scene.
	*
	* @property mesh
	* @type {Array}
	*
	**/
	this.mesh = objs3D;


	/**
	* THREE.Geometry array.
	*
	* @property geometries
	* @type {Array}
	*
	**/
	this.geometries = undefined;



	/**
	* Allows to define actions to be executed when a point cloud element is intersected.
	*
	* @method setInteraction
	*
	* @param {String} eventName The name of the event to react to (mouse over, mouse out, mouse click).
	* @param {Function} action The action to be executed when the corresponding event is triggered.
	*
	*/

	this.setInteraction = function(eventName, action) { this[eventName] = action ; }

}



VOne.GeometryModel.prototype = {

	constructor: VOne.GeometryModel,

	/**
	* Sets the geometries for this model.
	*
	* @method setGeometries
	*
	* @param {Array} geometries The geometries Array to be set.
	*
	**/
	setGeometries: function(geometries){

		this.geometries = geometries;

	}

}


VOne.Scenes = [ ];

/**
* Represents a BufferGeometry with its dataModel and attributes.
* @class VOne.BufferGeometryModel
* @constructor VOne.BufferGeometryModel
**/
VOne.BufferGeometryModel = function(dataModel){


	this.type = 'BufferGeometryModel';

	/**
	* Data model to be used with a THREE.BufferGeometry object.
	* @property dataModel
	* @type Array
	**/
	this.dataModel = dataModel;

	/**
	* Position array for its use in a THREE.BufferGeometry object.
	* @property positionArray
	* @type Float32Array
	**/
	this.positionArray = undefined;


	/**
	* Color array for its use in a THREE.BufferGeometry object.
	* @property colorArray
	* @type Float32Array
	**/
	this.colorArray = undefined;


	/**
	* Size array for its use in a THREE.BufferGeometry object.
	* @property sizeArray
	* @type Float32Array
	**/
	this.sizeArray = undefined;


	/**
	* Alpha array for its use in a THREE.BufferGeometry object.
	* @property alphaArray
	* @type Float32Array
	**/
	this.alphaArray = undefined;

	/**
	* The model BufferGeometry object.
	* @property geometry
	* @type THREE.BufferGeometry
	**/
	this.geometry = undefined;


	/**
	* Scene Object (THREE.Points o any other buffer geometry).
	* @property mesh
	* @type THREE.Points
	**/
	this.mesh = undefined;


	/**
	* Flag that indicates that some change is happening in the data model's values.
	*
	* @property animating
	* @type boolean
	**/
	this.animating = false;

};


VOne.BufferGeometryModel.prototype = {


	constructor: VOne.BufferGeometryModel,

	/**
	* Sets a position array for the model.
	*
	* @method setPositionArray
	* @param {Float32Array} positionArray The array to be used for geometries/points' position.
	**/
	setPositionArray: function(positionArray){

		this.positionArray = positionArray;

	},

	/**
	* Gets the position array from the model.
	*
	* @method getPositionArray
	* @return {Float32Array} The array to be used for geometries/points' position setting.
	**/
	getPositionArray: function(){

		return this.positionArray;

	},


	/**
	* Sets a color array for the model.
	*
	* @method setColorArray
	* @param {Float32Array} colorArray The array to be used for geometries/points' color setting.
	**/
	setColorArray: function(colorArray){

		this.colorArray = colorArray;

	},


	/**
	* Gets the color array from the model.
	*
	* @method getColorArray
	* @return {Float32Array} The array to be used for geometries/points' color setting.
	**/
	getColorArray: function(){

		return this.colorArray;

	},


	/**
	* Sets a size array for the model.
	*
	* @method setSizeArray
	* @param {Float32Array} sizeArray The array to be used for geometries/points' size.
	**/
	setSizeArray: function(sizeArray){

		this.sizeArray = sizeArray;

	},

	/**
	* Gets the size array from the model.
	*
	* @method getSizeArray
	* @return {Float32Array}  The array to be used for geometries/points' size setting.
	**/
	getSizeArray: function(){

		return this.sizeArray;

	},

	/**
	* Sets an alpha array for the model.
	*
	* @method setAlphaArray
	* @param {Float32Array} alphaArray The array to be used for geometries/points' alpha.
	**/
	setAlphaArray: function(alphaArray){

		this.alphaArray = alphaArray;

	},

	/**
	* Gets the alpha array from the model.
	*
	* @method getAlphaArray
	* @return {Float32Array} The array to be used for geometries/points' alpha setting.
	**/
	getAlphaArray: function(){

		return this.alphaArray;

	},


	/**
	* Sets the data model to be used with the other properties set.
	*
	* @method setDataModel
	* @param {Array} dataModel Data model.
	**/
	setDataModel: function(dataModel){

		this.dataModel = dataModel;

	},

	/**
	* Gets the data model.
	*
	* @method getDataModel
	* @return {Array} The data model.
	**/
	getDataModel: function(){

		return this.dataModel;

	},


	/**
	* Sets the Geometry to be used with the other properties set.
	*
	* @method setGeometry
	* @param {THREE.BufferGeometry} geometry The buffer geometry.
	**/
	setGeometry: function(geometry){

		this.geometry = geometry;

	},

	/**
	* Gets the geometry.
	*
	* @method getGeometry
	* @return {THREE.BufferGeometry} The model's geometry.
	**/
	getGeometry: function(){

		return this.geometry;

	},


	/**
	* Sets the Scene object (usually a THREE.Points) to be used with the other properties set.
	*
	* @method setMesh
	* @param {THREE.Points} geometry The buffer geometry scene object.
	**/
	setMesh: function(mesh){

		var model = this;

		mesh.getModel = function(){

			return model;

		};

		this.mesh = mesh;

	},



	/**
	* Gets the Scene object (usually a THREE.Points) to be used with the other properties set.
	*
	* @method getMesh
	* @return {THREE.Object3D} mesh/points The buffer geometry scene object.
	**/
	getSceneObject: function(){

		return this.mesh;

	},


	/**
	* Sets the animating flag which indicates that some change is happening in the data model's values.
	*
	* @method setAnimating
	* @param {boolean} animating Animating value.
	**/
	setAnimating: function(animating){

		this.animating = animating;

	},


	/**
	* Allows to define actions to be executed when a point cloud element is intersected.
	*
	* @method setInteraction
	*
	* @param {String} eventName The name of the event to react to (mouse over, mouse out, mouse click).
	* @param {Function} action The action(s) to be executed when the corresponding event is triggered. The function will receive two params. First one is the datamodel object corresponding to the intersected scene object, the second will be the datamodel object index. <br/><p>Example:</p><p>&emsp;geometryModel.setInteraction('onMouseOver', function(element, index){<br/> &emsp;&emsp;      // Do watever you want with the element and / or the model based on the index supplied.  <br/>&emsp;}); </p>
	*
	*/
	setInteraction: function(eventName, action) { this[eventName] = action ; }

};


/**
* Represents a BufferGeometry with its dataModel and attributes. Can handle partial rendering of the buffer geometry attributes.
* @class VOne.PreparedBufferGeometryModel
* @constructor VOne.PreparedBufferGeometryModel
* @extends VOne.BufferGeometryModel
* @param {int} maxVerticesNumber The max vertices amount that the geometry will handle. Values like NaN of Infinity can lead to disaster. Please use natural numbers.
* @param {Array} dataModel The dataModel objects array.
**/
VOne.PreparedBufferGeometryModel = function(maxVerticesNumber, dataModel){

	if(!maxVerticesNumber || 'number' !== typeof maxVerticesNumber)
		return new Error('Usage: new PreparedBufferGeometryModel(maxVerticesNumber, [dataModel]);');


	VOne.BufferGeometryModel.call(this, dataModel);


	this.type = 'PreparedBufferGeometryModel';

	/**
	* Max number of vertices that the BufferGeometry will be able to manage.
	* @property maxVerticesNumber
	* @type int
	**/
	this.maxVerticesNumber = maxVerticesNumber;



	/**
	* Function/value to be executed/applied for setting position values for the corresponding model element vertex.
	*
	* @property setPositionFor
	* @type function | THREE.Vector3
	**/
	this.setPositionFor = undefined;


	/**
	* Function/value to be executed/applied for setting color values for the corresponding model element vertex.
	*
	* @property setColorFor
	* @type function | THREE.Color
	**/
	this.setColorFor = undefined;


	/**
	* Function/value to be executed/applied for setting size value for the corresponding model element vertex.
	*
	* @property setSizeFor
	* @type function | float
	**/
	this.setSizeFor = undefined;


	/**
	* Function/value to be executed/applied for setting alpha value for the corresponding model element vertex.
	*
	* @property setAlphaFor
	* @type function | float
	**/
	this.setAlphaFor = undefined;


	this.setGeometry(new THREE.BufferGeometry());


};



VOne.PreparedBufferGeometryModel.prototype = Object.create(VOne.BufferGeometryModel.prototype);

VOne.PreparedBufferGeometryModel.prototype.constructor = VOne.PreparedBufferGeometryModel;


/**
* Sets a function or default value to set position for each model's element.
*
* @method setPosition
* @param {function || THREE.Vector3} f The method to set position for each model's element. Must return a THREE.Vector3 object.
**/
VOne.PreparedBufferGeometryModel.prototype.setPosition = function(f){

	this.setPositionFor = f;

	if(this.positionArray === undefined){

		this.positionArray = new Float32Array(this.maxVerticesNumber * 3);
		this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positionArray, 3));

	}

	return this;

};


/**
* Sets a function or default value to set the size for each model's element.
*
* @method setSize
* @param {function || float} f The method to set the size for each model's element. Must return a float value.
**/
VOne.PreparedBufferGeometryModel.prototype.setSize = function(f){

	this.setSizeFor = f;

	if(this.sizeArray === undefined){

		this.sizeArray = new Float32Array(this.maxVerticesNumber);
		this.geometry.addAttribute('size', new THREE.BufferAttribute(this.sizeArray, 1));

	}

	return this;

};


/**
* Sets a function or default value to set color for each model's element.
*
* @method setColor
* @param {function || THREE.Color} f The method to set the color for each model's element. Must return a THREE.Color object.
**/
VOne.PreparedBufferGeometryModel.prototype.setColor = function(f){

	this.setColorFor = f;

	if(this.colorArray === undefined){

		this.colorArray = new Float32Array(this.maxVerticesNumber * 3);
		this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));

	}

	return this;

};


/**
* Sets a function or default value to set the alpha value for each model's element.
*
* @method setAlpha
* @param {function || float} f The method to set the alpha for each model's element. Must return a float value.
**/
VOne.PreparedBufferGeometryModel.prototype.setAlpha = function(f){

	this.setAlphaFor = f;

	if(this.alphaArray === undefined){

		this.alphaArray = new Float32Array(this.maxVerticesNumber);
		this.geometry.addAttribute('alpha', new THREE.BufferAttribute(this.alphaArray, 1));

	}

	return this;

};


/**
* Sets the model to work with.
*
* @method setDataModel
* @param {Array} model The model to be set.
**/
VOne.PreparedBufferGeometryModel.prototype.setDataModel = function(model){

	if(model.length > this.maxVerticesNumber){

		console.warn('Providing a model larger than the max vertices number assigned can lead to unexpected and fatal behaviour.');

	}

	this.dataModel = model;

	return this;

};





/**
* Appends new records to the data model.
*
* @method appendRecords
* @param {Array} Records to be appended to the dataModel.
* @param {Boolean} processRecordsAfterAppend If set to true, the records will be processed using the provided methods for setting their position, color, size and/or alpha and the geometry will be updated.
**/
VOne.PreparedBufferGeometryModel.prototype.appendRecords = function(records, processAfterAppending){

	var willProcess = processAfterAppending || false;

	var previousOffset = this.dataModel.length;
	var newOffset = previousOffset + records.length;

	this.dataModel.extend(records);

	if(willProcess){

		this.processRecords(previousOffset, records.length);

	}

	return { previusModelSize: previousOffset, currentModelSize: newOffset };

};


/**
* Process the records in the data model by evaluating on each one the functions provided for setting position, size, color and/or alpha and updates the geometry with the results.
*
* @method processRecords
* @param {int} offset Starting record to process..
* @param {int} count The number of records to be processed starting from the provided offset.
**/
VOne.PreparedBufferGeometryModel.prototype.processRecords = function(offset, count){

	var startingRecord = offset || 0;
	var recordsToUpdate = count || this.dataModel.length;

	var endingRecord = recordsToUpdate + startingRecord;

	if(endingRecord > this.dataModel.length){

		endingRecord = this.dataModel.length - 1;

	}

	var record;

	for(var i = startingRecord; i < endingRecord; i++){

		record = this.dataModel[i];

		if(this.setPositionFor !== undefined){

			if('function' === typeof this.setPositionFor){

				record.position = this.setPositionFor(record, i);

			} else {

				record.position = this.setPositionFor;

			}

			this.positionArray[i * 3] = record.position.x;
			this.positionArray[i * 3 + 1] = record.position.y;
			this.positionArray[i * 3 + 2] = record.position.z;

		}


		if(this.setColorFor !== undefined){

			if('function' === typeof this.setColorFor){

				record.color = this.setColorFor(record, i);

			} else {

				record.color = this.setColorFor;

			}

			this.colorArray[i * 3] = record.color.r;
			this.colorArray[i * 3 + 1] = record.color.g;
			this.colorArray[i * 3 + 2] = record.color.b;

		}



		if(this.setSizeFor !== undefined){

			if('function' === typeof this.setSizeFor){

				record.size = this.setSizeFor(record, i);

			} else {

				record.size = this.setSizeFor;

			}

			this.sizeArray[i] = record.size;

		}



		if(this.setAlphaFor !== undefined){

			if('function' === typeof this.setAlphaFor){

				record.alpha = this.setAlphaFor(record, i);

			} else {

				record.alpha = this.setAlphaFor;

			}

			this.alphaArray[i] = record.alpha;

		}


	}



	if(this.setPositionFor !== undefined){

		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.computeBoundingSphere();

	}



	if(this.setColorFor !== undefined){

		this.geometry.attributes.color.needsUpdate = true;

	}



	if(this.setSizeFor !== undefined){

		this.geometry.attributes.size.needsUpdate = true;

	}



	if(this.setAlphaFor !== undefined){

		this.geometry.attributes.alpha.needsUpdate = true;

	}



	this.geometry.drawRange.count = this.dataModel.length;

};


/**
* Sets the number of records / vertices to be rendered.
*
* @method setGeometryDrawRangeCount
* @param {int} count Number of vertices to render.
**/
VOne.PreparedBufferGeometryModel.prototype.setGeometryDrawRangeCount = function(count){

	this.geometry.drawRange.count = count;

};


/**
* <p>A tool for creating data models with raw data types and generate position, color, size and alpha arrays to be used with a THREE.BufferGeometry.</p><p>The data model can be created from several records arrays. This is useful when working with partial data loads and/or large data sets.</p><p>Processing position, color, alpha and size setting functions and appending records to the data model is done in a separate background thread. Therefore the class name.</p>
* @class VOne.BackgroundModelGenerator
* @constructor VOne.BackgroundModelGenerator
* @extends VOne.PreparedBufferGeometryModel
* @param {int} recordsCount <p>The total records to be expected to manage. </p><p>This parameter will reserve the exact memory ammount to handle those records, no more. So, if you set this param to be smaller than your final recordset, you'll be troubled.</p>
* @param {Object} model <p>The properties model that each record will have and you'll need to use.</p><p>This param must have the following format: </p><p>&nbsp; &nbsp; { propertyName: array_type, propertyName: array_type ... propertyName: array_type } </p><p>where propertyName is the property name to use from each record and array type is one of the following list: </p><p><ul><li>Int8Array</li><li>Uint8Array</li><li>Uint8ClampedArray</li><li>Int16Array</li><li>Uint16Array</li><li>Int32Array</li><li>Uint32Array</li><li>Float32Array</li><li>Float64Array</li></ul></p><p>Each one of these array types must correspond to the type of the value expected for each field/property from the recordset. For more information about each one of these array types visit <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray">Typed arrays docs</a> </p>
* @param {int} recordsPartialDeliverCount Indicates the amount of records that will be passed to the background thread each time when working with multiple partial records loading. If not set, the recordsCount value will be used.
**/
VOne.BackgroundModelGenerator = function(recordsCount, model, recordsPartialDeliverCount){

	if(!recordsCount || !model){

		console.error('Must provide a valid records count value and a model to initialize! ej.:\n var mySuperModelGenerator = new VOne.BackgroundModelGenerator(howManyRecordsToHandle, { propertyName: \'property_type\', propertyName: \'property_type\' } );\n Check VOne documentation about valid property\'s types');

		return -1;

	}

	var that = this;


	this.maskedDataModel = [ ];

	this.modelKeys = Object.keys(model);

	this.rawData =  { };


	/**
	* Data model to be used with a THREE.BufferGeometry object. Updated each time that records are added via processRecords method.
	* @property dataModel
	* @type Proxy
	**/
	this.dataModel = undefined;


	VOne.PreparedBufferGeometryModel.call(this, recordsCount, this.dataModel);


	this.type = 'BackgroundModelGenerator';


	/**
	* Max number of records to manage.
	* @property recordsCount
	* @type int
	**/
	this.recordsCount = recordsCount;


	/**
	* Amount of records to send to the thread to process in case of two or more partial record loads.
	*
	* @property recordsPartialDeliverCount
	* @type int
	*/
	this.recordsPartialDeliverCount = recordsPartialDeliverCount || recordsCount;

	this.partialDeliver3Times = this.recordsPartialDeliverCount * 3;


	/**
	* The background thread program. Ideally you won't need to interact with or modify it.
	* @property worker
	* @type Worker
	**/
	this.worker = undefined;


	/**
	* String containing the script that should be used to set positions for each record. This is set via setPositionScript. This property has been exposed in case you need to set other than default behaviour for setting positions.
	* @property positionsProgram
	* @type String
	**/
	this.positionsProgram = undefined;


	/**
	* String containing the script that should be used to set color properties for each record. This is set via setColorScript. This property has been exposed in case you need to set other than default behaviour for setting colors.
	* @property colorsProgram
	* @type String
	**/
	this.colorsProgram = undefined;


	/**
	* String containing the script that should be used to set size properties for each record. This is set via setSizeScript. This property has been exposed in case you need to set other than default behaviour for setting sizes.
	* @property sizesProgram
	* @type String
	**/
	this.sizesProgram = undefined;


	/**
	* String containing the script that should be used to set alpha properties for each record. This is set via setAlphaScript. This property has been exposed in case you need to set other than default behaviour for setting alpha.
	* @property alphasProgram
	* @type String
	**/
	this.alphasProgram = undefined;




	this.modelKeys.forEach(function(key){

		switch(model[key]){

			case 'Int8Array':
				that.rawData[key] = new Int8Array(recordsCount);
				break;

			case 'Uint8Array':
				that.rawData[key] = new Uint8Array(recordsCount);
				break;

			case 'Uint8ClampedArray':
				that.rawData[key] = new Uint8ClampedArray(recordsCount);
				break;

			case 'Int16Array':
				that.rawData[key] = new Int16Array(recordsCount);
				break;

			case 'Uint16Array':
				that.rawData[key] = new Uint16Array(recordsCount);
				break;


			case 'Int32Array':
				that.rawData[key] = new Int32Array(recordsCount);
				break;

			case 'Uint32Array':
				that.rawData[key] = new Uint32Array(recordsCount);
				break;


			case 'Float32Array':
				that.rawData[key] = new Float32Array(recordsCount);
				break;

			case 'Float64Array':
				that.rawData[key] = new Float64Array(recordsCount);
				break;

		}


	});


	this.program = [

		"var model = { }, recordsPartialDeliverCount = " + this.recordsPartialDeliverCount + ';',

		"var dataModel_;",

		"var extras;",

		"var recordsCount_;",

		"function initModel(dataModel, recordsCount){",

			"dataModel_ = dataModel;",

			"var keys = Object.keys(dataModel);",

			"recordsCount_ = recordsCount;",

			"keys.forEach(function(key){",

				"switch(dataModel[key]){",

					"case 'Int8Array':",
						"model[key] = new Int8Array(recordsCount);",
						"break;",

					"case 'Uint8Array':",
						"model[key] = new Uint8Array(recordsCount);",
						"break;",

					"case 'Uint8ClampedArray':",
						"model[key] = new Uint8ClampedArray(recordsCount);",
						"break;",

					"case 'Int16Array':",
						"model[key] = new Int16Array(recordsCount);",
						"break;",

					"case 'Uint16Array':",
						"model[key] = new Uint16Array(recordsCount);",
						"break;",


					"case 'Int32Array':",
						"model[key] = new Int32Array(recordsCount);",
						"break;",

					"case 'Uint32Array':",
						"model[key] = new Uint32Array(recordsCount);",
						"break;",


					"case 'Float32Array':",
						"model[key] = new Float32Array(recordsCount);",
						"break;",

					"case 'Float64Array':",
						"model[key] = new Float64Array(recordsCount);",
						"break;",


					"default:",
						"if(dataModel[key].toLowerCase().indexOf('string') > -1){",
							"var lengthStartPos = dataModel[key].indexOf('(');",
							"var lengthEndPos = dataModel[key].indexOf(')');",
							"var strMaxLength = parseInt(dataModel[key].substr(lengthStartPos + 1, lengthEndPos - lengthStartPos - 1));",
							"model[key] = new Uint8Array(recordsCount * strMaxLength);",
						"}",
						"break;",

				"}",

			"});",

			"self.postMessage(model);",

		"};",

		"function stringToTypedArray(s) {",
		    "var escstr = encodeURIComponent(s);",
		    "var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {",
		        "return String.fromCharCode('0x' + p1);",
		    "});",
		    "var ua = new Uint8Array(binstr.length);",
		    "Array.prototype.forEach.call(binstr, function (ch, i) {",
		        "ua[i] = ch.charCodeAt(0);",
		    "});",
		    "return ua;",
		"}",

	];


	this.messengerProgramHead = [

		"self.onmessage = function(e){",

			"var data = e.data;",
			"switch(data.cmd){",


				"case 'initModel':",
					"initModel(data.dataModel, data.recordsCount);",
					"break;",

				"case 'processRecords':",
					"processRecords(data.records, data.offset);",
					"break;",

				"case 'getRecords':",
					"self.postMessage({ messageType: 'model', content: model });",
					"break;",

				"case 'setExtras':",
					"extras = data.extras;",
					"break;"

	];


	this.messengerProgramBody = [ ];


	this.messengerProgramTail = [

				"default:",
					"self.postMessage('Unrecognized command or command not yet implemented. sorry... =(');",
					"break;",

			"}",

		"}"


	];



	this.recordsCount3Times = this.recordsCount * 3;

	this.dataModelForWorker = model;

	this.drawRangeCurrentIndex = 0;


};


VOne.BackgroundModelGenerator.prototype = Object.create(VOne.PreparedBufferGeometryModel.prototype);


VOne.BackgroundModelGenerator.prototype.constructor = VOne.BackgroundModelGenerator;


/**
* Sets a function implementation which will assign a position for each dataset element.
*
* @method setPositionScript
* @param {String} positionScript The method to set position for each element on the dataset <string>in a string format</strong>. Must return an object with x, y and z properties. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setPositionScript("return { x: Math.random(), y: record.amount * 13, z: index * 666 } "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setPositionScript = function(positionProgram){

	this.positionsProgram = [ ];

	this.program.push('var positionArray = new Float32Array(' + this.partialDeliver3Times + '); var positionResult;' );

	this.program.push('var setPositionFunction = function(record, index) { ' + positionProgram + ' } ;');


	this.positionsProgram.push('positionResult = setPositionFunction(record, i);');

	this.positionsProgram.push('positionArray[j * 3] = positionResult.x');
	this.positionsProgram.push('positionArray[j * 3 + 1] = positionResult.y');
	this.positionsProgram.push('positionArray[j * 3 + 2] = positionResult.z');

	this.useSetPositionsProgram = true;


	this.messengerProgramBody.push("case 'getPositionArray':",
				"self.postMessage({ messageType: 'positionArray', content: positionArray });",
				"break;");


	this.positionArray = new Float32Array(this.recordsCount3Times);

	this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positionArray, 3));


	return this;

};


/**
* Sets a function implementation which will assign a color for each dataset element.
*
* @method setColorScript
* @param {String} colorScript The method to set position for each element on the dataset <string>in a string format</strong>. Must return an object with r, g and b properties where 0 < r, g, b <= 1. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setColorScript("return { r: Math.random(), g: record.amount * 13 / 66, z: index * 0.00666 } "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setColorScript = function(colorProgram){

	this.colorsProgram = [ ];

	this.program.push('var colorArray = new Float32Array(' + this.partialDeliver3Times + '); var colorResult;' );

	this.program.push('var setColorFunction = function(record, index){ ' + colorProgram + ' };');


	this.colorsProgram.push('colorResult = setColorFunction(record, i);');

	this.colorsProgram.push('colorArray[j * 3] = colorResult.r');
	this.colorsProgram.push('colorArray[j * 3 + 1] = colorResult.g');
	this.colorsProgram.push('colorArray[j * 3 + 2] = colorResult.b');


	this.useSetColorsProgram = true;


	this.messengerProgramBody.push("case 'getColorArray':",
				"self.postMessage({ messageType: 'colorArray', content: colorArray });",
				"break;");


	this.colorArray = new Float32Array(this.recordsCount3Times);

	this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));


	return this;

};


/**
* Sets a function implementation which will assign a color for each dataset element.
*
* @method setSizeScript
* @param {String} sizeScript The method to set position for each element on the dataset <string>in a string format</strong>. Must return an float value. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setSizeScript("return record.amount * index * 0.5; "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setSizeScript = function(sizeScript){

	this.sizesProgram = [ ];

	this.program.push('var sizeArray = new Float32Array(' + this.recordsPartialDeliverCount + '); var sizeResult;' );

	this.program.push('var setSizeFunction = function(record, index) { ' + sizeScript + ' };');


	this.sizesProgram.push('sizeResult = setSizeFunction(record, i);');

	this.sizesProgram.push('sizeArray[j] = sizeResult');

	this.useSetSizesProgram = true;


	this.messengerProgramBody.push("case 'getSizeArray':",
				"self.postMessage({ messageType: 'sizeArray', content: sizeArray });",
				"break;");


	this.sizeArray = new Float32Array(this.recordsCount);

	this.geometry.addAttribute('size', new THREE.BufferAttribute(this.sizeArray, 1));

	return this;

};


/**
* Sets a function implementation which will assign a color for each dataset element.
*
* @method setAlphaScript
* @param {String} alphaScript The method to set alpha for each element on the dataset <string>in a string format</strong>. Must return an float value where 0 < value <= 1. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setAlphaScript("return record.amount * index * 0.5; "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setAlphaScript = function(alphaScript){

	this.alphasProgram = [ ];

	this.program.push('var alphaArray = new Float32Array(' + this.recordsPartialDeliverCount + '); var alphaResult;' );

	this.program.push('var setAlphaFunction = function(record, index){ ' + alphaScript + ' };');


	this.alphasProgram.push('alphaResult = setAlphaFunction(record, i);');

	this.alphasProgram.push('alphaArray[j] = alphaResult');

	this.useSetAlphasProgram = true;


	this.messengerProgramBody.push("case 'getAlphaArray':",
				"self.postMessage({ messageType: 'alphaArray', content: alphaArray });",
				"break;");


	this.alphaArray = new Float32Array(this.recordsCount);

	this.geometry.addAttribute('alpha', new THREE.BufferAttribute(this.alphaArray, 1));

	return this;

},



/**
* Initializes the background thread with the provided scripts for processing the records and reserves the needed amount of memory for storing all the needed properties and records.
*
* @method init
*
**/
VOne.BackgroundModelGenerator.prototype.init = function() {

	var that = this;

	this.program.push(

		"var processRecords = function(records, offset){",

			"var finalIndex = records.length + offset;",

			"var record;",

			"var currentIndex = 0;",

			"var modelKeys = Object.keys(model);",

			"var j = 0;",

			"var strIndex;",

			"var toStore;",


			"for(var i = offset; i < finalIndex; i++, j++){",


				"record = records[currentIndex];",


				"modelKeys.forEach(function(key){",

					"if(dataModel_[key].toLowerCase().indexOf('string') === -1){",

						"model[key][currentIndex] = record[key];",

					"} else {",

						"strIndex = model[key].length / recordsCount_ * i",
						"toStore = stringToTypedArray(record[key])",

						"toStore.forEach(function (value, index) {",

							"model[key][strIndex + index] = value",

						" } );",

					"}",


				"});"

	);


	if(this.positionsProgram)
		this.program.push(this.positionsProgram.join('\n'));


	if(this.colorsProgram)
		this.program.push(this.colorsProgram.join('\n'));

	if(this.sizesProgram)
		this.program.push(this.sizesProgram.join('\n'));

	if(this.alphasProgram)
		this.program.push(this.alphasProgram.join('\n'));


	this.program.push(

				"currentIndex ++;",

			"}");


			if(this.positionsProgram || this.colorsProgram || this.sizesProgram || this.alphasProgram) {

				var message = [ ];
				var transferrables = [ ];

				var transferrablesCount = 0;

				this.program.push('self.postMessage({ messageType: \'transferrables\', offset: offset, finalIndex: finalIndex, transferrables: {  ');


				if(this.positionsProgram){

					message.push(transferrablesCount > 0 ? ', positionArray: positionArray' : 'positionArray: positionArray');

					transferrables.push( transferrablesCount > 0 ? ', positionArray.buffer' : 'positionArray.buffer');

					transferrablesCount++;

				}


				if(this.colorsProgram){

					message.push( transferrablesCount > 0 ? ', colorArray: colorArray' : 'colorArray: colorArray');

					transferrables.push( transferrablesCount > 0 ? ', colorArray.buffer' : 'colorArray.buffer');

					transferrablesCount++;

				}


				if(this.sizesProgram){

					message.push( transferrablesCount > 0 ? ', sizeArray: sizeArray' : 'sizeArray: sizeArray' );

					transferrables.push( transferrablesCount > 0 ? ', sizeArray.buffer' : 'sizeArray.buffer');

					transferrablesCount++;

				}


				if(this.alphasProgram){

					message.push( transferrablesCount > 0 ? ', alphaArray: alphaArray' : 'alphaArray: alphaArray' );

					transferrables.push ( transferrablesCount > 0 ? ', alphaArray.buffer' : 'alphaArray.buffer');

					transferrablesCount ++;

				}


				var modelKeys = Object.keys(this.rawData);

				modelKeys.forEach(function(key){

					message.push( transferrablesCount > 0 ? ', ' + key + ': model["' + key + '"]' : key + ': model["' + key + '"]');

					transferrables.push( transferrablesCount > 0 ? ', model["' + key + '"].buffer' : 'model["' + key + '"].buffer');

					transferrablesCount ++;

				});




				this.program.push(message.join(''), '} }, [', transferrables.join(''), ']);');


				this.program.push(this.positionsProgram ? 'positionArray = new Float32Array(' + this.partialDeliver3Times + ');' : '');


				this.program.push(this.colorsProgram ? 'colorArray = new Float32Array(' + this.partialDeliver3Times + ');' : '');


				this.program.push(this.sizesProgram ? 'sizeArray = new Float32Array(' + this.recordsPartialDeliverCount + ');' : '');


				this.program.push(this.sizesProgram ? 'alphaArray = new Float32Array(' + this.recordsPartialDeliverCount + ');' : '');


				this.program.push('initModel(dataModel_, ' + this.recordsPartialDeliverCount + ');');

			}


	this.program.push(

		"}"

	);


	this.program.push(this.messengerProgramHead.join('\n'));

	this.program.push(this.messengerProgramBody.join('\n'));

	this.program.push(this.messengerProgramTail.join('\n'));

	var text = this.program.join('\n');


	var workerBlob = new Blob([text]);


	var workerURL = window.URL.createObjectURL(workerBlob);

		this.worker = new Worker(workerURL);




		this.worker.onerror = function(e){

			console.log('Error from background model generator worker', 'ERROR: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);

		};


		this.worker.onmessage = function(e){

			var data = e.data;


			if(data.messageType)

    			switch (data.messageType){

    				case 'positionArray':
    					this.positionArray = data.content;
    					break;


					case 'colorArray':
						this.colorArray = data.content;
						break;

					case 'sizeArray':
						this.sizeArray = data.content;
						break;

					case 'alphaArray':
						this.alphaArray = data.content;
						break;

					case 'model':
						this.rawData = data.content;
						break;

					case 'transferrables':
						that.updateGeometryModelArrays(data.transferrables, data.offset, data.finalIndex);
						break;


					case 'info':
						console.log(data.content);
						break;


					default:
						console.log('Received the following message from background thread. But I don\'t know what to do with it: ', data.content);
						break;

    			}


		};


		this.worker.postMessage({ cmd: 'initModel', dataModel: this.dataModelForWorker, recordsCount: this.recordsPartialDeliverCount });

		return this;

};


/**
* Appends records to the thread's data model and processes them with the position, color, size and alpha script provided before initialization.
*
* @method processRecords
* @param {Array} records The array of records to be appended to the model.
* @param {offset} Initial position in the thread's array for the appended records.
*
**/
VOne.BackgroundModelGenerator.prototype.processRecords = function(records, offset){

	this.worker.postMessage({ cmd: 'processRecords', records: records, offset: offset });

};


/**
* Sets an extra object in the worker in case you need it for operations to set positions, colors, etc. It will be available as a variable named extras. Must be called after init() method.
*
* @method setExtrasForWorker
* @param {Object} extras An object to be available as 'extras'.
*
**/
VOne.BackgroundModelGenerator.prototype.setExtrasForWorker = function(extras){

	this.worker.postMessage({ cmd: 'setExtras', extras: extras });

};


VOne.BackgroundModelGenerator.prototype.updateGeometryModelArrays = function(data, offset, finalIndex){

	var that = this;

	if(data.positionArray){

		this.positionArray.set(data.positionArray, offset * 3);
		this.geometry.attributes.position.needsUpdate = true;

	}


	if(data.colorArray){

		this.colorArray.set(data.colorArray, offset * 3);
		this.geometry.attributes.color.needsUpdate = true;

	}


	if(data.sizeArray){

		this.sizeArray.set(data.sizeArray, offset);
		this.geometry.attributes.size.needsUpdate = true;

	}


	if(data.alphaArray){

		this.alphaArray.set(data.alphaArray, offset);
		this.geometry.attributes.alpha.needsUpdate = true;

	}



	this.modelKeys.forEach(function(key){

		that.rawData[key].set(data[key], offset);

	});



	this.dataModel = new Proxy(this.rawData, {

		get: function(target, name){

			var o = { };


			that.modelKeys.forEach(function(key){

				o[key] = that.rawData[key][name];

			});


			return o;

		},


	});



	this.setGeometryDrawRangeCount(finalIndex - 1);

	this.geometry.computeBoundingSphere();

};


VOne.BackgroundModelGenerator.prototype.typedArrayToString = function(ua) {
	var binstr = Array.prototype.map.call(ua, function (ch) {
		return String.fromCharCode(ch);
	}).join('');
	var escstr = binstr.replace(/(.)/g, function (m, p) {
		var code = p.charCodeAt(p).toString(16).toUpperCase();
		if (code.length < 2) {
			code = '0' + code;
		}
		return '%' + code;
	});
	return decodeURIComponent(escstr);
};


/**
*	Default images for VOne.
*/

VOne.DefaultImages = {

	star: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDRYtFjgycv0AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAABlNJREFUWMPll8uPHUcVxn9fdfd9zcy1PePYjj32YJkQDA5BipBAAqQIsQD+B1hlj8QCsOwBO0aILRJr/gZ2sIoILBAOcgSBxGAzNs68PO/7mn5U1WHRPQqRYo8HkRUlXfW93eqq36nz1XfOhf/nUV6G9ONcYL8PhYEBxwRu8MGzRxchfOZjAAjA+Ay4NsQWuBa4AJMKRtOgEfQGUJ6FcOF/BDA+CToF7W4dbZZDuQnpRXAJmCAD4gSsgGJQf5dA/82CG6dgdh7CPmgM4RLEk5BMAYIwAHYgeQjxC/U7ioAH5RDGwCboBUiOLJxPQvY50Kcg/A3sMugT4F4AdxlsHtwMOAfKIPszxFdAHaANZOAEtCBZPWIK7p6HcBluXvlhKgm+TWpmSIICz0O4+Z1feJYHxJ4RQ7PVl+rIGYDtgSU1YLAjpuDq1atpkiRpjLEDpGbWbq4kSeLNrDCz3DmXL37pludNKN+Bzp8g/BK0CbYMrINtAXtHALh+/XoqqRNCmJI0B8xIascY2wCSCmAMDM1sz8zGSZLk19593edvw9SvM2y3Ij4A7oO9X0Mkz7p4CKEDzAFnJC1IOg/MA6cknQSeA/pAJskBQVL47cmvxq//8c3Id19E7YKkVUFVo1rxDBpYXFxMQwgd59ycpHPAgpk9b2YnJXVr3RMlRTMbAbNAv9kdYoxeBT5kL6NouP4SzBWoD9p+BoAQQgocM7MzZrYg6ZKkeWAG6ACJpGBmE0nTZtYHus1975wrrr32A38rcT6ka9BeRVMFtYoOScHi4mJqZj1Jp4EFSZeAi8A5SReSJFlI0/RskiRzwJSZAbjmY2ZWNWD7b/ye+OqXN6KqVRjuY+u1Vxy2A2kz8WyT59OSTkg6n6bp+SzLprvdbpJlmZVlmY9Go+Pe+3sxxmBmBTAEHjvntiXlFvZQrIglyIPFZ/OBjnNu2sxONDAzaZqearVa/VarlfR6Paanpwkh9CTN7+3tjWOMI0nTTZp6Ztb23qfOP/JxPIFBLUJVhwDEGFMza5tZD2ibWSYpy7Ks2+v1XLfbZWZmhn6/j5kpz/POeDyeCyG8H2PMGo10JaWtVgu3u0ZcD7AG7IKNDwFoXM41gkrMLEoiTVM3NTWlfr9Pv9+n3W5TliVZlsk5125Sl9SGSyIplYR/6NEysAK2W9eRQwGccxEIDYwBeYyxcs5Zp9NRq9Wqa0RZUhSFxRgrMwvNySglBcCbGXoPbBPcNsRBrZCnAqRpSlVVhXNuImkMFMCkLMutwWAwnWVZq6oqnHPs7OwwGAyKsiy3gZzabvLmJHhJxKU693Fc23AcHS5C75zLJY3MbChpYmYT7/2DwWCQFUXxXKfTaccYyfM8L4piJca43Kh/BOxJ2m5OhNdj8AVoAtkQysEzAEgam9kmsC7p+EFey7L03vuNyWQyDbgQwgDYALaAXTN73PzelZRfe+uWt6LuC2xQi7C/VBvGE8fNmze9cy53zm1JWgX+ZWbrZrYjaS3GeC+E8K73/q/APWDtALaWGisxxr2qqnK3AbYBPICpO5AtfWA0Tx2SfFPl1swsacRZmdlsc8ycJBqh7QPbZrYCPDCztRjj6MbvfuZjAd13Ptrpnrz/l8C/ccP/9NUf5cCWmRFjLCTtA7OSOgdzmJkHBjHGbUkrzrmNEMJelmW+dQfc/hMCfGr7dQX8aUjm4ScLdVU0s46kY5JmgN5/BOGBiZkNzWwvSZKRc85//zc3PI+gt3xEgPASmIPqLHAOkgvAS/Dj21dTSR3nXAq0Y4xIwjkXQgi+EW5+bXjLH3Q/+TKc+OcRAEZfg/aF+mG1DW6uroHuZXCfbhNnr/D6z7+VSiKEcABQNy/fuOHjHYjvAatg66D3oXP/ydXuw5F/BfznBa/0CL2M5O4I+4vHCrASrAoQB1z93opPkxcxSzDbxKo/kExuowegEhQAgyRCMn56uf3wOAf6bIf4xSto6nns1G3i0jIaAttgux6mVnDuLYLtgFooPsZVf4fhkLDRdL8F2ATCBFw8AkBwQMvhOtOEdBYd79RuMYS4Buk0uGxMDHexzirC1f9QRkNsOaAVsJ3a7Tio+ztHAHC7EJf2sftv42b/AXfX0RbECOkWWAo+gM7t42ZyDGFlxHbqTtet1r0/ozp6RpB+E/jVRwP8G3R7eXmZvRtYAAAAAElFTkSuQmCC"

}

VOne.Shaders = {


	nodesCPS: {

		vertex: [

			
			'attribute vec3 color;',

			'attribute float size;',

			
			'varying vec3 vColor;',


			'void main() {',

				'vColor = color;',

				'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',

				'gl_PointSize = size * (600.0 / length( mvPosition.xyz ) );',

				'gl_Position = projectionMatrix * mvPosition;',

			'}'


		].join('\n'),


		fragment: [

			'uniform vec3 uniformsColor;',

			'uniform sampler2D texture;',
			
			'varying vec3 vColor;',

			'void main() {',

				'gl_FragColor = vec4( uniformsColor * vColor, 1.0 );',

				'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',

				
			'}'


		].join('\n')

	}


}

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


VOne.RenderersManager = {

    glRenderer: false,

    clock: new THREE.Clock(),

    scenesToRender : { },

    bgColor: 0x000000,

    bgAlpha: 1,

    canvas: undefined,

    addScene: function(scene, id){

        var sceneRendererType = scene.VOneData.rendererType;

        var startAnimation = false;

        if(Object.keys(VOne.RenderersManager.scenesToRender).length === 0){

            startAnimation = true;

        }

        if(scene.VOneData.rendererClass === THREE.WebGLRenderer){

            if(!VOne.RenderersManager.glRenderer){

                VOne.RenderersManager.canvas = document.createElement('canvas');

                VOne.RenderersManager.canvas.style.width = '100%';

                VOne.RenderersManager.canvas.style.height = '100%';

                VOne.RenderersManager.canvas.style.top = '0';

                VOne.RenderersManager.canvas.style.left = '0';

                VOne.RenderersManager.canvas.style.zIndex = '-1';

                VOne.RenderersManager.canvas.style.position = 'fixed';


                document.body.appendChild(VOne.RenderersManager.canvas);

                VOne.RenderersManager.scenesToRender.glRenderer = { scenes:  [ ] } ;

                VOne.RenderersManager.glRenderer = new THREE.WebGLRenderer({ canvas: VOne.RenderersManager.canvas, alpha: true, antialias: true });

                VOne.RenderersManager.glRenderer.setClearColor( VOne.RenderersManager.bgColor, VOne.RenderersManager.bgAlpha);
				VOne.RenderersManager.glRenderer.setPixelRatio( window.devicePixelRatio );

            }

            scene.VOneData.id = id;

            VOne.RenderersManager.scenesToRender.glRenderer.scenes.push(scene);

            scene.VOneData.renderer = VOne.RenderersManager.glRenderer;

            //var positionInfo = scene.VOneData.container.getBoundingClientRect();

            var containerWidth = parseInt(scene.VOneData.container.style.width.substr(0, scene.VOneData.container.style.width.indexOf('px')));

            var containerHeight = parseInt(scene.VOneData.container.style.height.substr(0, scene.VOneData.container.style.height.indexOf('px')));

            scene.VOneData.container.widthRelation = containerWidth / window.innerWidth;

            scene.VOneData.container.heightRelation = containerHeight / window.innerHeight;


            scene.onMouseMove = function( event ) {

    			// calculate mouse position in normalized device coordinates
    			// (-1 to +1) for both components

    			event.preventDefault();

                var boundingRect = event.target.getBoundingClientRect();

    			scene.mouse.x = ( event.offsetX / (boundingRect.width) ) * 2 - 1;
    			scene.mouse.y = - ( event.offsetY / (boundingRect.height) ) * 2 + 1;


    			scene.mouseOnScreen.x = event.offsetX;
    			scene.mouseOnScreen.y = event.offsetY;

    		};



    		scene.onMouseClick = function(event){


    			event.preventDefault();


    			if(scene.VOneData.INTERSECTED !== null){


    				model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];

    				if(typeof model.onClick === 'function'){


    					if(isBufferGeometry){

    						var element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

    						model.onClick(element, scene.VOneData.INTERSECTED);

    					} else {

    						model.onClick(intersectedInterestProperty);

    					}


    				}

    			}

    		};


        } else {

            if(!VOne.RenderersManager.scenesToRender.otherRenderer){

                VOne.RenderersManager.scenesToRender.otherRenderer = { scenes: [ ] };

            }

            VOne.RenderersManager.scenesToRender.otherRenderer.scenes.push(scene);

            scene.VOneData.renderer = new scene.VOneData.rendererClass({ alpha: true, antialias: true });

            scene.VOneData.renderer.setSize(scene.VOneData.containerDimensions.width, scene.VOneData.containerDimensions.height);

            scene.VOneData.container.appendChild(scene.VOneData.renderer.domElement);

        }

        scene.VOneData.renderer.sortObjects = true;

        if(scene.VOneData.rendererProperties){

            var rendererPropertiesKeys = Object.keys(scene.VOneData.rendererProperties);

            rendererPropertiesKeys.forEach(function(property){

                scene.VOneData.renderer[property] = scene.VOneData.rendererProperties[property];

            });

        }


        scene.VOneData.container.addEventListener( 'mousemove', scene.onMouseMove, false );

        scene.VOneData.container.addEventListener( 'click', scene.onMouseClick, false );




        if(startAnimation){

            VOne.RenderersManager.animate();

        }

    },


    removeSceneById: function(id){



    },


    updateRendererSize: function(){



    },

    animate: function(){

        requestAnimationFrame(VOne.RenderersManager.animate);

        // if(!scene.redererPaused)
        //     scene.render();

        VOne.RenderersManager.renderScenes();

    },


    renderScenes: function() {

        var keys = Object.keys(VOne.RenderersManager.scenesToRender);

        var delta = VOne.RenderersManager.clock.getDelta();

        for(var i = 0; i < keys.length; i++){

            var scenes = VOne.RenderersManager.scenesToRender[keys[i]].scenes;

            if(keys[i] === 'glRenderer'){

                var width = window.innerWidth;
        		var height = window.innerHeight;

        		if ( VOne.RenderersManager.canvas.width !== width || VOne.RenderersManager.canvas.height != height ) {

                    VOne.RenderersManager.scenesToRender.glRenderer.scenes.forEach(function(scene){

                        var windowProportion = scene.VOneData.containerDimensions ? scene.VOneData.containerDimensions.width / scene.VOneData.containerDimensions.height : width / height;

                        if(scene.VOneData.containerType === 'div' ){

                            var newWidth = scene.VOneData.container.widthRelation * width;
                            var newHeight = scene.VOneData.container.heightRelation * height;

                            scene.VOneData.container.style.width = newWidth + 'px';
                            scene.VOneData.container.style.height = newHeight + 'px';


                        }

                        scene.camera.aspect = windowProportion;
                	 	scene.camera.updateProjectionMatrix();

                    });

                    VOne.RenderersManager.glRenderer.setPixelRatio( window.devicePixelRatio );
                    VOne.RenderersManager.glRenderer.setSize( width, height, false );

        		}

                VOne.RenderersManager.glRenderer.setClearColor( VOne.RenderersManager.bgColor, VOne.RenderersManager.bgAlpha );
    			VOne.RenderersManager.glRenderer.setScissorTest( false );
    			VOne.RenderersManager.glRenderer.clear();
    			VOne.RenderersManager.glRenderer.setScissorTest( true );


                scenes.forEach(function(scene){

                    if(scene.visible){


                        if(scene.VOneData.interactiveObjects.length > 0){


        					scene.VOneData.raycaster.setFromCamera(scene.mouse, scene.camera);


        					var intersections = scene.VOneData.raycaster.intersectObjects(scene.VOneData.interactiveObjects);

                            var model, element;

                            //console.log(intersections);

        					if(intersections.length > 0){

                                //console.log(intersections[0]);

        						if(intersections[0].object.type === "Points"){

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


        						} else if(intersections[0].object.type === "Mesh") {

        							intersectedInterestProperty = intersections[0].object;

        							isBufferGeometry = false;


        						}


        						if(scene.VOneData.INTERSECTED != intersectedInterestProperty){


        							if(scene.VOneData.INTERSECTED !== null){


        								model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


        								if(typeof model.onMouseOut === 'function'){


        									if(isBufferGeometry){

        										element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

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

        									element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];


        									model.onMouseOver(element, scene.VOneData.INTERSECTED);


        								} else {

        									model.onMouseOver(intersectedInterestProperty);

        								}


        							}




        						}


        					} else {


        						if(scene.VOneData.INTERSECTED !== null){


        							model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


        							if(typeof model.onMouseOut === 'function'){


        								if(isBufferGeometry){

        									element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

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
        					scene.VOneData.controls.update(delta);


        				if(scene.VOneData.sceneManager.onRender.length > 0){

        					scene.VOneData.sceneManager.onRender.forEach(function(f){

        						f.fn(f.params);

        					});

        				}


                        var rect = scene.VOneData.container.getBoundingClientRect();

        				if ( rect.bottom > 0 || rect.top  < scene.VOneData.renderer.domElement.clientHeight ||
        					 rect.right  > 0 || rect.left < scene.VOneData.renderer.domElement.clientWidth ) {

            				// set the viewport
            				var width  = rect.right - rect.left;
            				var height = rect.bottom - rect.top;
            				var left   = rect.left;
            				var bottom = scene.VOneData.renderer.domElement.clientHeight - rect.bottom;

            				scene.VOneData.renderer.setViewport( left, bottom, width, height );
            				scene.VOneData.renderer.setScissor( left, bottom, width, height );


                			VOne.RenderersManager.glRenderer.setClearColor( scene.VOneData.bgColor, scene.VOneData.bgAlpha );
            				scene.VOneData.renderer.render(scene, scene.camera);

                        }

                    }

                });


            } else {

                scenes.forEach(function(scene){

                    if(scene.VOneData.controls)
    					scene.VOneData.controls.update(delta);


    				if(scene.VOneData.sceneManager.onRender.length > 0){

    					scene.VOneData.sceneManager.onRender.forEach(function(f){

    						f.fn(f.params);

    					});

    				}


    				scene.VOneData.renderer.render(scene, scene.camera);

                });


            }

        }


    }

};


/**
* Generates buffered geometries with color, position and size attributes from a provided data model.
* @class VOne.CPSBufferGeometriesGenerator
* @constructor VOne.CPSBufferGeometriesGenerator
**/
VOne.CPSBufferGeometriesGenerator = function(){


	var geometriesGenerator = { };


	/**
	* Generates the geometries from the provided model and atach them to the scene.
	*
	* @method generateGeometries
	*
	* @param {Object} config Config object
	* @param {boolean} config.interactive Indicates if the generated geometries will be interactive.
	* @param {boolean} config.hasRelations Indicates if elements will have relations with their corresponding parent.
	* @param {Function} config.elementZPos Function that will be processed to determine the z position for each element. Must return a Float number. By default returns a random number between 0 and 1000
	* @ @param {Function} config.elementSize A function that must return the size for the element. By default returns 250.
	* @param {Function} config.elementColor A method used to determine the element's color. By default returns 'pink'.
	* @param {Float} config.elementAlpha Elements alpha. Must have a value between 0 and 1.
	* @param {String} config.texturePath Path to an image to be used as texture for elements.
	* @param {Function} [config.relationsLinesColor] A function that must return an array with 2 values for collor for the corresponding relation lines. The first element of the array is equivalent to the elements vertex, the second one the color for the parent element vertex.
	* @param {Number} [config.relationsLineWidth] Line width for relations. Default is 0.5
	* @param {Number} [config.relationsLinesAlpha] Alpha for relations lines. Default is 0.9
	* @param {VOne.SceneManager} scene The scene to attach the generated Points geometry.
	* @param {Array} model An array containing model data.
	* @param {String} [name] The name for the generated geometry.
	*
	* @return {VOne.GeometryModel} The VOne.GeometryModel corresponding to the provided model.
	**/
	geometriesGenerator.generateGeometries = function(config, scene, model, name) {


		var interactive = config.interactive || 'false';

		var _dataModel = model;

		var hasRelations = config.hasRelations || false;

		var elementZPos = config.elementZPos || function(d){ return Math.random() * 1000; };

		var elementSize = config.elementSize ? ( typeof config.elementSize === 'function' ? config.elementSize : function(d){ return config.elementSize; } ) : function(d) { return 250; };

		var elementColor = config.elementColor ? ( typeof config.elementColor === 'function' ? config.elementColor : function(d){ return config.elementColor; } ) : function(d) { return 'pink';  };


		var elementAlpha = config.elementAlpha ?  config.elementAlpha  : .9;


		var relationsLinesColor;

		var relationsLineWidth;

		var relationsLinesAlpha;


		var relationsLines; 



		if(typeof _dataModel === 'undefined'){

			console.error('ERROR: A data model is required.');

			return;

		}


		if(hasRelations){

			relationsLines = new Float32Array(_dataModel.length * 6);

			relationsLinesColor = config.relationsLinesColor ? ( typeof config.relationsColor === 'function' ? config.relationsColor : function(d){ return config.relationsColor; }) : function(d) { return [ 0x777777, 0x777777 ]; };

			relationsLineWidth = config.relationsLineWidth || 0.5;

			relationsLinesAlpha = config.relationsLinesAlpha ? config.relationsLinesAlpha : 1;

		} 
		


		var positions = new Float32Array(_dataModel.length * 3);
		var sizes = new Float32Array(_dataModel.length);
		var colors = new Float32Array(_dataModel.length * 3);


		var bufferGeometry = new THREE.BufferGeometry();

		var relationsBufferGeometry;



		_dataModel.forEach(function(element, index){

			positions[index * 3] = element.position.x;
			positions[index * 3 + 1] = element.position.y;

			element.position.z = element.position.z || elementZPos(element);

			positions[index * 3 + 2] = !isNaN(element.position.z) ? element.position.z : 0;


			sizes[index] = elementSize(element);


			element.size = sizes[index];


			var color = new THREE.Color(elementColor(element));


			colors[index * 3] = color.r;
			colors[index * 3 + 1] = color.g;
			colors[index * 3 + 3] = color.b;


			element.color = color;


			if(hasRelations && element.parent){


				relationsLines[index * 6] = element.position.x;
				relationsLines[index * 6 + 1] = element.position.y;
				relationsLines[index * 6 + 2] = element.position.z;

				relationsLines[index * 6 + 3] = element.parent.position.x;
				relationsLines[index * 6 + 4] = element.parent.position.y;

				if(!element.parent.position.z) element.parent.position.z = elementZPos(element.parent);

				relationsLines[index * 6 + 5] = element.parent.position.z;

			}


		});


		
		var texture;


		var textureLoader = new THREE.TextureLoader();

			

		if(!config.texturePath){


			texture = textureLoader.load(VOne.DefaultImages.star);


		} else {

			texture = textureLoader.load(config.texturePath);
			
		}


		var bufferGeometryUniforms = {


			uniformsColor: { type: "c", value: new THREE.Color( 0xffffff ) },
			texture: { type: "t", value: texture }
			
		}; 




		var bufferGeometryMaterial = new THREE.ShaderMaterial({

			uniforms: bufferGeometryUniforms, 
			vertexShader: VOne.Shaders.nodesCPS.vertex,
			fragmentShader: VOne.Shaders.nodesCPS.fragment,

			blending: THREE.AdditiveBlending,
			depthTest: true,

			transparent: elementAlpha < 1 ? true : false,
			opacity: elementAlpha


		});



		bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
		bufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));



		var nodesPointCloud = new THREE.Points(bufferGeometry, bufferGeometryMaterial);


		nodesPointCloud.name = name + 'Nodes';


		scene.add(nodesPointCloud, nodesPointCloud.name);



		if(hasRelations){


			relationsBufferGeometry = new THREE.BufferGeometry();

			relationsBufferGeometry.addAttribute('position', new THREE.BufferAttribute(relationsLines, 3));

			var relationsMeshes = new THREE.Line( relationsBufferGeometry, new THREE.LineBasicMaterial( { lineWidth: relationsLineWidth, color: relationsLinesColor[0], transparent: true, opacity: relationsLinesAlpha }));


			relationsMeshes.name = name + 'Relations';

			scene.add(relationsMeshes, relationsMeshes.name);


		}


		var geometryModel = new VOne.GeometryModel(name, nodesPointCloud, _dataModel, bufferGeometry.attributes);


		return geometryModel;


	};
	


	var setPosition = function(position, animate){


		var _animate = animate || false;


		if(_animate){
		
			if(position.x)
				this.targetPosition.x = position.x;
	
			if(position.y)
				this.targetPosition.y = position.y;
	
			if(position.z)
				this.targetPosition.z = position.z;
		
		}


	}




	return geometriesGenerator;


}

VOne.GraphGeometriesGenerator = function(graph, textureMap){


	this.type = 'VOne.GeometriesGenerator';


	if(!graph){

		console.error('You must provide a VOne.graph.');

		return -1;

	}

	this.graph = graph;

	this.textureMap = textureMap || { default: { color: 'pink', scale: 10 } };


	this.geometries = [ ];

	this.relationsBufferGeometry = new THREE.BufferGeometry();

	this.relations = new Float32Array(graph.edges.length * 3);

	this.lineMaterial = new THREE.LineBasicMaterial( { linewidth: 0.1, color: 0xffffff, transparent: true, opacity: 0.8 } );

};



VOne.GraphGeometriesGenerator.prototype = {

	constructor: VOne.GraphGeometriesGenerator

}



VOne.GraphGeometriesGenerator.prototype.buildGeometries = function(argument){
	 

	var textures = { };

	var textureMap = this.textureMap;

	var textureLoader = new THREE.TextureLoader();

	var geometriesGenerator = this;


	var mapKeys = Object.keys(textureMap);



	mapKeys.forEach(function(key){

		var map;


		if(key.texturePath)
			map = textureLoader.load(textureMap[key].texturePath);

		else
			map = textureLoader.load(VOne.DefaultImages.star);



		var color = new THREE.Color(textureMap[key].color);


		textureMap[key].material = new THREE.SpriteMaterial( { map: map, color: color } );

	});




	this.graph.nodes.forEach(function(node){


		var nodeType = typeof node.type === 'undefined' ? 'default' : node.type;

		var sprite = new THREE.Sprite(textureMap[nodeType].material);

		sprite.position = node.position;

		sprite.scale.x = sprite.scale.y = sprite.scale.z = textureMap[nodeType].scale;

		node.sprite = sprite;


		node.update = function(){

			var position = node.position.clone();
			sprite.position.set(position.x, position.y, position.z);

		}


		geometriesGenerator.geometries.push(sprite);
		

	});



	this.graph.edges.forEach(function(edge, index){

		
		edge.update = function() {

			var sourcePosition = edge.from.position.clone();
			var targetPosition = edge.to.position.clone();

			geometriesGenerator.relations[index * 6] = sourcePosition.x;
			geometriesGenerator.relations[index * 6 + 1] = sourcePosition.y;
			geometriesGenerator.relations[index * 6 + 2] = sourcePosition.z;

			geometriesGenerator.relations[index * 6 + 3] = targetPosition.x;
			geometriesGenerator.relations[index * 6 + 4] = targetPosition.y;
			geometriesGenerator.relations[index * 6 + 5] = targetPosition.z;

			if(geometriesGenerator.relationsBufferGeometry.attributes.position)
				geometriesGenerator.relationsBufferGeometry.attributes.position.needsUpdate = true;

		}


		edge.update();


	});





	geometriesGenerator.relationsBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute (geometriesGenerator.relations, 3 ) );

	var lines = new THREE.LineSegments ( geometriesGenerator.relationsBufferGeometry, geometriesGenerator.lineMaterial);


	return { nodes: this.geometries, relations: lines };


};

/**
* Generates buffered geometries from a provided data model.
* @class VOne.GenericBufferGeometriesGenerator
* @constructor VOne.GenericBufferGeometriesGenerator
* @param {boolean} instancedBufferGeometry Determines if an instanced bufferGeometry will be used.
**/
VOne.GenericBufferGeometriesGenerator = function(instancedBufferGeometry){

	this.generator = { };

	this.generator.generateFromModel = function(){

		if(!this.model){

			throw new Error('A model is required to generate a points geometry. Use setModel(model) to set one.');
			return -1;

		}


		var generated = false;

		var bufferGeometryModel = instancedBufferGeometry ? new VOne.InstancedBufferGeometryModel(this.model) : new VOne.BufferGeometryModel(this.model) ;

		var elementsCount = this.model.length;

		var bufferGeometry = new THREE.BufferGeometry();


		if(typeof this.setPosition !== 'undefined'){

			var positionArray = new Float32Array(elementsCount * 3);

			var position;


			if(typeof this.setPosition === 'function'){

				for(var i = 0; i < elementsCount; i++){

					position = this.setPosition(this.model[i], i);

					this.model[i].position = position;

					positionArray[i * 3] = position.x;
					positionArray[i * 3 + 1] = position.y;
					positionArray[i * 3 + 2] = position.z;

				}

			} else {

				for(var i = 0; i < elementsCount; i++){

					position = this.setPosition;

					this.model[i].position = position;

					positionArray[i * 3] = position.x;
					positionArray[i * 3 + 1] = position.y;
					positionArray[i * 3 + 2] = position.z;

				}

			}

			bufferGeometryModel.setPositionArray(positionArray);

			bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));

			generated = true;

		}


		if(typeof this.setColor !== 'undefined'){

			var colorArray = new Float32Array(elementsCount * 3);

			var color;


			if(typeof this.setColor === 'function'){

				for(var i = 0; i < elementsCount; i++){

					color = this.setColor(this.model[i]), i;

					this.model[i].color = color;

					colorArray[i * 3] = color.r;
					colorArray[i * 3 + 1] = color.g;
					colorArray[i * 3 + 2] = color.b;

				}

			} else {

				for(var i = 0; i < elementsCount; i++){

					color = this.setColor;

					this.model[i].color = color;

					colorArray[i * 3] = color.r;
					colorArray[i * 3 + 1] = color.g;
					colorArray[i * 3 + 2] = color.b;

				}

			}

			bufferGeometryModel.setColorArray(colorArray);

			bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colorArray, 3));

			generated = true;

		}



		if(typeof this.setSize !== 'undefined'){


			var sizeArray = new Float32Array(elementsCount);

			var size;


			if(typeof this.setSize === 'function'){

				for(var i = 0; i < elementsCount; i++){

					size = this.setSize(this.model[i], i);

					this.model[i].size = size;

					sizeArray[i] = size;
					
				}

			} else {

				for(var i = 0; i < elementsCount; i++){

					size = this.setSize;

					this.model[i].size = size;

					sizeArray[i] = size;

				}

			}

			bufferGeometryModel.setSizeArray(sizeArray);

			bufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

			generated = true;

		}



		if(typeof this.setAlpha !== 'undefined'){


			var alphaArray = new Float32Array(elementsCount);

			var alpha;


			if(typeof this.setAlpha === 'function'){

				for(var i = 0; i < this.model.length; i++){

					alpha = this.setAlpha(this.model[i], i);

					this.model[i].alpha = alpha;

					alphaArray[i] = alpha;

				}

			} else {

				for(var i = 0; i < this.model.length; i++){

					alpha = this.setAlpha;

					this.model[i].alpha = alpha;

					alphaArray[i] = alpha;

				}

			}

			bufferGeometryModel.setAlphaArray(alphaArray);

			bufferGeometry.addAttribute('alpha', new THREE.BufferAttribute(alphaArray, 1));

			generated = true;

		}


		if(!generated){
			console.error('no geometry generated. Try setting position, color, size or alpha first.');
			return -1;
		}


		bufferGeometryModel.setGeometry(bufferGeometry);

		return bufferGeometryModel;


	}

};



VOne.GenericBufferGeometriesGenerator.prototype = {
	 
	constructor: VOne.GenericBufferGeometriesGenerator,

	/**
	* Sets the model to work with.
	*
	* @method setModel
	* @param {Array} model The model to be set.
	**/
	setModel: function(model){

		this.generator.model = model;
		return this;

	},

	/**
	* Sets a function or default value to set position for each model's element.
	*
	* @method setPosition
	* @param {function || THREE.Vector3} f The method to set position for each model's element. Must return a THREE.Vector3 object.
	**/
	setPosition: function(f){

		this.generator.setPosition = f;
		return this;

	},

	/**
	* Sets a function or default value to set color for each model's element.
	*
	* @method setColor
	* @param {function || THREE.Color} f The method to set the color for each model's element. Must return a THREE.Color object.
	**/
	setColor: function(f){

		this.generator.setColor = f;
		return this;

	},

	/**
	* Sets a function or default value to set the size for each model's element.
	*
	* @method setSize
	* @param {function || float} f The method to set the size for each model's element. Must return a float value.
	**/
	setSize: function(f){

		this.generator.setSize = f;
		return this;

	},

	/**
	* Sets a function or default value to set the alpha value for each model's element.
	*
	* @method setAlpha
	* @param {function || float} f The method to set the alpha for each model's element. Must return a float value.
	**/
	setAlpha: function(f){

		this.generator.setAlpha = f;
		return this;

	},

	/**
	* Generates the buffer geometry using the methods provided to set the geometry properties.
	*
	* @method generate
	* @return {VOne.BufferGeometryModel} A VOne.BufferGeometryModel with the properties provided set.
	**/
	generate: function(){

		return this.generator.generateFromModel();

	}

};

/**
* Generates line buffered geometries from a provided data model. 
* @class VOne.RelationshipBufferGeometriesGenerator
* @constructor VOne.RelationshipBufferGeometriesGenerator
**/
VOne.RelationshipBufferGeometriesGenerator = function(){

	this.generator = { };


	this.generator.generateFromModel = function(){


		if(!this.model){

			throw new Error('A model is required to generate a points geometry. Use setModel(model) to set one.');
			return -1;

		}

		var bufferGeometryModel = new VOne.BufferGeometryModel(this.model);


		var generated = false;


		var elementsCount = this.model.length;

		var bufferGeometry = new THREE.BufferGeometry();


		var elementsWithParentCount = 0;


		for(var i = 0; i < elementsCount; i++){

			if('parent' in this.model[i]){

				elementsWithParentCount++;

			}

		};


		if(elementsWithParentCount === 0){

			console.error('No element within the provided model has <parent> property.');
			return;

		}


		var positionArray = new Float32Array(elementsWithParentCount * 6);
		var colorArray, alphaArray;


		if(this.setColor){

			colorArray = new Float32Array(elementsWithParentCount * 6);

		}


		if(this.setAlpha){

			alphaArray = new Float32Array(elementsWithParentCount * 2);

		}



		var childElement, parentElement, childElementPosition, parentElementPosition, colors, alphas;



		for(var i = 0; i < elementsCount; i++){

			if('parent' in this.model[i]){

				childElement = this.model[i];
				parentElement = this.model[i].parent;

				childElementPosition = this.model[i].position.clone();
				parentElementPosition = this.model[i].parent.position.clone();

				positionArray[i * 6] = childElementPosition.x;
				positionArray[i * 6 + 1] = childElementPosition.y;
				positionArray[i * 6 + 2] = childElementPosition.z;

				positionArray[i * 6 + 3] = parentElementPosition.x;
				positionArray[i * 6 + 4] = parentElementPosition.y;
				positionArray[i * 6 + 5] = parentElementPosition.z;

				childElement.relationshipsFirstIndex = i * 6;
				parentElement.relationshipsFirstIndex = i * 6 + 3;



				if(this.setColor){

					if(typeof this.setColor === 'function'){

						colors = this.setColor(childElement);
						
						colorArray[i * 6] = colors[0].r;
						colorArray[i * 6 + 1] = colors[0].g;
						colorArray[i * 6 + 2] = colors[0].b;

						colorArray[i * 6 + 3] = colors[1].r;
						colorArray[i * 6 + 4] = colors[1].g;
						colorArray[i * 6 + 5] = colors[1].b;

					} else {

						colorArray[i * 6] = this.setColor[0].r;
						colorArray[i * 6 + 1] = this.setColor[0].g;
						colorArray[i * 6 + 2] = this.setColor[0].b;

						colorArray[i * 6 + 3] = this.setColor[1].r;
						colorArray[i * 6 + 4] = this.setColor[1].g;
						colorArray[i * 6 + 5] = this.setColor[1].b;

					}

				}


				if(this.setAlpha){

					if(typeof this.setAlpha === 'function'){

						alphas = this.setAlpha(childElement);

						alphaArray[i * 2] = alphas[0];
						alphaArray[i * 2 + 1] = alphas[1];

					} else {

						alphaArray[i * 2] = this.setAlpha[0];
						alphaArray[i * 2 + 1] = this.setAlpha[1];

					}

				}

			}

		};


		bufferGeometryModel.setPositionArray(positionArray);

		bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));



		if(this.setColor){

			bufferGeometryModel.setColorArray(colorArray);
			bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colorArray, 3));

		}


		if(this.setAlpha){

			bufferGeometryModel.setAlphaArray(alphaArray);
			bufferGeometry.addAttribute('alpha', new THREE.BufferAttribute(alphaArray, 1));

		}


		bufferGeometryModel.setGeometry(bufferGeometry);


		return bufferGeometryModel;

	}

}



VOne.RelationshipBufferGeometriesGenerator.prototype = {

	constructor: VOne.RelationshipBufferGeometriesGenerator,

	/**
	* Sets the model to work with.
	*
	* @method setDataModel
	* @param {Array} model The model to be set for generating the line geometries.
	**/
	setDataModel: function(model){

		this.generator.model = model;
		return this;

	},



	/**
	* Sets a function or default value for setting each line vertex color.
	*
	* @method setColor
	* @param {function || [THREE.Color, THREE.Color]} f The method to set the color for each model's element. Must return an array with two THREE.Color objects, the first one for the child vertex and the second for the parent vertex.
	**/
	setColor: function(f){

		this.generator.setColor = f;
		return this;

	},


	/**
	* Sets a function or default value to set the alpha value for each model's element.
	*
	* @method setAlpha
	* @param {function || [float, float]} f The method to set the alpha for each model's element. Must return an array with two float values, the first one for the child element vertex alpha, the second for the element's parent vertex alpha.
	**/
	setAlpha: function(f){

		this.generator.setAlpha = f;
		return this;

	},


	/**
	* Generates the geometry using the methods provided to set the model and color properties. The model' elements must have a <parent> property pointing to another element in the model. Elements without parent property are ignored.
	*
	* @method generate
	* @return {THREE.BufferGeometry} A THREE.BufferGeometry with the properties provided.
	**/
	generate: function(){

		return this.generator.generateFromModel();

	},

};



/**
* Generates pie slices' geometries.
*
* @class VOne.PieSlice
* @constructor VOne.PieSlice
*
*	@param {object} config
*	@param {float} config.startAngle
*	@param {float} config.endAngle
*	@param {float} config.innerRadius
*	@param {float} config.outerRadius
*	@param {float} config.height
*	@param {THREE.Color} config.color
*	@param {float} config.alpha
*   @param {boolean} config.angleInRadians
**/

VOne.PieSlice = function(config){

	var that = this;
	var startAngle = config.startAngle * (config.angleInRadians ? 1 : VOne.degToRad);
	var endAngle = config.endAngle * (config.angleInRadians ? 1 : VOne.degToRad);

	var color = config.color || new THREE.Color();


	this.shape = new THREE.Shape();
	this.alpha = config.alpha || 1;



	var startingCoords ={ x: Math.cos(startAngle) * config.innerRadius,
		y: Math.sin(startAngle) * config.innerRadius };

	var distantCoords = { x: Math.cos(endAngle) * config.outerRadius, y: Math.sin(endAngle) * config.outerRadius };


	this.shape.moveTo(startingCoords.x, startingCoords.y);
	this.shape.absarc(0, 0, config.innerRadius, startAngle, endAngle);
	//this.shape.lineTo(distantCoords.x, distantCoords.y);
	this.shape.absarc(0, 0, config.outerRadius, endAngle, startAngle, true);
	//this.shape.lineTo(startingCoords.x, startingCoords.y);


	this.createSliceBufferGeometry(config.height, color);

};



VOne.PieSlice.prototype.constructor = VOne.PieSlice;


VOne.PieSlice.prototype.calculateArcPoints = function(startAngle, endAngle, radius){

	return {

		startX: Math.cos(startAngle) * radius,
		startY: Math.sin(startAngle) * radius,
		midX: Math.cos((endAngle + startAngle) / 2) * radius ,
		midY: Math.sin((endAngle + startAngle) / 2) * radius ,
		endX: Math.cos(endAngle) * radius,
		endY: Math.sin(endAngle) * radius

	};

};



VOne.PieSlice.prototype.createSliceBufferGeometry = function(height, color){


	var extrudeSettings = {

    		amount: height,
    		bevelEnabled: false,
    		steps: 1,
    		curveSegments: 16,
    		dynamic: true

    	};



	this.sliceGeometry = new THREE.ExtrudeGeometry( this.shape, extrudeSettings );

	var facesCount = this.sliceGeometry.faces.length;

	var positions = new Float32Array(facesCount * 9);

	var normals = new Float32Array( facesCount * 9);

	var colors = new Float32Array(facesCount * 9);

	var alpha = new Float32Array(facesCount * 3);


	this.geometry = new THREE.BufferGeometry();


	var face;


	for(var i = 0; i < this.sliceGeometry.faces.length; i++){

		face = this.sliceGeometry.faces[i];

		positions[i * 9] = this.sliceGeometry.vertices[ face.a ].x;
		positions[i * 9 + 1] = this.sliceGeometry.vertices[ face.a ].y;
		positions[i * 9 + 2] = this.sliceGeometry.vertices[ face.a ].z;
		positions[i * 9 + 3] = this.sliceGeometry.vertices[ face.b ].x;
		positions[i * 9 + 4] = this.sliceGeometry.vertices[ face.b ].y;
		positions[i * 9 + 5] = this.sliceGeometry.vertices[ face.b ].z;
		positions[i * 9 + 6] = this.sliceGeometry.vertices[ face.c ].x;
		positions[i * 9 + 7] = this.sliceGeometry.vertices[ face.c ].y;
		positions[i * 9 + 8] = this.sliceGeometry.vertices[ face.c ].z;


		normals[i * 9] = face.normal.x;
		normals[i * 9 + 1] = face.normal.y;
		normals[i * 9 + 2] = face.normal.z;
		normals[i * 9 + 3] = face.normal.x;
		normals[i * 9 + 4] = face.normal.y;
		normals[i * 9 + 5] = face.normal.z;
		normals[i * 9 + 6] = face.normal.x;
		normals[i * 9 + 7] = face.normal.y;
		normals[i * 9 + 8] = face.normal.z;


		colors[i * 9] = color.r;
		colors[i * 9 + 1] = color.g;
		colors[i * 9 + 2] = color.b;
		colors[i * 9 + 3] = color.r;
		colors[i * 9 + 4] = color.g;
		colors[i * 9 + 5] = color.b;
		colors[i * 9 + 6] = color.r;
		colors[i * 9 + 7] = color.g;
		colors[i * 9 + 8] = color.b;

		alpha[i * 3] = this.alpha;
		alpha[i * 3 + 1] = this.alpha;
		alpha[i * 3 + 2] = this.alpha;


	}



	this.geometry.addAttribute( 'position', new THREE.BufferAttribute(positions, 3));
	this.geometry.addAttribute( 'normal', new THREE.BufferAttribute(normals, 3));
	this.geometry.addAttribute( 'color', new THREE.BufferAttribute(colors, 3));
	this.geometry.addAttribute( 'alpha', new THREE.BufferAttribute(alpha, 1));

	this.geometry.computeBoundingBox();

};


/**
* Returns the buffer geometry for generating a mesh.
*
* @method getGeometry
*
* @return {THREE.BufferGeometry} The buffer geometry to be used for generating a mesh.
**/
VOne.PieSlice.prototype.getGeometry = function(){

	return this.geometry;

};


/**
* Returns a points geometry for drawing surrounding pie slice lines.
*
* @method getEdgesGeometry
*
* @param {THREE.Color} color Edges color.
* @param {float} alpha Lines alpha.
*
* @return {THREE.EdgesGeometry} The buffer geometry to be used for generating edges.
**/
VOne.PieSlice.prototype.getEdgesGeometry = function(config){


	//var points = this.shape.createPointsGeometry();

	var color = config.color || new THREE.Color();

	var alpha = config.alpha || 1;


	var geometry = new THREE.EdgesGeometry(this.geometry);


	var verticesCount = geometry.attributes.position.count;

	var colorArray = new Float32Array(verticesCount * 3),
		alphaArray = new Float32Array(verticesCount);




	for(var i = 0; i < verticesCount; i++){

		colorArray[i * 3] = color.r;
		colorArray[i * 3 + 1] = color.g;
		colorArray[i * 3 + 2] = color.b;

		alphaArray[i] = alpha;

	}

	geometry.addAttribute('color', new THREE.BufferAttribute(colorArray, 3));
	geometry.addAttribute('alpha', new THREE.BufferAttribute(alphaArray, 1));

	return geometry;

};


/**
* Grab controls for a VOne.SceneManager. Allows to control a scene using Leap Motion controller. This can be used with any other controller designed for THREE.js. When a hand/object is detected, the default THREE.js controller will be disabled. Once no hand is present in the Leap Motion sensing area, the default THREE.js controller will be re-enabled.
*
* @class VOne.LeapGrabControls
* @constructor VOne.LeapGrabControls
*
* @param {VOne.SceneManager} scene The VOne.SceneManager containing the camera to control using the Leap Motion controller.
* @param {Object} config Options for configuring controls:
* @param {THREE.Object3D} config.objectToControl The object to control with the Leap Motion controller. Defaults to the camera from the provided scene.
* @param {number} config.panSpeed Acceleration for panning. Defult is 0.02.
* @param {number} config.rotationSpeed Acceleration for rotation. Default is 0.05.
* @param {number} config.zoomSpeed Acceleration for zooming. Work in progress... Do not use or do it at your own risk.
**/
VOne.LeapGrabControls = function(scene, config){

	if(!scene){

		console.error('No scene provided to VOne.LeapGrabControls. Can\'t start.');
		return -1;

	}

	this.config = config || { };

	var that = this;

	this.sceneManager = scene;

	var objectToControl = this.config.objectToControl || scene.camera;




	var panSpeed = this.config.panSpeed || 0.02;
	var rotationSpeed = this.config.rotationSpeed || 0.05;
	var zoomSpeed = this.config.zoomSpeed || 1;


	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();

	var rotationStart = new THREE.Vector2();
	var rotationEnd = new THREE.Vector2();

	var zoomChange = 1;

	var dampingFactor = 0.3;

	/**
	* Reference point which the controlled object will move around.
	*
	* @property {THREE.Vector3} target
	**/

	this.target = new THREE.Vector3();

	var minDistance = 0;
	var maxDistance = Infinity;


	/**
	* Flag indicating that a hand (or a pointing object) has been detected by Leap Motion controller..
	*
	* @property {boolean} pointingFlag
	**/
	this.pointingFlag = false;



	var rotating = false;

	var panning = false;

	var zooming = false;


	var leftHandOpen = false;

	var rightHandOpen = false;



	var useHelperDiv = this.config.useHelperDiv !== undefined ? this.config.useHelperDiv : true;

	var lmController;


	var eyeVector = new THREE.Vector3();

		eyeVector.subVectors( objectToControl.position, this.target );


	if(this.objectToControl)
		this.startControls();


	this.startControls = function(){

		console.info('starting leapmotion grab controls');

		if(useHelperDiv){

			var rightHandDiv = document.createElement('div');

				rightHandDiv.id = 'VOneRightHandDiv';

				rightHandDiv.style = 'position: fixed; right: 0; bottom: 0; width: 25%; height: 0; border: solid 1px #eee;';

			document.body.appendChild(rightHandDiv);


			var leftHandDiv = document.createElement('div');

				leftHandDiv.id = 'VOneLeftHandDiv';

				leftHandDiv.style = 'position: fixed; left: 0; bottom: 0; width: 25%; height: 0; border: solid 1px #eee;';

			document.body.appendChild(leftHandDiv);


		}




		lmController = new Leap.Controller({ enableGestures: true });
		lmController.setBackground(true);


		lmController.loop(function(frame){


			if(frame.hands.length > 0) {

				if(that.sceneManager.controls)
					that.sceneManager.controls.enabled = false;

				pointingFlag = true;

				var previousFrame = lmController.frame(1);


				for (var i = 0; i < frame.hands.length; i++){


					var hand = frame.hands[i];

					var state;



					if(hand.grabStrength === 1){
						state = 'closed';
					} else {
						state = 'open';
					}


					var type = hand.type;

					if(type === 'right') {

						var rightHandPosition = hand.translation(previousFrame);


						//	*****	RIGHT HAND IS OPEN 	*****	//

						if(state === 'open'){


							if(useHelperDiv)
								rightHandDiv.style.borderColor = "green";


							if(!leftHandOpen){

								panStart.setX(rightHandPosition[0]);
								panStart.setY(rightHandPosition[1]);

								panEnd.copy(panStart);


							}


							rightHandOpen = true;

							panning = false;


						} else { 	//	*****	RIGHT HAND IS CLOSED 	*****	//

							if(useHelperDiv)
								rightHandDiv.style.borderColor = "yellow";


							leftHandOpen = false;

							panEnd.setX(rightHandPosition[0]);
							panEnd.setY(rightHandPosition[1]);


							panning = true;


						}



						//	*****	only one hand is present 	*****  //

						if(frame.hands.length === 1){

							leftHandDiv.style.borderColor = '#eee';
							rightHandOpen = false;
							zooming = false;

						}



					} else {


						var leftHandPosition = hand.translation(previousFrame);


						//	*****	LEFT HAND IS OPEN 	*****	//

						if(state === 'open'){

							if(useHelperDiv)
								leftHandDiv.style.borderColor = "green";


							if(!leftHandOpen){

								rotationStart.setX(leftHandPosition[0]);
								rotationStart.setY(leftHandPosition[1]);

								rotationEnd.copy(rotationStart);

							}


							leftHandOpen = true;

							rotating = false;

						} else {	//	*****	LEFT HAND IS CLOSED 	*****	//

							if(useHelperDiv)
								leftHandDiv.style.borderColor = "yellow";


							rotationEnd.setX(leftHandPosition[0]);
							rotationEnd.setY(leftHandPosition[1]);


							leftHandOpen = false;

							rotating = true;

						}



						//	*****	only one hand is present 	*****  //

						if(frame.hands.length === 1){

							rightHandDiv.style.borderColor = '#eee';
							leftHandOpen = false;
							zooming = false;

						}

					}

				}


				if(rightHandOpen && leftHandOpen){

					if(frame.scaleFactor(previousFrame) > 1.5){

						zoomChange = 1;

					} else {

						zoomChange = frame.scaleFactor(previousFrame);
						zooming = true;
					}


				}

				else{

					zooming = false;

				}

				//	*****	adjusting objectToControl 	*****	//

				update();



			} else {	//	***** NO HAND IS PRESENT 	*****	//

				leftHandDiv.style.borderColor = '#eee';
				rightHandDiv.style.borderColor = '#eee';
				leftHandOpen = false;
				rightHandOpen = false;

				pointingFlag = false;

				if(that.sceneManager.controls){
					that.sceneManager.controls.enabled = true;
					//that.sceneManager.controls.reset();
				}

			}

		});


	};


	var rotate = (function() {

		var axis = new THREE.Vector3(),
			quaternion = new THREE.Quaternion(),
			eyeDirection = new THREE.Vector3(),
			objectUpDirection = new THREE.Vector3(),
			objectSidewaysDirection = new THREE.Vector3(),
			moveDirection = new THREE.Vector3(),
			angle;

		return function rotate() {

			moveDirection.set(rotationEnd.x, rotationEnd.y, 0);

			angle = moveDirection.length();


			if(angle){

				eyeVector.copy(objectToControl.position).sub(that.target);

				eyeDirection.copy(eyeVector).normalize();

				objectUpDirection.copy(objectToControl.up).normalize();

				objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();

				objectUpDirection.setLength(rotationEnd.y);
				objectSidewaysDirection.setLength(rotationEnd.x);

				moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));

				axis.crossVectors(moveDirection, eyeVector).normalize();


				angle *= rotationSpeed;

				quaternion.setFromAxisAngle(axis, angle);

				eyeVector.applyQuaternion(quaternion);

				objectToControl.up.applyQuaternion(quaternion);

			}

		};

	}());




	var pan = (function() {

		var handTranslationChange = new THREE.Vector2();
		var objectToControlUp = new THREE.Vector3();
		var panVector = new THREE.Vector3();


		return function pan(){

			eyeVector.subVectors(objectToControl.position, that.target);


			handTranslationChange.copy(panEnd);



			handTranslationChange.multiplyScalar(eyeVector.length() * panSpeed);


			panVector.copy(eyeVector).cross(objectToControl.up).setLength(handTranslationChange.x);

			panVector.add(objectToControlUp.copy(objectToControl.up).setLength(-handTranslationChange.y));



			objectToControl.position.add(panVector);

			that.target.add(panVector);

		};


	}() );



	var zoom = function(){

		var zoomFactor = 2 - zoomChange;

		eyeVector.multiplyScalar(zoomFactor);


	};



	function update(){


		if(rotating)
			rotate();

		if(panning)
			pan();

		if(zooming)
			zoom();



		objectToControl.position.addVectors(that.target, eyeVector);

		if(eyeVector.lengthSq() > Math.pow(maxDistance,2)){
		//
			//console.log('used max distance');
			objectToControl.position.addVectors(that.target, eyeVector.setLength(maxDistance));
			//
			}
			//
			//
		if(eyeVector < Math.pow(minDistance, 2)){
			//
			//console.log('using min distance');
			objectToControl.position.addVectors(that.target, eyeVector.setLength(minDistance));
		//
		}


		objectToControl.lookAt(that.target);

	}


	this.startControls();

};




VOne.LeapGrabControls.prototype = {

	constructor: VOne.LeapGrabControls

};


/**
* Adds a class to a THREE.JS mesh object by extending it's functionality.
*
* @method addClass
* @for THREE.Mesh
* @param {String} className A name to be attached as class name for a mesh.
**/
THREE.Mesh.prototype.addClass = function(className){

	if(typeof(this.classes) === 'undefined')
		this.classes = [ ];


	if(this.classes.indexOf(className !== -1))
		this.classes.push(className);

	return this.classes;

};


/**
* Removes a class from a THREE.JS mesh object by extending it's functionality.
*
* @method removeClass
* @for THREE.Mesh
* @param {String} className The class name to be removed from a mesh.
**/
THREE.Mesh.prototype.removeClass = function(className){

	if(typeof(this.classes) === 'undefined')
		return -1;

	var pos = this.classes.indexOf(className);

	if(pos > -1){

		this.classes.splice(pos, 1);

	}

	return this.classes;

};


function toRadians(angle) {
	return angle * VOne.degToRad;
}


function loadJSON(path, callback) {

    var xobj = new XMLHttpRequest();

        xobj.overrideMimeType("application/json");

	    xobj.open('GET', path, true);

	    xobj.onreadystatechange = function () {
	         if (xobj.readyState == 4 && xobj.status == "200") {

            	callback(xobj.responseText);

        	}

    	};

    xobj.send(null);

 }


 function calculateXYInRadius(angle, radius){


    var angleInRadians = toRadians(angle);

    return { x: Math.cos(angleInRadians) * radius,
            y: Math.sin(angleInRadians) * radius
        };

 }


function getAngleInDegreesFromCenter(position){

    var angleDeg = Math.atan2(position.y, position.x) * VOne.radToDeg;

    return angleDeg;

}




 function randomCoordsInRadius(r, uniform) {

    //r = r || 1000;

    var a = Math.random(),
        b = Math.random();

    if (uniform) {
        if (b < a) {
            c = b;
            b = a;
            a = c;
        }
    }

    return { x: b * r * Math.cos( 2 * Math.PI * a / b ), y: b * r * Math.sin( 2 * Math.PI * a / b ) };

}


function nearestPow2(val){
  return Math.pow(2, Math.round(Math.log(val) / Math.log(2) ));
}


function randomCoordsInCircle(r, uniform) {

    r = r || 100;

    var a = Math.random(),
        b = Math.random();

    if (uniform) {
        if (b < a) {
            c = b;
            b = a;
            a = c;
        }
    }

    return [b * r * Math.cos( 2 * Math.PI * a / b ), b * r * Math.sin( 2 * Math.PI * a / b )];
}


function randomCoordsInSphere(r, uniform){

	var u = Math.random();
   	var v = Math.random();

	if (uniform) {
		if (v < u) {
			w = v;
			v = u;
			u = w;
		}
	}

	var theta = VOne.DoublePI * u;
	var phi = Math.acos(2 * v - 1);
	var x = r * Math.sin(phi) * Math.cos(theta);
	var y = r * Math.sin(phi) * Math.sin(theta);
	var z = r * Math.cos(phi);

	return [x,y,z];

}


Array.prototype.extend = function (other_array) {
    other_array.forEach(function(v) {this.push(v); }, this);
};


/**
* Selector for meshes added to a THREEJS scene via the @SceneManager.
* 
* @method select
* @for VOne
* @param {String} selectOptions <p>The mesh(es) name(s) to be searched for. If the mesh of interest has set the <strong>name</strong> property, a '#' sign must be prepended. To search by the name assigned to the mesh when it was added to the scene via the @SceneManager, the selectOption must be prepended by underscore. If a class has been assigned to the mesh of interest, the selectOptions must be prepended by dot. </p><p>Example:<br/>var whiteDotMeshes = VOne.select('.whiteDot'); </p><p> will return an object containing all the meshes that matches the class 'whiteDot'. Also, the oject will contain methods for setting position and scale animation options.</p>
* @return {VOne.Selection} VOne.Selection Object containing all the meshes that matched the select options.
**/
VOne.select = function(selectOptions){


	var selection = new VOne.Selection();

	
	var that = this;

	var SEARCH_TYPES = [ 'meshNameProperty', 'childNameProperty', 'meshClassName'  ];


	var searchType = 0;
	var searchTermSubIndex = 1;


	var searchDefineChar = selectOptions.charAt(0);


	switch (searchDefineChar) {

		case '#':
			searchType = VOne.MeshNameProperty;
			break;

		case '_':
			searchType = VOne.ChildNameProperty;
			break;

		case '.':
			searchType = VOne.MeshClassName;
			break;

		default:
			searchType = VOne.ChildNameProperty;
			searchTermSubIndex = 0;
			break;

	}

	

	var searchTerm = selectOptions.substr(searchTermSubIndex);


	var smCount = VOne.Scenes.length;



	for(var i = 0; i < smCount; i++){

		var objectsInScene = VOne.Scenes[i].getSceneObjects();


		if(searchType === VOne.ChildNameProperty){

			if(typeof objectsInScene[searchTerm] !== undefined)
				selection.selected.push(objectsInScene[searchTerm]);


		} else {

			var keys = Object.keys(objectsInScene);


			for(var j = 0; j < keys.length; j++){


				if(Array.isArray(objectsInScene[keys[j]])){

					objectsInScene[keys[j]].forEach(function(mesh){

						switch(searchType){


							case VOne.MeshNameProperty:

								if(mesh.name === searchTerm)
									selection.selected.push(mesh);

							break;


							case VOne.MeshClassName:

								if(typeof mesh.classes !== 'undefined'){

									if(mesh.classes.indexOf(searchTerm) !== -1)
										selection.selected.push(mesh);

								}

							break;

						}

					});


				} else {

					switch (searchType) {

						case VOne.MeshNameProperty:
							
							if(objectsInScene[keys[j]].name === searchTerm){

								selection.selected.push(objectsInScene[keys[j]]);

							}

							break;


						case VOne.MeshClassName:


							if(typeof objectsInScene[keys[j]].classes !== 'undefined'){

								if(objectsInScene[keys[j]].classes.indexOf(searchTerm) !== -1)
									selection.selected.push(objectsInScene[keys[j]]);

							}


							break;

					}


				}

			}

			

		}

	}

	return selection;


};

/**
* Represents a VOne.select result
*
* @Class VOne.Selection
**/
VOne.Selection = function(){

	this.selected = [];
	this.positionAnimationDuration = undefined;
	this.positionAnimationTarget = undefined;
	this.scaleAnimationDuration = undefined;
	this.scaleAnimationTarget = undefined;

};


VOne.Selection.prototype = {


	constructor: VOne.Selection,


	/**
	* Defines a function or value to be set as target position after animation to each mesh selected via VOne.select.
	*
	* @method setPositionAnimationTarget
	* @param {function || THREE.Vector3} position The target position for the mesh. It must be represented by a THREE.Vector3.
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setPositionAnimationTarget: function(position){

		this.positionAnimationTarget = position;

		return this;

	},

	/**
	* Defines a function or value to be set as target position animation duraction for each mesh selected via VOne.select.
	*
	* @method setPositionAnimationDuration
	* @param {float} duration Animation duration in miliseconds
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setPositionAnimationDuration: function(duration){

		this.positionAnimationDuration = duration;

		return this;

	},


	/**
	* Defines a function or value to be set as target scale after animation to each mesh selected via VOne.select.
	*
	* @method setScaleAnimationTarget
	* @param {function || THREE.Vector3} scale The target position for the mesh. It must be represented by a THREE.Vector3.
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setScaleAnimationTarget: function(scale){

		this.scaleAnimationTarget = scale;

		return this;

	},


	/**
	* Defines a function or value to be set as target scale animation duraction for each mesh selected via VOne.select.
	*
	* @method setScaleAnimationDuration
	* @param {float} duration Animation duration in miliseconds
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setScaleAnimationDuration: function(duration){

		this.scaleAnimationDuration = duration;

		return this;

	},



	/**
	* Starts running each transformation previously set.
	*
	* @method start
	**/
	start: function(){

		var basicAnimation = new VOne.Animation();

		var that = this;

		if(typeof this.positionAnimationTarget !== 'undefined'){


			var targetPos;

			var duration;


			if(typeof this.positionAnimationTarget === 'function'){

				this.selected.forEach(function(selected){

					targetPos = that.positionAnimationTarget(selected);

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.PositionAnimation, targetPos, duration);

				});

			} else {

				this.selected.forEach(function(selected){

					targetPos = that.positionAnimationTarget;

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.PositionAnimation, targetPos, duration);

				});

			}

		}



		if(typeof this.scaleAnimationTarget !== 'undefined'){


			var targetPos;

			var duration


			if(typeof this.scaleAnimationTarget === 'function'){

				this.selected.forEach(function(selected){

					targetPos = that.scaleAnimationTarget(selected);

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.ScaleAnimation, targetPos, duration);

				});

			} else {

				this.selected.forEach(function(selected){

					targetPos = that.scaleAnimationTarget;

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.ScaleAnimation, targetPos, duration);

				});

			}

		};




	},



	getDurationFor: function(animationType){

		var duration;

		if(animationType === VOne.PositionAnimation){

			if(typeof this.positionAnimationDuration !== 'undefined'){

				if(typeof this.positionAnimationDuration === 'function'){

					duration = this.positionAnimationDuration(this);

				} else {

					duration = this.positionAnimationDuration;

				}

			}

		} else {

			if(typeof this.scaleAnimationDuration !== 'undefined'){

				if(typeof this.scaleAnimationDuration === 'function'){

					duration = this.scaleAnimationDuration(this);

				} else {

					duration = this.scaleAnimationDuration;

				}

			}

		}

		return duration;

	}


};


VOne.AnimationEngine = function(sceneManager){

	this.type = 'VOne.AnimationEngine';

	this.animate.bind(this);


};


VOne.AnimationEngine.prototype = {

	constructor: VOne.AnimationEngine,

	animate: function(sceneManager){

		var meshesMap = sceneManager.getSceneObjects();

		var keys = Object.keys(meshesMap);

		for(var i = 0; i < keys.length; i++){


			var animatingObject = meshesMap[keys[i]];


			if(animatingObject instanceof THREE.Points){


				if(typeof animatingObject.getModel !== 'function') return;


				var pointsModel = animatingObject.getModel();


				if(pointsModel.animating){

					pointsModel.animating = false;

					var animateScale = true;
					var animatePosition = true;
					var animateAlpha = true;

					var data = pointsModel.getDataModel();

					for (var i = 0; i < data.length; i++){

						var record = data[i];

						var continueAnimating = true;


						if(record.animating){

							if(record.positionTween && record.positionTween.running){

								var elapsedTime = record.positionTween.clock.getElapsedTime() * 1000;

								var percentTimeConsumed = elapsedTime / record.positionTween.tweenDuration;

								var positionsArray = pointsModel.getPositionArray();


								if(percentTimeConsumed < 1){

									var tmpPos = record.positionTween.delta.clone();

									tmpPos.multiplyScalar(percentTimeConsumed);

									var meshPosition = record.positionTween.start.clone();

									meshPosition.sub(tmpPos);

									record.position.set(meshPosition.x, meshPosition.y, meshPosition.z);

									positionsArray[i * 3] = meshPosition.x;
									positionsArray[i * 3 + 1] = meshPosition.y;
									positionsArray[i * 3 + 2] = meshPosition.z;

									animatingObject.geometry.attributes.position.needsUpdate = true;


									pointsModel.animating = true;


								} else {

									record.position.set(record.positionTween.dest.x, record.positionTween.dest.y, record.positionTween.dest.z);

									positionsArray[i * 3] = record.positionTween.dest.x;
									positionsArray[i * 3 + 1] = record.positionTween.dest.y;
									positionsArray[i * 3 + 2] = record.positionTween.dest.z;

									animatingObject.geometry.attributes.position.needsUpdate = true;
									animatingObject.geometry.computeBoundingSphere();

									record.positionTween.running = false;

								}

							}


							if(record.scaleTween && record.scaleTween.running){

								var elapsedTime = record.scaleTween.clock.getElapsedTime() * 1000;

								var percentTimeConsumed = elapsedTime / record.scaleTween.tweenDuration ;

								var sizeArray = pointsModel.getSizeArray();


								if(percentTimeConsumed < 1){

									var tmpScale = record.scaleTween.delta;

									tmpScale = tmpScale * percentTimeConsumed;

									var meshScale = record.scaleTween.start;

									meshScale += tmpScale;

									record.size = meshScale;

									sizeArray[i] = meshScale;


									animatingObject.geometry.attributes.size.needsUpdate = true;

									pointsModel.animating = true;


								} else {

									record.size = record.scaleTween.dest;

									sizeArray[i] = record.scaleTween.dest;

									animatingObject.geometry.attributes.size.needsUpdate = true;

									record.scaleTween.running = false;

								}

							}


							if(record.alphaTween && record.alphaTween.running){

								var elapsedTime = record.alphaTween.clock.getElapsedTime() * 1000;

								var percentTimeConsumed = elapsedTime / record.alphaTween.tweenDuration ;

								var alphaArray = pointsModel.getAlphaArray();


								if(percentTimeConsumed < 1){

									var tmpScale = record.alphaTween.delta;

									tmpScale = tmpScale * percentTimeConsumed;

									var meshScale = record.alphaTween.start;

									meshScale += tmpScale;

									record.alpha = meshScale;

									alphaArray[i] = meshScale;


									animatingObject.geometry.attributes.alpha.needsUpdate = true;

									pointsModel.animating = true;


								} else {

									record.alpha = record.alphaTween.dest;

									alphaArray[i] = record.alphaTween.dest;

									animatingObject.geometry.attributes.alpha.needsUpdate = true;

									record.alphaTween.running = false;

								}

							}



							if(!record.scaleTween){

								animateScale = false;

							} else if(!record.scaleTween.running) {

								animateScale = false;

							}


							if(!record.positionTween){

								animatePosition = false;

							} else if(!record.positionTween.running) {

								animatePosition = false;

							}


							if(!record.alphaTween){

								animateAlpha = false

							} else if(!record.alphaTween.running) {

								animateAlpha = false;

							}



							if(!animatePosition && !animateScale && !animateAlpha)
								continueAnimating = false;


							record.animating = continueAnimating;

						}



					}


				}


			} else {

				if(animatingObject instanceof THREE.Mesh || animatingObject instanceof THREE.Camera){

					VOne.AnimationEngine.animateMesh(animatingObject);

				} else if(animatingObject.children.length > 0){

					if(animatingObject.animating)
						VOne.AnimationEngine.animateMesh(animatingObject);

					for(var k = 0; k < animatingObject.children.length; k++){

						if(animatingObject.children[k].animating)
							VOne.AnimationEngine.animateMesh(animatingObject.children[k]);

					}

				}


			}


		}

	},


};


VOne.AnimationEngine.animateMesh =  function(animatingObject){

	if(animatingObject.animating){

		var continueAnimating = true;
		var animateScale = true;
		var animatePosition = true;


		if(animatingObject.positionTween && animatingObject.positionTween.running){

			var elapsedTime = animatingObject.positionTween.clock.getElapsedTime() * 1000;

			var percentTimeConsumed = elapsedTime / animatingObject.positionTween.tweenDuration;


			if(percentTimeConsumed < 1){

				var tmpPos = animatingObject.positionTween.delta.clone();

				tmpPos.multiplyScalar(percentTimeConsumed);

				var meshPosition = animatingObject.positionTween.start.clone();

				meshPosition.sub(tmpPos);

				animatingObject.position.set(meshPosition.x, meshPosition.y, meshPosition.z);


			} else {

				animatingObject.position.set(animatingObject.positionTween.dest.x, animatingObject.positionTween.dest.y, animatingObject.positionTween.dest.z);

				animatingObject.positionTween.running = false;

			}

		}



		if(animatingObject.scaleTween && animatingObject.scaleTween.running){

			var elapsedTime = animatingObject.scaleTween.clock.getElapsedTime() * 1000;

			var percentTimeConsumed = elapsedTime / animatingObject.scaleTween.tweenDuration ;


			if(percentTimeConsumed < 1){

				var tmpScale = animatingObject.scaleTween.delta.clone();

				tmpScale.multiplyScalar(percentTimeConsumed);

				var meshScale = animatingObject.scaleTween.start.clone();

				meshScale.sub(tmpScale);

				animatingObject.scale.set(meshScale.x, meshScale.y, meshScale.z);


			} else {

				animatingObject.scale.set(animatingObject.scaleTween.dest.x, animatingObject.scaleTween.dest.y, animatingObject.scaleTween.dest.z);

				animatingObject.scaleTween.running = false;

			}

		}


		if(!animatingObject.scaleTween){

			animateScale = false;

		} else if(!animatingObject.scaleTween.running) {

			animateScale = false;

		}


		if(!animatingObject.positionTween){

			animatePosition = false;

		} else if(!animatingObject.positionTween.running) {

			animatePosition = false;

		}



		if(!animatePosition && !animateScale)
			continueAnimating = false;


		animatingObject.animating = continueAnimating;


	}


};


/**
* Starts a basic animation for a given THREE.Mesh.
*
* @class VOne.Animation
* @static
* @constructor VOne.Animation
**/
VOne.Animation = function(){

};

VOne.Animation.prototype.constructor = VOne.Animation;


/**
* Starts a basic animation for a given THREE.Mesh.
*
* @method meshBasicAnimation
* @param {THREE.Mesh} mesh A mesh to animate.
* @param {int} animationType Animation type: VOne.PositionAnimation || VOne.ScaleAnimation.
* @param {THREE.Vector3} destinationVector The destination vector.
* @param {float} duration Duration time for the animation specified in miliseconds. Default is 500.
* @param {function} [callback] Callback function to be executed once the animation is finished.
**/
VOne.Animation.prototype.meshBasicAnimation = function(mesh, animationType, dest, duration, cb){


	var animationProperty;
	var start;
	var delta;

	var tDuration = duration || 500;

	

	if(!(dest instanceof THREE.Vector3)){

		console.error('Target position / scale must be a THREE.Vector3. Try again.');
		return -1;

	}


	if(animationType === VOne.PositionAnimation){

		animationProperty = 'positionTween';
		start = mesh.position.clone();
		delta = mesh.position.clone();
			delta.sub(dest);

	} else if(animationType === VOne.ScaleAnimation){

		animationProperty = 'scaleTween';
		start = mesh.scale.clone();
		delta = mesh.scale.clone();
		delta.sub(dest);

	} else {

		console.error('Provide a valid animation type.');
		return -1;

	}


	var clock = new THREE.Clock();

		clock.start();



	var animationProperties = {

		start: start,
		dest: dest,
		tweenDuration: tDuration,
		clock: clock,
		delta: delta,
		running: true

	};

	mesh[animationProperty] = animationProperties;

	mesh.animating = true;


};




/**
* Starts a basic animation for a given THREE.Points object.
*
* @method pointsBasicAnimation
* @param {THREE.Points} points The Points object to animate.
* @param {int} index The index corresponding to the point to be animated.
* @param {int} animationType Animation type: VOne.PositionAnimation || VOne.ScaleAnimation || VOne.AlphaAnimation.
* @param {THREE.Vector3 || Float} destinationVector The destination position vector in case of position animation. In case of scale animation, a float target value must be provided.
* @param {float} duration Duration time for the animation specified in miliseconds. Default is 500.
**/
VOne.Animation.prototype.pointsBasicAnimation = function(points, index, animationType, dest, duration){


	var animationProperty;
	var start;
	var delta;

	var tDuration = duration || 500;

	if(tDuration === 0){
		tDuration = 1;
	}

	if(!(points instanceof THREE.Points)){

		console.error('A THREE.Points object must be supplied in order to be animated.');
		return -1;

	}



	if(animationType === VOne.PositionAnimation && !(dest instanceof THREE.Vector3)){

		console.error('Target position in position animation must be a THREE.Vector3. Try again.');
		return -1;

	}


	var geometryModel = points.getModel();

	var model = geometryModel.getDataModel();




	if(animationType === VOne.PositionAnimation){

		animationProperty = 'positionTween';
		start = model[index].position.clone();
		delta = model[index].position.clone();
		delta.sub(dest);

	} else if(animationType === VOne.ScaleAnimation){

		animationProperty = 'scaleTween';
		start = model[index].size;
		delta = model[index].size - dest;

	} else if(animationType === VOne.AlphaAnimation){

		animationProperty = 'alphaTween';
		start = model[index].alpha;
		delta = model[index].alpha - dest;

	} else {

		console.error('Provide a valid animation type.');
		return -1;

	}


	var clock = new THREE.Clock();

		clock.start();



	var animationProperties = {

		start: start,
		dest: dest,
		tweenDuration: tDuration,
		clock: clock,
		delta: delta,
		running: true

	};

	model[index][animationProperty] = animationProperties;

	model[index].animating = true;

	geometryModel.animating = true;


};


/**
* Shader creator.
*
* @class VOne.ShaderCreator
* @constructor VOne.ShaderCreator
**/
VOne.ShaderCreator = function(){



};


VOne.ShaderCreator.prototype = {

	constructor: VOne.ShaderCreator,


	/**
	* Creates vertex and fragment shaders according to submited options.
	*
	* @method createShader
	* @param {Object} options
	* @param {String} [options.color] Geometry' color property name. Default is undefined.
	* @param {Object} [options.varyingColor] An object containing varying color options. This property and options.color property are mutually exclusive. If an options.color object has been provided, it will be used for rendering color.
	* @param {String} options.varyingColor.startColor The geometry startColor property name.
	* @param {String} options.varyingColor.endColor The geometry' endColor property name.
	* @param {Object} options.varyingAttributes Required attributes for varying colors, sizes or positions (position still not implemented);
	* @param {String} options.varyingAttributes.age The geometry' age property name.
	* @param {String} options.varyingAttributes.duration The geometry' change duration property name.
	* @param {String} [options.alpha] Geometry' alpha property name. Default is undefined and a value of 1.0 will be used.
	* @param {Boolean} [options.points] Must be set to true if you're going to use THREE.Points geometry.
	* @param {Float} [options.pointsFactor] Size factor to be applied to THREE.Points geometry points when using that type of geometry. Defaults to 600.
	* @param {Object} [options.varyingSize] An object containing startSize and endSize properties. Start size value must be less than end size value. (only available for Points geometries).
	* @param {String} options.varyingSize.startSize The name for the starting size attribute.
	* @param {String} options.varyingSize.endSize The name for the ending size attribue.
	* @param {URL} [options.useTexture] URL / path to texture file to use as texture.
	* @param {THREE.Texture} [options.useTHREETexture] A THREE.js texture to be used. Exclusive with options.use_texture.
	* @return {Object} An object containing vertexShader, fragmentShader and uniforms properties ready to be used with a THREE.ShaderMaterial.
	**/
	createShader: function(options){


		var vertexShaderChunks = [ ];
		var fragmentShaderChunks = [ ];
		var pointsFactor;


		if(options.color){

			vertexShaderChunks.push('attribute vec3 ' + options.color +';');
			vertexShaderChunks.push('varying vec3 vColor;');

		} else if(options.varyingColor){

			vertexShaderChunks.push('attribute vec3 ' + options.varyingColor.startColor +';');
			vertexShaderChunks.push('attribute vec3 ' + options.varyingColor.endColor + ';');
			vertexShaderChunks.push('varying vec3 vColor;');

		}


		if(options.textureArrayIndex){

			vertexShaderChunks.push('attribute float ' + options.textureArrayIndex + ';');
			vertexShaderChunks.push('varying float v' + options.textureArrayIndex + ';');

		}


		if(options.varyingAttributes){

			vertexShaderChunks.push('attribute float ' + options.varyingAttributes.age + ';');
			vertexShaderChunks.push('attribute float ' + options.varyingAttributes.duration + ';');

		}

		if(options.size){

			vertexShaderChunks.push('attribute float ' + options.size + ';');

		} else if(options.varyingSize){

			vertexShaderChunks.push('attribute float ' + options.varyingSize.startSize + ';');
			vertexShaderChunks.push('attribute float ' + options.varyingSize.endSize + ';');

		}


		if(options.alpha){
			vertexShaderChunks.push('attribute float ' + options.alpha + ';');
			vertexShaderChunks.push('varying float VOneAlphaValue;');
		}



		vertexShaderChunks.push('void main() {');


		if(options.varyingAttributes){

			vertexShaderChunks.push('float factor = ' + options.varyingAttributes.age + ' / ' + options.varyingAttributes.duration + ';');

		}

		if(options.color){

			vertexShaderChunks.push('vColor = ' + options.color + ';');

		} else if(options.varyingColor){


			vertexShaderChunks.push('vColor = mix(' + options.varyingColor.startColor + ', ' + options.varyingColor.endColor + ', factor);');
		}


		if(options.textureArrayIndex){

			vertexShaderChunks.push('v' + options.textureArrayIndex + ' = ' + options.textureArrayIndex + ';');

		}


		if(options.alpha){
			vertexShaderChunks.push('VOneAlphaValue = ' + options.alpha + ';');
		}


		vertexShaderChunks.push('vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );');

		if(options.points && !options.varyingSize){

			pointsFactor = options.pointsFactor || '200.0';
			vertexShaderChunks.push('gl_PointSize = size * ( ' + pointsFactor +  ' / length( mvPosition.xyz ) );');

		}


		if(options.points && options.varyingSize){

			pointsFactor = options.pointsFactor || '200.0';

			vertexShaderChunks.push('float sizeFactor = ' + options.varyingAttributes.age + ' / ' + options.varyingAttributes.duration + ';');

			vertexShaderChunks.push('gl_PointSize = ' + options.varyingSize.startSize + ' + sizeFactor * ' + ' ( ' + options.varyingSize.endSize + ' - ' + options.varyingSize.startSize + ') * ( ' + pointsFactor + ' / length(mvPosition.xyz ) ); ');

		}

		vertexShaderChunks.push('gl_Position = projectionMatrix * mvPosition;');

		vertexShaderChunks.push('}');



		var uniforms = {

			colorUniform: { type: "c", value: new THREE.Color( 0xffffff ) }

		};


		// 	*****		building fragment shader. 		*****	//


		if(options.useTexture){

			var textureLoader = new THREE.TextureLoader();

			texture = textureLoader.load(options.useTexture);

			uniforms.texture =  { type: "t", value: texture };

			fragmentShaderChunks.push('uniform sampler2D texture;');

		}


		if(options.textureArray){

			if(!options.textureArrayIndex || !Array.isArray(options.textureArray)){
				console.error('No texture array index property (attribute name) provided.');
				return -1;
			}

			uniforms.texture =  { type: "t", value: texture };

			fragmentShaderChunks.push('uniform sampler2D textures[' + options.textureArray.length + '];');

			vertexShaderChunks.push('varying float v' + options.textureArrayIndex + ';');

		}



		if(options.useTHREETexture){

			uniforms.texture =  { type: "t", value: options.useTHREETexture };

			fragmentShaderChunks.push('uniform sampler2D texture;');

		}


		fragmentShaderChunks.push('uniform vec3 colorUniform;');

		fragmentShaderChunks.push('varying vec3 vColor;');


		if(options.alpha){
			fragmentShaderChunks.push('varying float VOneAlphaValue;');
		}


		if(options.textureArray){

			fragmentShaderChunks.push('varying float v' + options.textureArrayIndex + ';');

		}



		fragmentShaderChunks.push('void main() {');



		if(options.color || options.varyingColor){

			if(options.alpha){

				fragmentShaderChunks.push('gl_FragColor = vec4( colorUniform * vColor, VOneAlphaValue );');

			} else {

				fragmentShaderChunks.push('gl_FragColor = vec4( colorUniform * vColor, 1.0 );');

			}

		}


		if((options.useTexture || options.useTHREETexture) && options.points){

			fragmentShaderChunks.push('gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );');

			if(options.alpha){

				fragmentShaderChunks.push('if ( gl_FragColor.a < 0.001 ) discard;');

			}

		} else if(options.textureArray){

			fragmentShaderChunks.push('vec4 startColor = vec4(vColor, 1.0);');
			fragmentShaderChunks.push('vec4 finalColor;');

			for(var i = 0; i < options.textureArray.length; i++){

				fragmentShaderChunks.push('vec4 finalColor;');

				fragmentShaderChunks.push('if(v' + options.textureArrayIndex + ' < ' + i + '.5){ ');

				fragmentShaderChunks.push('finalColor = texture2D(textures[' + i + '], gl_PointCoord);');

				fragmentShaderChunks.push('}');

			}

		} else if(options.color){

			if(options.alpha){

				fragmentShaderChunks.push('gl_FragColor.a = VOneAlphaValue;');

			} else {

				fragmentShaderChunks.push('gl_FragColor = vec4( colorUniform * vColor, 1.0 );');

			}

		}



		fragmentShaderChunks.push('}');


		return {
			vertexShader: vertexShaderChunks.join('\n'),
			fragmentShader: fragmentShaderChunks.join('\n'),
			uniforms: uniforms
		};

	}

};


/**
* Creates 2D planes with text for using them in a 3D scene. The plane will contain a canvas with dimensions according to the text and config parameters provided.
*
* @class VOne.Label3D
* @constructor VOne.Label3D
* @param {string} text The text to create. Ideally, you should provide just one line of text. [TODO: change this parameter to accept an array, each element would be a line with text].
* @param {Object} config Options for customizing the text.
* @param {string} config.fontFace Font face to be used. Defaults to Arial Narrow.
* @param {int} config.fontSize Size to be used in the font. Default is 18.
* @param {float} config.borderThickness Border thickness to be used in the font. Default is 0.
* @param {Object} config.backgroundColor Background color to be used with the text in the form { r: red, g: green, b: blue, a: alpha }. Default is { r:150, g:0, b:150, a:0.0 }
* @param {Object} config.textColor Color to be used for the text in the form { r: red, g: green, b: blue, a: alpha }. Default is { r:30, g:0, b:190, a:1.0 }.
* @param {String} config.textAlign Text align (left, center, right);
* @param {boolean} config.spriteMaterial Indicates if the returned object will use a sprite material (always facing to the camera). If not set or set to false, the returned object will be a plane containing the text.
* @param {number} config.lineLength Amount of max chars per line. Default is 27.
* @param {number} config.maxLines Max number of lines to be used. Default is 3.
* @param {number} config.lineHeight Lines height. Default is fontSize + 5.
* @param {number} config.canvasFixedWidth Texture canvas prefered width.
* @param {number} config.canvasFixedHeight Texture canvas preferred height.
*
* @return {THREE.Object3D} A plane containing the text with the provided parameters.
**/
VOne.Label3D = function( message, parameters ){

    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontFace") ? parameters.fontFace : "Arial Narrow";

    var fontSize = parameters.hasOwnProperty("fontSize") ? parameters.fontSize : 18;

    var lineLength = parameters.hasOwnProperty("lineLength") ? parameters.lineLength : 27;

    var maxLines = parameters.hasOwnProperty("maxLines") ? parameters.maxLines : 3;

    var lineHeight = parameters.hasOwnProperty("lineHeight") ? parameters.lineHeight : (fontSize + 5);

    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters.borderThickness : 2;

    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters.borderColor : { r:150, g:0, b:150, a:0.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters.backgroundColor : { r:255, g:255, b:255, a:0.0 };

    var textColor = parameters.hasOwnProperty("textColor") ? parameters.textColor : { r:30, g:0, b:190, a:1.0 };

    var canvasFixedWidth = parameters.canvasFixedWidth;

    var canvasFixedHeight = parameters.canvasFixedHeight;


    var textLines = [ ];


    if(typeof message === 'number'){

        message = message.toString();

    }


    var textWords = message.split(' ');

    var lineIsFull;

    var charsCount;

    var textWordsIndex = 0;

    for(var i = 0; i < maxLines && textWordsIndex < textWords.length; i++){

        textLines[i] = '';
        lineIsFull = false;
        charsCount = 0;

        while(!lineIsFull && textWordsIndex < textWords.length){

            if(charsCount + textWords[textWordsIndex].length < lineLength){

                textLines[i] += ' ' + textWords[textWordsIndex];
                textWordsIndex ++;
                charsCount = textLines[i].length;

            } else {
                textLines[i] += ' ';
                lineIsFull = true;
            }

        }

    }


    if(textWordsIndex < textWords.length){
        textLines[maxLines - 1] += '...';
    }


    var txtWidth = fontSize * lineLength;
    var txtHeight = textLines.length * lineHeight;


    var canvasWidth;

    if(canvasFixedWidth){

        canvasWidth = canvasFixedWidth;

    } else {

        canvasWidth = nearestPow2(txtWidth);

        if(canvasWidth < txtWidth){
            canvasWidth *= 2;
        }

    }



    var canvasHeight;

    if(canvasFixedHeight){

        canvasHeight = canvasFixedHeight;

    } else {

        canvasHeight = nearestPow2(txtHeight);

        if(txtHeight < canvasHeight){
            canvasHeight *= 2;
        }

    }




    var canvas = document.createElement('canvas');

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;


    var context = canvas.getContext('2d');

    context.font = fontSize + "px " + fontface;
    context.textAlign = parameters.textAlign || 'center';


    context.font = "" + fontSize + "px " + fontface;

    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";

    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;

    // roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontSize * 1.4 + borderThickness, 8);


    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";


    var xTextPos = Math.floor(canvasWidth / 2);
    var yTextPos = Math.ceil(canvasHeight / 2 - txtHeight / 2 + lineHeight / 2);


    textLines.forEach(function(line){

        context.fillText( line, xTextPos, yTextPos);
        yTextPos += lineHeight;

    });




    var texture = new THREE.Texture(canvas) ;

    texture.needsUpdate = true;


    var material;

    var object3D;



    if(parameters.spriteMaterial){

        material = new THREE.SpriteMaterial( { map: texture } );

        object3D = new THREE.Sprite( material );

    } else {

        material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, depthTest: true });
        material.transparent = true;
        object3D = new THREE.Mesh(new THREE.PlaneGeometry(512, 128), material);

    }


    return object3D;

};


/**
* Utility for calculating values in logarithmic base 10 scales.
* @class VOne.LogScale
* @constructor VOne.LogScale
* @param {Array} domain Domain min and max values in the form [minValue, maxValue]
* @param {Array} range Range max and min values in the form [minValue, maxValue]
**/
VOne.LogScale = function(domain, range){

	if(!Array.isArray(domain) || !Array.isArray(range)){

		console.error('VOne.LogScale: Domain and range must be provided as arrays!');
		return -1;

	}


	this.domain = domain;
	this.range = range;


	this.minDomainValue = this.domain[0];
	this.maxDomainValue = this.domain[1];

	this.minRangeValue = Math.log(this.range[0]);
	this.maxRangeValue = Math.log(this.range[1]);

	this.scale = (this.maxRangeValue - this.minRangeValue) / (this.maxDomainValue - this.minDomainValue);

}


VOne.LogScale.prototype = {

	constructor: VOne.LogScale,

	/**
	* Gets the corresponding value for the given domain and range values when instantiating this class.
	*
	* @method getValueFor
	* @param {number} rawValue The value to calculate the corresponding scale.
	**/
	getValueFor: function(rawValue){

		return Math.exp(this.minRangeValue + this.scale * (rawValue - this.minDomainValue));
			
	}

}

/**
* Creates a 2D polygon model.
*
*
* @class VOne.Polygon
* @constructor VOne.Polygon
*
* @param {int} verticesNumber Number of vertices for polygon.
* @param {float} centerX Center x polygon position.
* @param {float} centerY Center y polygon position.
* @param {float} radius Radius of the circle where the polygon will be circumscripted.
* @param {boolean} poligonRotated If set to true, the first vertex will be at 90 degrees position. Else, first vertex will be positioned a 0 degrees.
**/

VOne.Polygon = function(vertexNumber, centerX, centerY, radius, poligonRotated, z){

	var degreesDiff = 360 / vertexNumber;

	var startAngle = poligonRotated ? 90 : 0;

	/**
	* An array conaining the created vertices. The last vertex will be exactly the same as first to allow easy creation of a THREE.Geometry.
	*
	* @property vertices
	* @type {THREE.Vector2 Array}
	* 
	**/
	this.vertices = [ ];


	for(var i = 0; i < vertexNumber; i++){

		var pos = calculateXYInRadius(startAngle, radius);

	    pos.x += centerX;
	    pos.y += centerY;

	    this.vertices.push(new THREE.Vector2(pos.x, pos.y));

	    startAngle += degreesDiff;

	}

	this.vertices.push(this.vertices[0]);

};


VOne.Polygon.prototype.constructor = VOne.Polygon;

/**
* Creates and manages hexagonal grids in a rectangular delimited space.
*
* @class VOne.HexGrid
* @constructor VOne.HexGrid
* @param {Number} startX Initial X coordinate.
* @param {Number} startY Initial Y coordinate. 
* @param {Number} endX End X coordinate.
* @param {Number} endY End Y coordinate.
* @param {Number} diameter Diameter of the circle that may circumscript every hexagon.
* @param {Boolean} rotated Indicates if the hexagons will be rotated (90 degrees).
*/
VOne.HexGrid = function(startX, startY, endX, endY, diameter, rotated){

	/**
	* The hexagonal grid horizontal length.
	*
	* @property lengthX
	* @type {Number}
	* 
	**/
	this.lengthX = endX > startX ? endX - startX : startX - endX;

	/**
	* The hexagonal grid vertical length.
	*
	* @property lengthY
	* @type {Number}
	* 
	**/
	this.lengthY = endY > startY ? endY - startY : startY - endY;


	/**
	* Indicates if hexagons are rotated by 90 degrees.
	*
	* @property rotated
	* @type {Number}
	* 
	**/
	this.rotated = rotated || true;


	/**
	* An array containing each hexagon generated THREE.Shape
	*
	* @property shapes
	* @type {Array}
	* 
	**/
	this.shapes = [ ];


	/**
	* An array containing the hexagons map.
	*
	* @property model
	* @type {Array}
	* 
	**/
	this.model = [ ];


	/**
	* The model associative array.
	*
	* @property byNameModel
	* @type {Object}
	* 
	**/
	this.byNameModel = { };


	/**
	* The circle radius that circumscripts each hexagon.
	*
	* @property lengthX
	* @type {Number}
	* 
	**/
	this.hexRadius = diameter / 2;


	/**
	* The hexagons' grid horizontal stating point.
	*
	* @property startX
	* @type {Number}
	* 
	**/
	this.startX = startX;


	/**
	* The hexagons' grid vertical stating point.
	*
	* @property startY
	* @type {Number}
	* 
	**/
	this.startY = startY;


	/**
	* The hexagons' grid horizontal ending point.
	*
	* @property endX
	* @type {Number}
	* 
	**/
	this.endX = endX;


	/**
	* The hexagons' grid vertical ending point.
	*
	* @property endY
	* @type {Number}
	* 
	**/
	this.endY = endY;


	if(this.rotated){

		var p1 = calculateXYInRadius(30, this.hexRadius);
		var p2 = calculateXYInRadius(330, this.hexRadius);
		var p3 = calculateXYInRadius(150, this.hexRadius);

		/**
		* The vertical distance between each hexagon in the Hexgrid.
		*
		* @property deltaY
		* @type {Number}
		* 
		**/
		this.deltaY = (p1.y - p2.y);

		/**
		* The horizontal distance between each hexagon in the Hexgrid.
		*
		* @property deltaY
		* @type {Number}
		* 
		**/
		this.deltaX = (p1.x - p3.x) / 2;



	} else {

		var p1 = calculateXYInRadius(60, this.hexRadius);
		var p2 = calculateXYInRadius(120, this.hexRadius);
		var p3 = calculateXYInRadius(300, this.hexRadius);

		this.deltaY = (p1.y - p3.y) / 2;
		this.deltaX = (p1.x - p2.x);

	}


	var verticalHexs = this.rotated ? Math.ceil( this.lengthY / (this.hexRadius + this.deltaY * 2) ) : Math.ceil( this.lengthY / this.deltaY );

	var defaultRatio = this.lengthX / this.deltaX;

	var horizontalHexs = this.rotated ? Math.ceil( defaultRatio ) : Math.ceil( this.lengthX / ( this.hexRadius + deltaX ) );

	var currentX = startX;
	var currentY = startY;


	for(var x = 0; x < horizontalHexs; x++){

		for(var y = 0; y < verticalHexs; y++){

			var hexagon = new VOne.Polygon(6, currentX, currentY, this.hexRadius, this.rotated);

			hexagon.index = x * verticalHexs + y;

			var hexagonGeometry = new THREE.Shape(hexagon.vertices);

				hexagonGeometry.name = 'v' + x + '_' + y;
				hexagon.name = 'v' + x + '_' + y;

				hexagon.center = new THREE.Vector2(currentX, currentY);

			currentY += this.deltaY * 3;

			this.shapes.push(hexagonGeometry);

			this.model.push(hexagon);

			this.byNameModel['v' + x + '_' + y] = hexagon;

		}

		if(this.rotated){

			if(x % 2 === 0){

				currentY = (startY + this.hexRadius * 3 /2);

			} else {

				currentY = startY;

			}

			currentX += this.deltaX;


		} else {

			if(y % 2 === 0){

				currentX = (startX + this.hexRadius * 3 /2);

			} else {

				currentX = startX;

			}

			currentY += this.deltaY;


		}

	}


	this.shapeGeometry = new THREE.ShapeGeometry(this.shapes);
	

};



VOne.HexGrid.prototype.constructor = VOne.HexGrid;


/**
* Generates a buffer geometry object from the hexagonal grid model generated in constructor. This method add the bufferGeometry and bufferGeometryModel properties to the instance. Up to this method, the bufferGeometryModel will hold the model and position properties.
*
* @method generateBufferGeometries 
* @param {Number} zPosition The Z position to use for the generated geometry.
* @return {VOne.HexGrid} The instance of the HexGrid for calling another method.
**/
VOne.HexGrid.prototype.generateBufferGeometries = function(zPos){


	var z = zPos || 0;

	var facesCount = this.shapeGeometry.faces.length;

	var positions = new Float32Array(facesCount * 9);
	var normals = new Float32Array(facesCount * 9);
	


	for(var i = 0; i < facesCount; i++){

		var face = this.shapeGeometry.faces[i];

		positions[i * 9] = this.shapeGeometry.vertices[ face.a ].x;
		positions[i * 9 + 1] = this.shapeGeometry.vertices[ face.a ].y;
		positions[i * 9 + 2] = z;
		positions[i * 9 + 3] = this.shapeGeometry.vertices[ face.b ].x;
		positions[i * 9 + 4] = this.shapeGeometry.vertices[ face.b ].y;
		positions[i * 9 + 5] = z;
		positions[i * 9 + 6] = this.shapeGeometry.vertices[ face.c ].x;
		positions[i * 9 + 7] = this.shapeGeometry.vertices[ face.c ].y;
		positions[i * 9 + 8] = z;


		normals[i * 9] = face.normal.x;
		normals[i * 9 + 1] = face.normal.y;
		normals[i * 9 + 2] = face.normal.z;
		normals[i * 9 + 3] = face.normal.x;
		normals[i * 9 + 4] = face.normal.y;
		normals[i * 9 + 5] = face.normal.z;
		normals[i * 9 + 6] = face.normal.x;
		normals[i * 9 + 7] = face.normal.y;
		normals[i * 9 + 8] = face.normal.z;

	}


	this.bufferGeometry = new THREE.BufferGeometry();

	this.bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute(positions, 3));
	this.bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute(normals, 3));


	this.pointsCount = positions.length;

	this.bufferGeometryModel = new VOne.BufferGeometryModel(this.model);
	this.bufferGeometryModel.setGeometry(this.bufferGeometry);
	this.bufferGeometryModel.setPositionArray(positions);


	return this;

};


/**
* Sets colors to the vertices of a THREE.BufferGeometry previuosly generated using the generateBufferGeometries method and sets the corresponding property to the bufferGeometryModel property.
*
* @method setGeometriesColor 
* @param {function || THREE.Color} setColor A function to set the color for each hexagon geometry in the form function(hex){ ... return THREE.Color(valid color)); . The function will receive each hexagon from the model generated in the constructor. You can alternatively set directly a THREE.Color.
* @return {VOne.HexGrid} The instance of the HexGrid for calling another method.
***/
VOne.HexGrid.prototype.setGeometriesColor = function(setColor){


	var hexCount = this.model.length;


	if(typeof setColor === 'function'){

		for(var i = 0; i < hexCount; i++){

			this.model[i].color = setColor(this.model[i]);

		}

	} else if(setColor instanceof THREE.Color){

		for(var i = 0; i < hexCount; i++){

			this.model[i].color = setColor;

		}

	} else {

		console.error('No valid color provided for HexGrid.');
		return -1;

	}



	var facesCount = this.shapeGeometry.faces.length;

	var colors = new Float32Array(facesCount * 9);


	var vertexPerHex = facesCount / hexCount;



	for(var i = 0; i < facesCount; i++){

		var modelIndex = Math.floor(i / vertexPerHex);

		colors[i * 9] = this.model[modelIndex].color.r;
		colors[i * 9 + 1] = this.model[modelIndex].color.g;
		colors[i * 9 + 2] = this.model[modelIndex].color.b;
		colors[i * 9 + 3] = this.model[modelIndex].color.r;
		colors[i * 9 + 4] = this.model[modelIndex].color.g;
		colors[i * 9 + 5] = this.model[modelIndex].color.b;
		colors[i * 9 + 6] = this.model[modelIndex].color.r;
		colors[i * 9 + 7] = this.model[modelIndex].color.g;
		colors[i * 9 + 8] = this.model[modelIndex].color.b;

	}


	this.bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute(colors, 3));

	this.bufferGeometryModel.setColorArray(colors);

	return this;

}



/**
* Sets alpha to the vertices of a THREE.BufferGeometry previuosly generated using the generateBufferGeometries method and sets the corresponding property to the bufferGeometryModel property.
*
* @method setGeometriesAlpha 
* @param {function || Number [0-1]} setAlpha A function to set the color for each hexagon geometry. The alpha value will be set for each vertex.
* @return {VOne.HexGrid} The instance of the HexGrid for calling another method.
***/
VOne.HexGrid.prototype.setGeometriesAlpha = function(setAlpha){


	var hexCount = this.model.length;


	if(typeof setAlpha === 'function'){

		for(var i = 0; i < hexCount; i++){

			this.model[i].alpha = setAlpha(this.model[i]);

		}

	} else if(typeof setAlpha === 'number'){

		for(var i = 0; i < hexCount; i++){

			this.model[i].alpha = setAlpha;

		}

	} else {

		console.error('No valid alpha provided for HexGrid.');
		return -1;

	}



	var facesCount = this.shapeGeometry.faces.length;

	var alpha = new Float32Array(facesCount * 3);


	var vertexPerHex = facesCount / hexCount;



	for(var i = 0; i < facesCount; i++){

		var modelIndex = Math.floor(i / vertexPerHex);

		alpha[i * 3] = this.model[modelIndex].alpha;
		alpha[i * 3 + 1] = this.model[modelIndex].alpha;
		alpha[i * 3 + 2] = this.model[modelIndex].alpha;
		
	}


	this.bufferGeometry.addAttribute( 'alpha', new THREE.BufferAttribute(alpha, 1));

	this.bufferGeometryModel.setAlphaArray(alpha);

	return this;

}



/**
* Generates a THREE.BufferGeometry ready to use with a line material to draw the hexagons borders.
*
* @method generateEdgesGeometry 
* @param {Number} zPosition The z position to be set in all the hexagons. Default is 0.
* @return {VOne.HexGrid} The instance of the HexGrid for calling another method.
***/
VOne.HexGrid.prototype.generateEdgesGeometry = function(zPos){

	var z = zPos || 0;

	var shapesCount = this.shapes.length;

	var positions = new Float32Array(shapesCount * 36);

	for(var i = 0; i < shapesCount; i++){

		var shape = this.shapes[i];


		for(var j = 0; j < 6; j++){

			positions[i * 36 + j * 6] = shape.actions[j].args[0];
			positions[i * 36 + j * 6 + 1] = shape.actions[j].args[1];
			positions[i * 36 + j * 6 + 2] = z;


			positions[i * 36 + j * 6 + 3] = shape.actions[j + 1].args[0];
			positions[i * 36 + j * 6 + 4] = shape.actions[j + 1].args[1];
			positions[i * 36 + j * 6 + 5] = z;

		}

	}


	this.edgesBufferGeometry = new THREE.BufferGeometry();

	this.edgesBufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

	return this.edgesBufferGeometry;

}


/**
* Determines in which hexagon is contained a provided x, y point in a bidimiensional space.
*
* @method whereIs 
* @param {Number} x The x position of the point.
* @param {Number} y The y position of the point.
*
* @return {VOne.Polygon} The hexagon object from the model in which the point is contained.
***/
VOne.HexGrid.prototype.whereIs = function(x, y){

	var pos = new THREE.Vector2(x, y);

	var mostProbableHex = undefined;

	var minorDistance = this.hexRadius;

	var startX = this.startX < this.endX ? this.startX : this.endX;
	var startY = this.startY < this.endY ? this.startY : this.endY;
	var endX = this.endX < this.endX ? this.endX : this.endX;
	var endY = this.endY < this.endY ? this.endY : this.endY;


	if(x < startX || x > endX || y < startY || y > endY){

		return false;

	}


	var verticalHexs = this.rotated ? this.lengthY / (this.hexRadius + this.deltaY * 2) : this.lengthY / this.deltaY;
	var horizontalHexs = this.rotated ? this.lengthX / this.deltaX : this.lengthX / (this.hexRadius + deltaX);


	var xCoord = Math.floor((x - startX) / this.lengthX * horizontalHexs);
	var yCoord = Math.floor((y - startY) / this.lengthY * verticalHexs);


	mostProbableHex = this.byNameModel['v' + xCoord + '_' + yCoord];

	minorDistance = mostProbableHex.center.distanceTo(new THREE.Vector2(x, y));

	

	for(var i = xCoord - 1; i <= xCoord + 1; i++){

		for(var j = yCoord - 1; j <= yCoord + 1; j++){

			var evaluatedHex = this.byNameModel['v' + i + '_' + j];

			if(evaluatedHex){

				var distance = evaluatedHex.center.distanceTo(new THREE.Vector2(x, y));

				if(distance < minorDistance){

					mostProbableHex = this.byNameModel['v' + i + '_' + j];

				}

			}

		}

	}
	

	return mostProbableHex;

}


