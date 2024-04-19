/**
* Represents a VOne.select result
*
* @Class VOne.Selection
**/
VOne.Selection = function(){

	this.selected = [];
	this.positionAnimationDuration = undefined;
	this.positionAnimationTarget = undefined;
	this.scaleAnimationDuration = undefined;
	this.scaleAnimationTarget = undefined;

};


VOne.Selection.prototype = {


	constructor: VOne.Selection,


	/**
	* Defines a function or value to be set as target position after animation to each mesh selected via VOne.select.
	*
	* @method setPositionAnimationTarget
	* @param {function || THREE.Vector3} position The target position for the mesh. It must be represented by a THREE.Vector3.
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setPositionAnimationTarget: function(position){

		this.positionAnimationTarget = position;

		return this;

	},

	/**
	* Defines a function or value to be set as target position animation duraction for each mesh selected via VOne.select.
	*
	* @method setPositionAnimationDuration
	* @param {float} duration Animation duration in miliseconds
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setPositionAnimationDuration: function(duration){

		this.positionAnimationDuration = duration;

		return this;

	},


	/**
	* Defines a function or value to be set as target scale after animation to each mesh selected via VOne.select.
	*
	* @method setScaleAnimationTarget
	* @param {function || THREE.Vector3} scale The target position for the mesh. It must be represented by a THREE.Vector3.
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setScaleAnimationTarget: function(scale){

		this.scaleAnimationTarget = scale;

		return this;

	},


	/**
	* Defines a function or value to be set as target scale animation duraction for each mesh selected via VOne.select.
	*
	* @method setScaleAnimationDuration
	* @param {float} duration Animation duration in miliseconds
	* @return {VOne.Selection} The selection object for setting more tasks.
	**/
	setScaleAnimationDuration: function(duration){

		this.scaleAnimationDuration = duration;

		return this;

	},



	/**
	* Starts running each transformation previously set.
	*
	* @method start
	**/
	start: function(){

		var basicAnimation = new VOne.Animation();

		var that = this;

		if(typeof this.positionAnimationTarget !== 'undefined'){


			var targetPos;

			var duration;


			if(typeof this.positionAnimationTarget === 'function'){

				this.selected.forEach(function(selected){

					targetPos = that.positionAnimationTarget(selected);

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.PositionAnimation, targetPos, duration);

				});

			} else {

				this.selected.forEach(function(selected){

					targetPos = that.positionAnimationTarget;

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.PositionAnimation, targetPos, duration);

				});

			}

		}



		if(typeof this.scaleAnimationTarget !== 'undefined'){


			var targetPos;

			var duration


			if(typeof this.scaleAnimationTarget === 'function'){

				this.selected.forEach(function(selected){

					targetPos = that.scaleAnimationTarget(selected);

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.ScaleAnimation, targetPos, duration);

				});

			} else {

				this.selected.forEach(function(selected){

					targetPos = that.scaleAnimationTarget;

					duration = that.getDurationFor(selected);

					basicAnimation.meshBasicAnimation(selected, VOne.ScaleAnimation, targetPos, duration);

				});

			}

		};




	},



	getDurationFor: function(animationType){

		var duration;

		if(animationType === VOne.PositionAnimation){

			if(typeof this.positionAnimationDuration !== 'undefined'){

				if(typeof this.positionAnimationDuration === 'function'){

					duration = this.positionAnimationDuration(this);

				} else {

					duration = this.positionAnimationDuration;

				}

			}

		} else {

			if(typeof this.scaleAnimationDuration !== 'undefined'){

				if(typeof this.scaleAnimationDuration === 'function'){

					duration = this.scaleAnimationDuration(this);

				} else {

					duration = this.scaleAnimationDuration;

				}

			}

		}

		return duration;

	}


};
