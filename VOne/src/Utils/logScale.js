/**
* Utility for calculating values in logarithmic base 10 scales.
* @class VOne.LogScale
* @constructor VOne.LogScale
* @param {Array} domain Domain min and max values in the form [minValue, maxValue]
* @param {Array} range Range max and min values in the form [minValue, maxValue]
**/
VOne.LogScale = function(domain, range){

	if(!Array.isArray(domain) || !Array.isArray(range)){

		console.error('VOne.LogScale: Domain and range must be provided as arrays!');
		return -1;

	}


	this.domain = domain;
	this.range = range;


	this.minDomainValue = this.domain[0];
	this.maxDomainValue = this.domain[1];

	this.minRangeValue = Math.log(this.range[0]);
	this.maxRangeValue = Math.log(this.range[1]);

	this.scale = (this.maxRangeValue - this.minRangeValue) / (this.maxDomainValue - this.minDomainValue);

}


VOne.LogScale.prototype = {

	constructor: VOne.LogScale,

	/**
	* Gets the corresponding value for the given domain and range values when instantiating this class.
	*
	* @method getValueFor
	* @param {number} rawValue The value to calculate the corresponding scale.
	**/
	getValueFor: function(rawValue){

		return Math.exp(this.minRangeValue + this.scale * (rawValue - this.minDomainValue));
			
	}

}