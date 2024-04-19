

import vi_RemoteListener from "./vi_remote_listener.js"

export class vi_mqtt_listener extends vi_RemoteListener {
  
  constructor(broker, options, topic,  objectModel) {

    super();
    this.broker = broker;
    this.options = options;
    this.topic = topic;
    this.mqtt = null;
    this.objectModel = objectModel;
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async init() {
    try {
      await this.loadScript('https://unpkg.com/mqtt/dist/mqtt.min.js');
      this.connect();
    } catch (error) {
      console.error('Error loading MQTT library:', error);
    }
  }

  connect() {
    if (!window.mqtt) {
      console.error('MQTT library not loaded.');
      return;
    }
    try {
      this.mqtt = window.mqtt.connect(this.broker, this.options);
      this.mqtt.on('connect', () => {
        console.log('Connected');
        this.subscribe();
      });
      this.mqtt.on('message', (t,m)=> this.handleMessage(t,m));
      this.mqtt.on('error', this.handleError);
    } catch (err) {
      console.error('Error creating MQTT client:', err);
    }
  }

  subscribe() {
    if (this.mqtt) {
      this.mqtt.subscribe(this.topic, (err) => {
        if (!err) {
          console.log('Subscribed to topic:', this.topic);
        } else {
          console.log('Subscription failed:', err);
        }
      });
    }
  }

  handleMessage(topic, message) {
    if (Array.isArray(message) || ArrayBuffer.isView(message)) {
      console.log(message);
      console.log(message.toString());

      const jsonString = new TextDecoder().decode(message);

      // Parse the JSON string
      const msg = JSON.parse(jsonString);

      if(msg.msgType == 2){

        const docId =msg.IMEI;

        const record = {
           id:docId,
           type: 'gateways',
           position:{
              _lat: msg.Latitude,
              _long: msg.Longitude
           },
           fields:msg

         };

         this.objectModel.updateOrAddObject(docId, 'gateways', record);

      }

      if(msg.msgType == 11){

        const docId =msg.IMEI + '/' + msg.MACAddr;

        const record = {
           id:docId,
           type: 'sensors',
           fields:msg

         };

         this.objectModel.updateOrAddObject(docId, 'sensors', record);

      }

      
      
     
    } else {
      console.log('Unsupported message format');
    }
  }

  handleError(err) {
    console.error('Error:', err);
  } 

  
}

 
