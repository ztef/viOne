VOne.RenderersManager = {

    glRenderer: false,

    clock: new THREE.Clock(),

    scenesToRender : { },

    bgColor: 0x000000,

    bgAlpha: 1,

    canvas: undefined,

    addScene: function(scene, id){

        var sceneRendererType = scene.VOneData.rendererType;

        var startAnimation = false;

        if(Object.keys(VOne.RenderersManager.scenesToRender).length === 0){

            startAnimation = true;

        }

        if(scene.VOneData.rendererClass === THREE.WebGLRenderer){

            if(!VOne.RenderersManager.glRenderer){

                VOne.RenderersManager.canvas = document.createElement('canvas');

                VOne.RenderersManager.canvas.style.width = '100%';

                VOne.RenderersManager.canvas.style.height = '100%';

                VOne.RenderersManager.canvas.style.top = '0';

                VOne.RenderersManager.canvas.style.left = '0';

                VOne.RenderersManager.canvas.style.zIndex = '-1';

                VOne.RenderersManager.canvas.style.position = 'fixed';


                document.body.appendChild(VOne.RenderersManager.canvas);

                VOne.RenderersManager.scenesToRender.glRenderer = { scenes:  [ ] } ;

                VOne.RenderersManager.glRenderer = new THREE.WebGLRenderer({ canvas: VOne.RenderersManager.canvas, alpha: true, antialias: true });

                VOne.RenderersManager.glRenderer.setClearColor( VOne.RenderersManager.bgColor, VOne.RenderersManager.bgAlpha);
				VOne.RenderersManager.glRenderer.setPixelRatio( window.devicePixelRatio );

            }

            scene.VOneData.id = id;

            VOne.RenderersManager.scenesToRender.glRenderer.scenes.push(scene);

            scene.VOneData.renderer = VOne.RenderersManager.glRenderer;

            //var positionInfo = scene.VOneData.container.getBoundingClientRect();

            var containerWidth = parseInt(scene.VOneData.container.style.width.substr(0, scene.VOneData.container.style.width.indexOf('px')));

            var containerHeight = parseInt(scene.VOneData.container.style.height.substr(0, scene.VOneData.container.style.height.indexOf('px')));

            scene.VOneData.container.widthRelation = containerWidth / window.innerWidth;

            scene.VOneData.container.heightRelation = containerHeight / window.innerHeight;


            scene.onMouseMove = function( event ) {

    			// calculate mouse position in normalized device coordinates
    			// (-1 to +1) for both components

    			event.preventDefault();

                var boundingRect = event.target.getBoundingClientRect();

    			scene.mouse.x = ( event.offsetX / (boundingRect.width) ) * 2 - 1;
    			scene.mouse.y = - ( event.offsetY / (boundingRect.height) ) * 2 + 1;


    			scene.mouseOnScreen.x = event.offsetX;
    			scene.mouseOnScreen.y = event.offsetY;

    		};



    		scene.onMouseClick = function(event){


    			event.preventDefault();


    			if(scene.VOneData.INTERSECTED !== null){


    				model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];

    				if(typeof model.onClick === 'function'){


    					if(isBufferGeometry){

    						var element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

    						model.onClick(element, scene.VOneData.INTERSECTED);

    					} else {

    						model.onClick(intersectedInterestProperty);

    					}


    				}

    			}

    		};


        } else {

            if(!VOne.RenderersManager.scenesToRender.otherRenderer){

                VOne.RenderersManager.scenesToRender.otherRenderer = { scenes: [ ] };

            }

            VOne.RenderersManager.scenesToRender.otherRenderer.scenes.push(scene);

            scene.VOneData.renderer = new scene.VOneData.rendererClass({ alpha: true, antialias: true });

            scene.VOneData.renderer.setSize(scene.VOneData.containerDimensions.width, scene.VOneData.containerDimensions.height);

            scene.VOneData.container.appendChild(scene.VOneData.renderer.domElement);

        }

        scene.VOneData.renderer.sortObjects = true;

        if(scene.VOneData.rendererProperties){

            var rendererPropertiesKeys = Object.keys(scene.VOneData.rendererProperties);

            rendererPropertiesKeys.forEach(function(property){

                scene.VOneData.renderer[property] = scene.VOneData.rendererProperties[property];

            });

        }


        scene.VOneData.container.addEventListener( 'mousemove', scene.onMouseMove, false );

        scene.VOneData.container.addEventListener( 'click', scene.onMouseClick, false );




        if(startAnimation){

            VOne.RenderersManager.animate();

        }

    },


    removeSceneById: function(id){



    },


    updateRendererSize: function(){



    },

    animate: function(){

        requestAnimationFrame(VOne.RenderersManager.animate);

        // if(!scene.redererPaused)
        //     scene.render();

        VOne.RenderersManager.renderScenes();

    },


    renderScenes: function() {

        var keys = Object.keys(VOne.RenderersManager.scenesToRender);

        var delta = VOne.RenderersManager.clock.getDelta();

        for(var i = 0; i < keys.length; i++){

            var scenes = VOne.RenderersManager.scenesToRender[keys[i]].scenes;

            if(keys[i] === 'glRenderer'){

                var width = window.innerWidth;
        		var height = window.innerHeight;

        		if ( VOne.RenderersManager.canvas.width !== width || VOne.RenderersManager.canvas.height != height ) {

                    VOne.RenderersManager.scenesToRender.glRenderer.scenes.forEach(function(scene){

                        var windowProportion = scene.VOneData.containerDimensions ? scene.VOneData.containerDimensions.width / scene.VOneData.containerDimensions.height : width / height;

                        if(scene.VOneData.containerType === 'div' ){

                            var newWidth = scene.VOneData.container.widthRelation * width;
                            var newHeight = scene.VOneData.container.heightRelation * height;

                            scene.VOneData.container.style.width = newWidth + 'px';
                            scene.VOneData.container.style.height = newHeight + 'px';


                        }

                        scene.camera.aspect = windowProportion;
                	 	scene.camera.updateProjectionMatrix();

                    });

                    VOne.RenderersManager.glRenderer.setPixelRatio( window.devicePixelRatio );
                    VOne.RenderersManager.glRenderer.setSize( width, height, false );

        		}

                VOne.RenderersManager.glRenderer.setClearColor( VOne.RenderersManager.bgColor, VOne.RenderersManager.bgAlpha );
    			VOne.RenderersManager.glRenderer.setScissorTest( false );
    			VOne.RenderersManager.glRenderer.clear();
    			VOne.RenderersManager.glRenderer.setScissorTest( true );


                scenes.forEach(function(scene){

                    if(scene.visible){


                        if(scene.VOneData.interactiveObjects.length > 0){


        					scene.VOneData.raycaster.setFromCamera(scene.mouse, scene.camera);


        					var intersections = scene.VOneData.raycaster.intersectObjects(scene.VOneData.interactiveObjects);

                            var model, element;

                            //console.log(intersections);

        					if(intersections.length > 0){

                                //console.log(intersections[0]);

        						if(intersections[0].object.type === "Points"){

        							var intersection = intersections[0];

        							if(intersection.hasOwnProperty('faceIndex')){

        								scene.VOneData.lastInteractiveModelName = intersections[0].object.name;

        								var index = Math.floor(intersections[0].faceIndex * scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel.length / intersections[0].object.geometry.attributes.position.count);

        								intersectedInterestProperty = index;

        							}

        							else {

        								intersectedInterestProperty = intersections[0].index;

        							}

        							isBufferGeometry = true;


        						} else if(intersections[0].object.type === "Mesh") {

        							intersectedInterestProperty = intersections[0].object;

        							isBufferGeometry = false;


        						}


        						if(scene.VOneData.INTERSECTED != intersectedInterestProperty){


        							if(scene.VOneData.INTERSECTED !== null){


        								model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


        								if(typeof model.onMouseOut === 'function'){


        									if(isBufferGeometry){

        										element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

        										model.onMouseOut(element, scene.VOneData.INTERSECTED);

        									} else {

        										model.onMouseOut(intersectedInterestProperty);

        									}


        								}


        							}



        							scene.VOneData.INTERSECTED = intersectedInterestProperty;

        							scene.VOneData.lastInteractiveModelName = intersections[0].object.name;


        							model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


        							if(typeof model.onMouseOver === 'function'){


        								if(isBufferGeometry){

        									element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];


        									model.onMouseOver(element, scene.VOneData.INTERSECTED);


        								} else {

        									model.onMouseOver(intersectedInterestProperty);

        								}


        							}




        						}


        					} else {


        						if(scene.VOneData.INTERSECTED !== null){


        							model = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName];


        							if(typeof model.onMouseOut === 'function'){


        								if(isBufferGeometry){

        									element = scene.VOneData.interactiveModels[scene.VOneData.lastInteractiveModelName].dataModel[scene.VOneData.INTERSECTED];

        									model.onMouseOut(element, scene.VOneData.INTERSECTED);

        								} else {

        									model.onMouseOut(intersectedInterestProperty);

        								}


        							}

        							scene.VOneData.INTERSECTED = null;

        						}

        					}


        				}



        				if(scene.VOneData.controls)
        					scene.VOneData.controls.update(delta);


        				if(scene.VOneData.sceneManager.onRender.length > 0){

        					scene.VOneData.sceneManager.onRender.forEach(function(f){

        						f.fn(f.params);

        					});

        				}


                        var rect = scene.VOneData.container.getBoundingClientRect();

        				if ( rect.bottom > 0 || rect.top  < scene.VOneData.renderer.domElement.clientHeight ||
        					 rect.right  > 0 || rect.left < scene.VOneData.renderer.domElement.clientWidth ) {

            				// set the viewport
            				var width  = rect.right - rect.left;
            				var height = rect.bottom - rect.top;
            				var left   = rect.left;
            				var bottom = scene.VOneData.renderer.domElement.clientHeight - rect.bottom;

            				scene.VOneData.renderer.setViewport( left, bottom, width, height );
            				scene.VOneData.renderer.setScissor( left, bottom, width, height );


                			VOne.RenderersManager.glRenderer.setClearColor( scene.VOneData.bgColor, scene.VOneData.bgAlpha );
            				scene.VOneData.renderer.render(scene, scene.camera);

                        }

                    }

                });


            } else {

                scenes.forEach(function(scene){

                    if(scene.VOneData.controls)
    					scene.VOneData.controls.update(delta);


    				if(scene.VOneData.sceneManager.onRender.length > 0){

    					scene.VOneData.sceneManager.onRender.forEach(function(f){

    						f.fn(f.params);

    					});

    				}


    				scene.VOneData.renderer.render(scene, scene.camera);

                });


            }

        }


    }

};
