function generateGraphData(limit, maxRelations){
	
	var data = [ ];

	for(var i = 0; i < limit; i++){

		var relations = [ ];

		for(var j = 0; j < maxRelations; j++){

			var x = Math.floor(Math.random() * (limit - 1));

			if(x !== i)
				relations.push( {id: x} );

		}

		

		var partial = { id: i, index: i, friends: relations };

		data.push(partial);


	}


	return data;

}