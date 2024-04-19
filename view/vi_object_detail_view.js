/*

  VISUAL INTERACTION SYSTEMS

  View Generica para objeto individual para el manejo de Objetos registrados en el Modelo


*/

class vi_ObjectDetailView {
  
  constructor(domain, divID, controller, headerFunction , rowFunction ) {
    // ...



    this.domain = domain;
    this.controller = controller;
    
    if(headerFunction){
    this.headerFunction = headerFunction;
    } else {
      this.headerFunction = this.defaultHeaderFunction;
    }

    if(rowFunction){
      this.rowFunction = rowFunction;
      } else {
        this.rowFunction = this.defaultRowFunction;
      }
    

    this.controller.addObserver(this.domain, 'objectSelected', this.handleObjectSelected.bind(this));
    this.controller.addObserver(this.domain, 'objectPicked', this.handleObjectSelected.bind(this));

    //this.controller.addObserver('objectAdded', this.addObject.bind(this));
    this.controller.addObserver(this.domain, 'objectUpdated', this.updateObject.bind(this));
    //this.controller.addObserver('objectDeleted', this.removeObject.bind(this));

      this.modelView = document.getElementById(divID);

      this.content = document.createElement("div");
      this.content.className = 'content';
      this.content.style.overflow = 'auto';
      this.content.style.height = '90%';

     
      this.table = document.createElement("table");
      

      this.currentId = null;

      
      this.content.appendChild(this.table);


      this.modelView.appendChild(this.content);

     

    }

    defaultHeaderFunction(id, collection, data){
  

        var htmlOut = '';
        return htmlOut;

    }

    defaultRowFunction(id, collection, data){
  

      var htmlOut = '';

      for(let field in data.fields){
        if(data.fields.hasOwnProperty(field) ){
        htmlOut = htmlOut + `<tr style="color: white;"><td>${field}</td>><td>${data.fields[field]}</td></tr>`;
      }
      }
      
      return htmlOut;

  }


    createHeader(id, collection, data){
      const header = document.createElement("tr");
      header.innerHTML = this.headerFunction(id, collection, data);
      this.table.appendChild(header);
    }
   

    /*
    
      Manejo de click en un objeto  (Notifica al controlador) 
    
    */

    handleRowClick(mobileId) {
  
      
  
    }


    /*

      Maneja notificacion de que un objeto ha sido seleccionado en otra vista

    */

    handleObjectSelected(domain, event, ref) {


      this.currentId = ref.id;

      let id = ref.id;


      let object = this.controller.model.readObject(domain, id);

      let data = object.data;
      let collection = object.collection;

     
      const row = document.createElement("tr");
      this.table.innerHTML = this.createObjectHtml(id, collection, data);
  
     

    }
  


    createObjectHtml(id, collection, data) { 


      return this.rowFunction(id, collection, data);
      
      
    }
   
    addObject(event, newObject) {

      
    }
  
    updateObject(domain, event, object) {

      if(object.id == this.currentId){

        this.handleObjectSelected(domain, null,object)

      }
    
    }
  
    removeObject(event, id) {
     
    }
  }
  
  export default vi_ObjectDetailView;