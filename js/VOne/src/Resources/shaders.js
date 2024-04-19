VOne.Shaders = {


	nodesCPS: {

		vertex: [

			
			'attribute vec3 color;',

			'attribute float size;',

			
			'varying vec3 vColor;',


			'void main() {',

				'vColor = color;',

				'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',

				'gl_PointSize = size * (600.0 / length( mvPosition.xyz ) );',

				'gl_Position = projectionMatrix * mvPosition;',

			'}'


		].join('\n'),


		fragment: [

			'uniform vec3 uniformsColor;',

			'uniform sampler2D texture;',
			
			'varying vec3 vColor;',

			'void main() {',

				'gl_FragColor = vec4( uniformsColor * vColor, 1.0 );',

				'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',

				
			'}'


		].join('\n')

	}


}