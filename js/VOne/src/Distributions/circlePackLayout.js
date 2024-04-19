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
