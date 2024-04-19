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
