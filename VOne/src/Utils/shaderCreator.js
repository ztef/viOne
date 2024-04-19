/**
* Shader creator.
*
* @class VOne.ShaderCreator
* @constructor VOne.ShaderCreator
**/
VOne.ShaderCreator = function(){



};


VOne.ShaderCreator.prototype = {

	constructor: VOne.ShaderCreator,


	/**
	* Creates vertex and fragment shaders according to submited options.
	*
	* @method createShader
	* @param {Object} options
	* @param {String} [options.color] Geometry' color property name. Default is undefined.
	* @param {Object} [options.varyingColor] An object containing varying color options. This property and options.color property are mutually exclusive. If an options.color object has been provided, it will be used for rendering color.
	* @param {String} options.varyingColor.startColor The geometry startColor property name.
	* @param {String} options.varyingColor.endColor The geometry' endColor property name.
	* @param {Object} options.varyingAttributes Required attributes for varying colors, sizes or positions (position still not implemented);
	* @param {String} options.varyingAttributes.age The geometry' age property name.
	* @param {String} options.varyingAttributes.duration The geometry' change duration property name.
	* @param {String} [options.alpha] Geometry' alpha property name. Default is undefined and a value of 1.0 will be used.
	* @param {Boolean} [options.points] Must be set to true if you're going to use THREE.Points geometry.
	* @param {Float} [options.pointsFactor] Size factor to be applied to THREE.Points geometry points when using that type of geometry. Defaults to 600.
	* @param {Object} [options.varyingSize] An object containing startSize and endSize properties. Start size value must be less than end size value. (only available for Points geometries).
	* @param {String} options.varyingSize.startSize The name for the starting size attribute.
	* @param {String} options.varyingSize.endSize The name for the ending size attribue.
	* @param {URL} [options.useTexture] URL / path to texture file to use as texture.
	* @param {THREE.Texture} [options.useTHREETexture] A THREE.js texture to be used. Exclusive with options.use_texture.
	* @return {Object} An object containing vertexShader, fragmentShader and uniforms properties ready to be used with a THREE.ShaderMaterial.
	**/
	createShader: function(options){


		var vertexShaderChunks = [ ];
		var fragmentShaderChunks = [ ];
		var pointsFactor;


		if(options.color){

			vertexShaderChunks.push('attribute vec3 ' + options.color +';');
			vertexShaderChunks.push('varying vec3 vColor;');

		} else if(options.varyingColor){

			vertexShaderChunks.push('attribute vec3 ' + options.varyingColor.startColor +';');
			vertexShaderChunks.push('attribute vec3 ' + options.varyingColor.endColor + ';');
			vertexShaderChunks.push('varying vec3 vColor;');

		}


		if(options.textureArrayIndex){

			vertexShaderChunks.push('attribute float ' + options.textureArrayIndex + ';');
			vertexShaderChunks.push('varying float v' + options.textureArrayIndex + ';');

		}


		if(options.varyingAttributes){

			vertexShaderChunks.push('attribute float ' + options.varyingAttributes.age + ';');
			vertexShaderChunks.push('attribute float ' + options.varyingAttributes.duration + ';');

		}

		if(options.size){

			vertexShaderChunks.push('attribute float ' + options.size + ';');

		} else if(options.varyingSize){

			vertexShaderChunks.push('attribute float ' + options.varyingSize.startSize + ';');
			vertexShaderChunks.push('attribute float ' + options.varyingSize.endSize + ';');

		}


		if(options.alpha){
			vertexShaderChunks.push('attribute float ' + options.alpha + ';');
			vertexShaderChunks.push('varying float VOneAlphaValue;');
		}



		vertexShaderChunks.push('void main() {');


		if(options.varyingAttributes){

			vertexShaderChunks.push('float factor = ' + options.varyingAttributes.age + ' / ' + options.varyingAttributes.duration + ';');

		}

		if(options.color){

			vertexShaderChunks.push('vColor = ' + options.color + ';');

		} else if(options.varyingColor){


			vertexShaderChunks.push('vColor = mix(' + options.varyingColor.startColor + ', ' + options.varyingColor.endColor + ', factor);');
		}


		if(options.textureArrayIndex){

			vertexShaderChunks.push('v' + options.textureArrayIndex + ' = ' + options.textureArrayIndex + ';');

		}


		if(options.alpha){
			vertexShaderChunks.push('VOneAlphaValue = ' + options.alpha + ';');
		}


		vertexShaderChunks.push('vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );');

		if(options.points && !options.varyingSize){

			pointsFactor = options.pointsFactor || '200.0';
			vertexShaderChunks.push('gl_PointSize = size * ( ' + pointsFactor +  ' / length( mvPosition.xyz ) );');

		}


		if(options.points && options.varyingSize){

			pointsFactor = options.pointsFactor || '200.0';

			vertexShaderChunks.push('float sizeFactor = ' + options.varyingAttributes.age + ' / ' + options.varyingAttributes.duration + ';');

			vertexShaderChunks.push('gl_PointSize = ' + options.varyingSize.startSize + ' + sizeFactor * ' + ' ( ' + options.varyingSize.endSize + ' - ' + options.varyingSize.startSize + ') * ( ' + pointsFactor + ' / length(mvPosition.xyz ) ); ');

		}

		vertexShaderChunks.push('gl_Position = projectionMatrix * mvPosition;');

		vertexShaderChunks.push('}');



		var uniforms = {

			colorUniform: { type: "c", value: new THREE.Color( 0xffffff ) }

		};


		// 	*****		building fragment shader. 		*****	//


		if(options.useTexture){

			var textureLoader = new THREE.TextureLoader();

			texture = textureLoader.load(options.useTexture);

			uniforms.texture =  { type: "t", value: texture };

			fragmentShaderChunks.push('uniform sampler2D texture;');

		}


		if(options.textureArray){

			if(!options.textureArrayIndex || !Array.isArray(options.textureArray)){
				console.error('No texture array index property (attribute name) provided.');
				return -1;
			}

			uniforms.texture =  { type: "t", value: texture };

			fragmentShaderChunks.push('uniform sampler2D textures[' + options.textureArray.length + '];');

			vertexShaderChunks.push('varying float v' + options.textureArrayIndex + ';');

		}



		if(options.useTHREETexture){

			uniforms.texture =  { type: "t", value: options.useTHREETexture };

			fragmentShaderChunks.push('uniform sampler2D texture;');

		}


		fragmentShaderChunks.push('uniform vec3 colorUniform;');

		fragmentShaderChunks.push('varying vec3 vColor;');


		if(options.alpha){
			fragmentShaderChunks.push('varying float VOneAlphaValue;');
		}


		if(options.textureArray){

			fragmentShaderChunks.push('varying float v' + options.textureArrayIndex + ';');

		}



		fragmentShaderChunks.push('void main() {');



		if(options.color || options.varyingColor){

			if(options.alpha){

				fragmentShaderChunks.push('gl_FragColor = vec4( colorUniform * vColor, VOneAlphaValue );');

			} else {

				fragmentShaderChunks.push('gl_FragColor = vec4( colorUniform * vColor, 1.0 );');

			}

		}


		if((options.useTexture || options.useTHREETexture) && options.points){

			fragmentShaderChunks.push('gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );');

			if(options.alpha){

				fragmentShaderChunks.push('if ( gl_FragColor.a < 0.001 ) discard;');

			}

		} else if(options.textureArray){

			fragmentShaderChunks.push('vec4 startColor = vec4(vColor, 1.0);');
			fragmentShaderChunks.push('vec4 finalColor;');

			for(var i = 0; i < options.textureArray.length; i++){

				fragmentShaderChunks.push('vec4 finalColor;');

				fragmentShaderChunks.push('if(v' + options.textureArrayIndex + ' < ' + i + '.5){ ');

				fragmentShaderChunks.push('finalColor = texture2D(textures[' + i + '], gl_PointCoord);');

				fragmentShaderChunks.push('}');

			}

		} else if(options.color){

			if(options.alpha){

				fragmentShaderChunks.push('gl_FragColor.a = VOneAlphaValue;');

			} else {

				fragmentShaderChunks.push('gl_FragColor = vec4( colorUniform * vColor, 1.0 );');

			}

		}



		fragmentShaderChunks.push('}');


		return {
			vertexShader: vertexShaderChunks.join('\n'),
			fragmentShader: fragmentShaderChunks.join('\n'),
			uniforms: uniforms
		};

	}

};
