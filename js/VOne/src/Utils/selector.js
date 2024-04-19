/**
* Selector for meshes added to a THREEJS scene via the @SceneManager.
* 
* @method select
* @for VOne
* @param {String} selectOptions <p>The mesh(es) name(s) to be searched for. If the mesh of interest has set the <strong>name</strong> property, a '#' sign must be prepended. To search by the name assigned to the mesh when it was added to the scene via the @SceneManager, the selectOption must be prepended by underscore. If a class has been assigned to the mesh of interest, the selectOptions must be prepended by dot. </p><p>Example:<br/>var whiteDotMeshes = VOne.select('.whiteDot'); </p><p> will return an object containing all the meshes that matches the class 'whiteDot'. Also, the oject will contain methods for setting position and scale animation options.</p>
* @return {VOne.Selection} VOne.Selection Object containing all the meshes that matched the select options.
**/
VOne.select = function(selectOptions){


	var selection = new VOne.Selection();

	
	var that = this;

	var SEARCH_TYPES = [ 'meshNameProperty', 'childNameProperty', 'meshClassName'  ];


	var searchType = 0;
	var searchTermSubIndex = 1;


	var searchDefineChar = selectOptions.charAt(0);


	switch (searchDefineChar) {

		case '#':
			searchType = VOne.MeshNameProperty;
			break;

		case '_':
			searchType = VOne.ChildNameProperty;
			break;

		case '.':
			searchType = VOne.MeshClassName;
			break;

		default:
			searchType = VOne.ChildNameProperty;
			searchTermSubIndex = 0;
			break;

	}

	

	var searchTerm = selectOptions.substr(searchTermSubIndex);


	var smCount = VOne.Scenes.length;



	for(var i = 0; i < smCount; i++){

		var objectsInScene = VOne.Scenes[i].getSceneObjects();


		if(searchType === VOne.ChildNameProperty){

			if(typeof objectsInScene[searchTerm] !== undefined)
				selection.selected.push(objectsInScene[searchTerm]);


		} else {

			var keys = Object.keys(objectsInScene);


			for(var j = 0; j < keys.length; j++){


				if(Array.isArray(objectsInScene[keys[j]])){

					objectsInScene[keys[j]].forEach(function(mesh){

						switch(searchType){


							case VOne.MeshNameProperty:

								if(mesh.name === searchTerm)
									selection.selected.push(mesh);

							break;


							case VOne.MeshClassName:

								if(typeof mesh.classes !== 'undefined'){

									if(mesh.classes.indexOf(searchTerm) !== -1)
										selection.selected.push(mesh);

								}

							break;

						}

					});


				} else {

					switch (searchType) {

						case VOne.MeshNameProperty:
							
							if(objectsInScene[keys[j]].name === searchTerm){

								selection.selected.push(objectsInScene[keys[j]]);

							}

							break;


						case VOne.MeshClassName:


							if(typeof objectsInScene[keys[j]].classes !== 'undefined'){

								if(objectsInScene[keys[j]].classes.indexOf(searchTerm) !== -1)
									selection.selected.push(objectsInScene[keys[j]]);

							}


							break;

					}


				}

			}

			

		}

	}

	return selection;


};