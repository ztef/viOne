var VOne = { VERSION: '1.1.1' };


if(typeof define === 'function' && define.amd) {

	define( 'VOne', VOne );

} else if ('undefined' !== typeof exports && 'undefined' !== typeof module){

	module.exports = VOne;
	var THREE = require('three');

}



Object.assign(VOne, {

	// Animation types
	PositionAnimation: 0,
	ScaleAnimation: 1,
	AlphaAnimation: 2,


	// Search types
	MeshNameProperty: 0,
	ChildNameProperty: 1,
	MeshClassName: 2,

	// Conversion cache
	degToRad: Math.PI / 180,
	radToDeg: 180 / Math.PI,


	// Fixed values
	SphericalIncrementRatio: Math.PI * 3 - Math.sqrt(5),
	GoldenRatio: (Math.sqrt(5)+1)/2 - 1,
	HalfPI: Math.PI / 2,
	DoublePI: Math.PI * 2,

});
