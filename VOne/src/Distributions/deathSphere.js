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
