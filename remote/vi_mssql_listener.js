

import vi_RemoteListener from "./vi_remote_listener.js"





class vi_MSSQL_Listener extends vi_RemoteListener {
  constructor(dataSource, objectModel) {

    super();
    this.dataSource = dataSource;
    this.collections = dataSource.config.collections;
    this.objectModel = objectModel;

    this.start();
   
  }

  

  async start() {
    try {
        for (let querynumber = 0; querynumber < this.collections.length; querynumber++) {
            if(this.collections[querynumber].loadType == "progressive"){
                  await this.loadDataProgressive(querynumber, this.collections[querynumber]);
            } else {
                  await this.loadData(querynumber, this.collections[querynumber]);
            }
        }
    } catch (error) {
        console.error('Error loading sheets:', error);
    }
}


async loadDataProgressive(querynumber, _collectionObj) {

  const _collection = _collectionObj.collection;
  const _query = _collectionObj.sql;

  try {
    console.log("Fetch de datos PROGRESIVOS de MSSQL:", _collection);
    // Make an HTTP GET request to your Node.js route
    const response = await fetch('/api/getMSSQLDataSTREAM?query='+_query+'&database='+this.dataSource.config.DATABASE_ID);

    if (response.ok) {
      // Parse the response as JSON
      //const _data = await response.json();

      const eventSource = new EventSource('/api/getMSSQLDataSTREAM?query='+_query+'&database='+this.dataSource.config.DATABASE_ID);

      eventSource.onmessage = (event) => {
        const _data = JSON.parse(event.data);
        console.log("DATA PROGRESIVA RECIBIDA :");
        console.log(_data); // Handle the received data

        //for (const _key in _data.data) {
        //  if (_data.data.hasOwnProperty(_key)) {
            const _element = _data.data;
            
            const _record = {
                id:_element.id,
                type: _element.type,
                fields:_element
            };

            if(_collectionObj.geoField){

              _record.position = {
                _lat: _element[_collectionObj.geoField._lat],
                _long: _element[_collectionObj.geoField._long]
              };
              
            }

            console.log(_record);
            this.objectModel.updateOrAddObject(_record.id,  _collection, _record);
         // }
        //}






      };
  
      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
      };
      

     
    } else {
      console.error('Failed to fetch data:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}





  async loadData(querynumber, _collectionObj) {

    const _collection = _collectionObj.collection;
    const _query = _collectionObj.sql;

    try {
      console.log("Fetch de datos de MSSQL:", _collection);
      // Make an HTTP GET request to your Node.js route
      const response = await fetch('/api/getMSSQLData?query='+_query+'&database='+this.dataSource.config.DATABASE_ID);
  
      if (response.ok) {
        // Parse the response as JSON
        const _data = await response.json();
  
        
        console.log("RESULTADOS DE QUERY");
        console.log(_data);
  

        for (const _key in _data) {
          if (_data.hasOwnProperty(_key)) {
            const _element = _data[_key];
            
            const _record = {
                id:_element.id,
                type: _element.type,
                fields:_element
            };

            if(_collectionObj.geoField){

              _record.position = {
                _lat: _element[_collectionObj.geoField._lat],
                _long: _element[_collectionObj.geoField._long]
              };
              
            }

            console.log(_key, _record);
            this.objectModel.updateOrAddObject(_record.id,  _collection, _record);
          }
        }

        //avisa al modelo que la coleccion ha sido cargada en su totalidad
        this.objectModel.setCollectionLoaded(_collection);
  
       
      } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  

  
}

export default vi_MSSQL_Listener;


