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