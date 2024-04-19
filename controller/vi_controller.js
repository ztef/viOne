/*

  VISUAL INTERACTION SYSTEMS

  Implementacion de un Controlador Universal Observable


*/

import vi_ActionObserver from './vi_action_observer.js';


class vi_Controller {
    constructor() {

      this.actionObserver = new vi_ActionObserver();
      this.model = null;  
     
    }


    setModel(m){
      this.model = m;
    }



    /*
        domain<<<<<<<
        Agrega a un Observador (una Funcion) para una accion determinada
    */

    addObserver(domain, actionName, observerFunction) {
        this.actionObserver.addObserver(domain, actionName, observerFunction);
    }
    

    triggerAction(domain, action, data){
      this.actionObserver.notify(domain, action, data);
    }


    triggerCollectionLoaded(collection){
      this.actionObserver.notify(collection, 'collectionLoaded', {});
    }

    triggerAllCollectionsLoaded(){
      this.actionObserver.notify('', 'allCollectionsLoaded', {});
    }

    triggerObjectSelected(domain, data) {
        this.actionObserver.notify(domain, 'objectSelected', data);
    }

    triggerObjectPicked(domain, data) {
      this.actionObserver.notify(domain, 'objectPicked', data);
    }


    triggerObjectAdded(domain, data) {
      
      this.actionObserver.notify(domain, 'objectAdded', data);
    }

    triggerObjectUnFiltered(domain, data) {
      
      this.actionObserver.notify(domain, 'objectUnFiltered', data);
    }

    triggerObjectUpdated(domain, data) {
      
      this.actionObserver.notify(domain, 'objectUpdated', data);
    }

    triggerObjectDeleted(domain, data) {
      this.actionObserver.notify(domain, 'objectDeleted', data);
    }

    triggerObjectFiltered(domain, data) {
      
      this.actionObserver.notify(domain, 'objectFiltered', data);
    }


  
   
  
}
  
  export default vi_Controller;
  