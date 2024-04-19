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
