/**
* Creates a series of points almost evenly distributed among a sphere surface.
*
* @method fibSphere
* @for VOne
*
* @param {number} pointsCount Number of points to draw
* @param {THREE.Vector3} startPosition Center of the sphere
* @param {number} radius Radius for the sphere
* @param {boolean} irregular If set to true, irregular-like distribution will be used.
*
* @return {Float32Array} An array of positions where x = index * 3, y = index * 3 + 1 and z = index * 3 + 2 (An array to be used as position attribute in a buffer geometry).
**/

VOne.fibSphere = function(pointsCount, startPosition, radius, irregular){

	var offset = 2 / pointsCount;

	var result = new Float32Array(pointsCount * 3);

	var x, y, z, phi, rFactor;

	var rnd = irregular ? Math.random() * pointsCount : 1;


	for(var i = 0; i < pointsCount; i++){

		y = ((i * offset) - 1) + offset / 2;

		rFactor = Math.sqrt(1 - y * y);

		phi = ((i + rnd) % pointsCount) * VOne.SphericalIncrementRatio;

		x = Math.cos(phi) * rFactor;

		z = Math.sin(phi) * rFactor;

		result[i * 3] = startPosition.x + x * radius;
		result[i * 3 + 1] = startPosition.y + y * radius;
		result[i * 3 + 2] = startPosition.z + z * radius;

	}

	return result;

};
