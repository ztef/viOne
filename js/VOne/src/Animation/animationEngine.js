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
