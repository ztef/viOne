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
