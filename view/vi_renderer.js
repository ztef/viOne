class vi_Renderer {

    constructor(controller,domains) {
      // ...
  
    
      this.controller = controller;
  
  
  
      domains.forEach((domain)=>{
  
        this.controller.addObserver(domain,'objectSelected', this.handleObjectSelectedOutside.bind(this));
        this.controller.addObserver(domain,'objectAdded', this.addObject.bind(this));
        this.controller.addObserver(domain,'objectUpdated', this.updateObject.bind(this));
        this.controller.addObserver(domain,'objectDeleted', this.removeObject.bind(this));
  
      });
  
     
  
  
        this.viewer = null;
        this.objectEntity = null;
        this.tooltipElement = null;
    
        
  
        this.objectEntities = new Map();
        
        
      }
  
  
      initialize() {
         
      }
  
  
       
   
    }
    
  
    export default vi_Renderer;