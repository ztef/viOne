/**
* Starts a basic animation for a given THREE.Mesh.
*
* @class VOne.Animation
* @static
* @constructor VOne.Animation
**/
VOne.Animation = function(){

};

VOne.Animation.prototype.constructor = VOne.Animation;


/**
* Starts a basic animation for a given THREE.Mesh.
*
* @method meshBasicAnimation
* @param {THREE.Mesh} mesh A mesh to animate.
* @param {int} animationType Animation type: VOne.PositionAnimation || VOne.ScaleAnimation.
* @param {THREE.Vector3} destinationVector The destination vector.
* @param {float} duration Duration time for the animation specified in miliseconds. Default is 500.
* @param {function} [callback] Callback function to be executed once the animation is finished.
**/
VOne.Animation.prototype.meshBasicAnimation = function(mesh, animationType, dest, duration, cb){


	var animationProperty;
	var start;
	var delta;

	var tDuration = duration || 500;

	

	if(!(dest instanceof THREE.Vector3)){

		console.error('Target position / scale must be a THREE.Vector3. Try again.');
		return -1;

	}


	if(animationType === VOne.PositionAnimation){

		animationProperty = 'positionTween';
		start = mesh.position.clone();
		delta = mesh.position.clone();
			delta.sub(dest);

	} else if(animationType === VOne.ScaleAnimation){

		animationProperty = 'scaleTween';
		start = mesh.scale.clone();
		delta = mesh.scale.clone();
		delta.sub(dest);

	} else {

		console.error('Provide a valid animation type.');
		return -1;

	}


	var clock = new THREE.Clock();

		clock.start();



	var animationProperties = {

		start: start,
		dest: dest,
		tweenDuration: tDuration,
		clock: clock,
		delta: delta,
		running: true

	};

	mesh[animationProperty] = animationProperties;

	mesh.animating = true;


};




/**
* Starts a basic animation for a given THREE.Points object.
*
* @method pointsBasicAnimation
* @param {THREE.Points} points The Points object to animate.
* @param {int} index The index corresponding to the point to be animated.
* @param {int} animationType Animation type: VOne.PositionAnimation || VOne.ScaleAnimation || VOne.AlphaAnimation.
* @param {THREE.Vector3 || Float} destinationVector The destination position vector in case of position animation. In case of scale animation, a float target value must be provided.
* @param {float} duration Duration time for the animation specified in miliseconds. Default is 500.
**/
VOne.Animation.prototype.pointsBasicAnimation = function(points, index, animationType, dest, duration){


	var animationProperty;
	var start;
	var delta;

	var tDuration = duration || 500;

	if(tDuration === 0){
		tDuration = 1;
	}

	if(!(points instanceof THREE.Points)){

		console.error('A THREE.Points object must be supplied in order to be animated.');
		return -1;

	}



	if(animationType === VOne.PositionAnimation && !(dest instanceof THREE.Vector3)){

		console.error('Target position in position animation must be a THREE.Vector3. Try again.');
		return -1;

	}


	var geometryModel = points.getModel();

	var model = geometryModel.getDataModel();




	if(animationType === VOne.PositionAnimation){

		animationProperty = 'positionTween';
		start = model[index].position.clone();
		delta = model[index].position.clone();
		delta.sub(dest);

	} else if(animationType === VOne.ScaleAnimation){

		animationProperty = 'scaleTween';
		start = model[index].size;
		delta = model[index].size - dest;

	} else if(animationType === VOne.AlphaAnimation){

		animationProperty = 'alphaTween';
		start = model[index].alpha;
		delta = model[index].alpha - dest;

	} else {

		console.error('Provide a valid animation type.');
		return -1;

	}


	var clock = new THREE.Clock();

		clock.start();



	var animationProperties = {

		start: start,
		dest: dest,
		tweenDuration: tDuration,
		clock: clock,
		delta: delta,
		running: true

	};

	model[index][animationProperty] = animationProperties;

	model[index].animating = true;

	geometryModel.animating = true;


};
