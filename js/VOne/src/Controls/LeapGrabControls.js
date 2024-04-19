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
