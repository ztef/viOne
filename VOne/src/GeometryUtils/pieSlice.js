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
