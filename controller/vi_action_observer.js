/*

  VISUAL INTERACTION SYSTEMS

  ActionObserver implementa un patron Observador

    Permite agregar observadores a una lista y notifcarle a cada uno de ellos
    mediante el metodo notify

    observers es una lista de listas, agrupadas por accion


    nota : los observadores son Funciones

*/

class vi_ActionObserver {
  constructor() {
    this.observers = {};
  }

  addObserver(domain, actionName, observerFunction) {
    if (!this.observers[domain]) {
      this.observers[domain] = {};
    }

    if (!this.observers[domain][actionName]) {
      this.observers[domain][actionName] = [];
    }

    this.observers[domain][actionName].push(observerFunction);
  }

  notify(domain, actionName, payload) {
    const observers = this.observers[domain] && this.observers[domain][actionName];
    if (observers) {
      observers.forEach((observer) => {
        observer(domain, actionName, payload);
      });
    }
  }
}

export default vi_ActionObserver;

  
 