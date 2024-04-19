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


