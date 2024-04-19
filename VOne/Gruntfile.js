module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: '\n\n',
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> - Property of Geckode LCC */\n' //  <---- Esto aparecera al principio del uglificado
            },
            dist: {     //  ******** EN EL SIGUIENTE ARREGLO ENLISTAN TODOS LOS SCRIPTS A UNIFICAR Y UGLIFICAR  ***********   //
                src: [
                    'src/VOne.js',
                    'src/sceneCreator.js',

                    'src/DataUtils/assignLevelData.js',

                    'src/Distributions/radialDistribution.js',

                    'src/Distributions/forceDirectedLayout/fdlEngine.js',
                    'src/Distributions/forceDirectedLayout/graph.js',
                    'src/Distributions/forceDirectedLayout/graphBuilder.js',
                    'src/Distributions/forceDirectedLayout/graphEdge.js',
                    'src/Distributions/forceDirectedLayout/graphNode.js',
                    'src/Distributions/fibSphere.js',
                    'src/Distributions/circlePackLayout.js',
                    'src/Distributions/deathSphere.js',
                    'src/Distributions/halfTube.js',
                    'src/Distributions/spiral.js',

                    'src/Model/geometryModel.js',
                    'src/Model/ScenesModel.js',
                    'src/Model/bufferGeometryModel.js',
                    'src/Model/preparedBufferGeometryModel.js',
                    'src/Model/backgroundModelGenerator.js',

                    'src/Resources/defaultImages.js',
                    'src/Resources/shaders.js',


                    'src/SceneUtils/ThreeSceneManager.js',
                    'src/SceneUtils/RenderersManager.js',

                    'src/GeometryUtils/cpsBufferGeometriesGenerator.js',
                    'src/GeometryUtils/graphGeometriesGenerator.js',
                    'src/GeometryUtils/genericBufferGeometriesGenerator.js',
                    'src/GeometryUtils/relationshipBufferGeometriesGenerator.js',
                    'src/GeometryUtils/pieSlice.js',

                    'src/Controls/LeapGrabControls.js',

                    'src/THREEUtils/THREEUtils.js',

                    'src/Utils/VOneGenericUtils.js',
                    'src/Utils/selector.js',
                    'src/Utils/selection.js',


                    'src/Animation/animationEngine.js',
                    'src/Animation/basicAnimation.js',

                    'src/Utils/shaderCreator.js',
                    'src/Utils/label3D.js',
                    'src/Utils/logScale.js',

                    'src/2D/polygon.js',
                    'src/2D/hexGrid.js'

                ],



                dest: 'dist/VOne.js'  //  <-------- AQUI ESPECIFICAN DONDE QUIEREN EL CODIGO UNIFICADO
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> - Property of Geckode LCC */\n' //  <---- Esto aparecera al principio del uglificado
            },
            build: {
                src: 'dist/VOne.js',  // ******* RUTA DEL ARCHIVO UNIFICADO (LA MISMA DEL CONCAT DE ARRIBA)
                dest: 'dist/VOne.min.js'  //  ********** DONDE QUIEREN EL ARCHIVO UGLIFICADO   ***********
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};
