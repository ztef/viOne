/**
* Adds a class to a THREE.JS mesh object by extending it's functionality.
*
* @method addClass
* @for THREE.Mesh
* @param {String} className A name to be attached as class name for a mesh.
**/
THREE.Mesh.prototype.addClass = function(className){

	if(typeof(this.classes) === 'undefined')
		this.classes = [ ];


	if(this.classes.indexOf(className !== -1))
		this.classes.push(className);

	return this.classes;

};


/**
* Removes a class from a THREE.JS mesh object by extending it's functionality.
*
* @method removeClass
* @for THREE.Mesh
* @param {String} className The class name to be removed from a mesh.
**/
THREE.Mesh.prototype.removeClass = function(className){

	if(typeof(this.classes) === 'undefined')
		return -1;

	var pos = this.classes.indexOf(className);

	if(pos > -1){

		this.classes.splice(pos, 1);

	}

	return this.classes;

};
