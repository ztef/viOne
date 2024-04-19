/*

  VISUAL INTERACTION SYSTEMS

  View Generica (GRID) para el manejo de Objetos registrados en el Modelo


*/

class vi_ObjectGridView {
  
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
    
    

    this.controller.addObserver(domain,'objectSelected', this.handleObjectSelected.bind(this));
    this.controller.addObserver(domain,'objectAdded', this.addObject.bind(this));
    this.controller.addObserver(domain,'objectUpdated', this.updateObject.bind(this));
    this.controller.addObserver(domain,'objectDeleted', this.removeObject.bind(this));


    this.controller.addObserver(domain,'objectFiltered', this.hideObject.bind(this));
    this.controller.addObserver(domain,'objectUnFiltered', this.unHideObject.bind(this));



      this.modelView = document.getElementById(divID);

      this.content = document.createElement("div");
      this.content.className = 'content';
      this.content.style.overflow = 'auto';
      this.content.style.height = '90%';

     
      this.table = document.createElement("table");
      this.table.style.borderCollapse = "collapse";

      this.table.classList.add("vi-object-grid-table");

      this.hasRecords = false;

      
      this.content.appendChild(this.table);


      this.modelView.appendChild(this.content);

      //this.table.addEventListener("click", this.handleTableClick.bind(this));

    }

    defaultHeaderFunction(id, collection, data){
  

        var htmlOut = '';
        for(let field in data.fields){
          if(data.fields.hasOwnProperty(field) ){
          htmlOut = htmlOut + `<th style="color: white;">${field}</th>`;
        }
        }
        
        return htmlOut;

    }

    defaultRowFunction(id, collection, data){
  

      var htmlOut = '';
      for(let field in data.fields){
        if(data.fields.hasOwnProperty(field) ){
        htmlOut = htmlOut + `<th style="color: white;">${data.fields[field]}</th>`;
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

    handleRowClick(objectId) {
  
      this.controller.triggerObjectSelected(this.domain, { id: objectId });
  
    }


    /*

      Maneja notificacion de que un objeto ha sido seleccionado en otra vista

    */

    handleObjectSelected(event, payload) {


     
      // Check if the payload matches a mobile in the grid
      // If it does, mark it as selected in this view
      const { id } = payload;
      // Example: Find the row with the matching ID and apply a CSS class for selection
      const row = this.table.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        row.classList.add("selected");
      }
    }
  


    createObjectHtml(id, collection, data) { 


      return this.rowFunction(id, collection, data);
      
      
    }
   
    addObject(domain, event, newObject) {

      console.log("GRID : NUEVO SI LLEGA",newObject);

     

      let id = newObject.id;
      let data = newObject.data;
      let collection = newObject.collection;

       // Si es el primer registro lo aprovecha para crear el header :
       if(!this.hasRecords){
        this.createHeader(id, collection,data);
      }

      // Ya hay al menos un registro
      this.hasRecords = true;

     
      const row = document.createElement("tr");
      row.setAttribute("data-id", id);
      row.classList.add("clickable"); 

      row.addEventListener("click", () => {
        this.handleRowClick(id);
      });
  
      // Generate cell content using createMobileHtml
      row.innerHTML = this.createObjectHtml(id, collection, data);
  
      //row.appendChild(cell);
      this.table.appendChild(row);
    }
  
    updateObject(domain, event, object) {

      let id = object.id;
      let collection = object.collection;
      let updatedData = object.data;


      // Find the row corresponding to the updated data
      const rows = this.table.getElementsByTagName("tr");
      for (const row of rows) {
        const rowDataId = row.getAttribute("data-id");
        if (rowDataId === id) {
          // Generate updated cell content using createMobileHtml
          const cell = row.querySelector("td");
          row.innerHTML = this.createObjectHtml(id, collection, updatedData);
          break;
        }
      }
    }

    hideObject(domain, event, id) {

      

      // Find the row corresponding to the updated data
      const rows = this.table.getElementsByTagName("tr");
      for (const row of rows) {
        const rowDataId = row.getAttribute("data-id");
        if (rowDataId === id) {
          row.style.display = 'none';
            break;
        }
      }
    }

    unHideObject(domain, event, object) {

      let id = object.id;
      let collection = object.collection;
      let updatedData = object.data;


      // Find the row corresponding to the updated data
      const rows = this.table.getElementsByTagName("tr");
      for (const row of rows) {
        const rowDataId = row.getAttribute("data-id");
        if (rowDataId === id) {
          row.style.display = '';
            break;
        }
      }
    }
  
    removeObject(domain, event, id) {
      // Find the row corresponding to the provided ID
      const rows = this.table.getElementsByTagName("tr");
      for (const row of rows) {
        const rowDataId = row.getAttribute("data-id");
        if (rowDataId === id) {
          // Remove the row from the table
          this.table.removeChild(row);
          break;
        }
      }
    }
  }
  
  export default vi_ObjectGridView;
  