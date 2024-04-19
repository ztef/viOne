

import vi_RemoteListener from "./vi_remote_listener.js"





class vi_GoogleSheetListener extends vi_RemoteListener {
  constructor(dataSource, mobileObjectModel) {

    super();
    this.dataSource = dataSource;
    this.collections = dataSource.config.collections;
    this.objectModel = mobileObjectModel;

    this.loadSheets();
   
  }

  

  async loadSheets() {
    try {
        for (let sheetnumber = 0; sheetnumber < this.collections.length; sheetnumber++) {
            await this.loadData(sheetnumber, this.collections[sheetnumber]);
        }
    } catch (error) {
        console.error('Error loading sheets:', error);
    }
}


  async loadData(sheetnumber, _collectionObj) {

    const _collection = _collectionObj.collection;

    try {
      console.log("Fetch de datos de google hoja:", _collection);
      // Make an HTTP GET request to your Node.js route
      const response = await fetch('/api/getFromSheet?sheetnumber='+sheetnumber+'&sheet='+this.dataSource.config.SPREADSHEET_ID);
  
      if (response.ok) {
        // Parse the response as JSON
        const _sheetdata = await response.json();
  
        // Process the data from the Google Spreadsheet
        console.log("DATOS DE LA HOJA DE CALCULO");
        console.log(_sheetdata);
  

        for (const _key in _sheetdata) {
          if (_sheetdata.hasOwnProperty(_key)) {
            const _element = _sheetdata[_key];
            
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

export default vi_GoogleSheetListener;


