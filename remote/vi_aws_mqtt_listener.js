

import vi_RemoteListener from "./vi_remote_listener.js"



class vi_aws_mqtt_listener extends vi_RemoteListener {
  constructor(dataSource, objectModel) {

    super();
    this.dataSource = dataSource;
    this.collection = dataSource.config.collection;

    this.objectModel = objectModel;

        var rtLibInstance = new dataSource.config.library();
  
        this.amplify = rtLibInstance.Amplify;
        this.auth = rtLibInstance.Auth;
        this.hub = rtLibInstance.Hub;
        this.pubSub = rtLibInstance.PubSub;
        this.awsIoTProvider = rtLibInstance.AWSIoTProvider;
        this.connectionStateChange = rtLibInstance.CONNECTION_STATE_CHANGE;
    
        this.amplifySettings = dataSource.config.credentials.awsSettings;
  
        this.mqttSettings= dataSource.config.credentials.mqttSettings;
    
        this.subscribers = [];
      
   
        this.start();
  }


   
    start() {
        
          try {
                this.amplify.configure(this.amplifySettings);

                this.hub.listen('pubsub', (data) => {
                    const { payload } = data;
                    if (payload.event === this.connectionStateChange) {
                      const { connectionState } = payload.data;
                      console.log(connectionState);
                    }
                  });

                  this.auth.currentAuthenticatedUser({ bypassCache: false })
                    .then(_user => {

                        this.user = _user;
                        this._subscribe().then(()=>{
                            this._setOnMessage((m) => {
                                this.onMessage(m);
                        });
                        });

                    })
                    .catch(e => {

                        this._signIn();
                        console.log('user not signed in. signing in...');

                    });

            
             
          } catch (error) {
            console.error('Initialization error:', error);
            reject(error); // Signal that initialization failed
          }
         
      }
    
      _setOnMessage(f) {
        if (typeof f === 'function') {
          console.log('Subscribing...');
          this.pubSub.subscribe(this.mqttSettings.CHANNEL).subscribe({
            next: (data) => {
              f(data);
              console.log('Message received', data);
            },
            error: (error) => console.error(error),
            complete: () => console.log('Done with subscription...'),
          });
    
          return this.subscribers.push(f);
        }
    
        console.error('onMessage requires a function.');
      }
    
      async _signIn() {
        try {
          const _user = await this.auth.signIn(this.mqttSettings.IAM_USERNAME, this.mqttSettings.IAM_PASSWORD);
          this.user = _user;
          this._subscribe();
        } catch (error) {
          console.error('Error signing in', error);
        }
      }
    
      async _signOut() {
        try {
          await this.auth.signOut();
          this.user = undefined;
        } catch (e) {
          console.error(e);
        }
      }
    
      async _subscribe() {
        this.amplify.addPluggable(
          new this.awsIoTProvider({
            aws_pubsub_region: this.mqttSettings.AWS_REGION,
            aws_pubsub_endpoint: this.mqttSettings.AWS_WEBSOCKET,
          })
        );
    }

    onMessage(m){

        const docId = m.value.deviceId;

        const record = {
            id:docId,
            type: '',
            position:{
                _lat: m.value.location.latitude,
                _long: m.value.location.longitude
            },
            fields:m.value
  
           };

           this.objectModel.updateOrAddObject(docId, this.collection, record);


    }
 

  
}

export default vi_aws_mqtt_listener;
