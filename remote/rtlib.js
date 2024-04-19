//import { Amplify, Auth, Hub, PubSub } from '/front/viOne/static/js/main.2f4e6ab3.js';
//import {  AWSIoTProvider , CONNECTION_STATE_CHANGE } from '/front/viOne/static/js/main.2f4e6ab3.js';
 




class RealTimeLib {

	constructor(rtLibClass,SETTINGS, CONFIG) {

	  var rtLibInstance = new rtLibClass();

	  this.amplify = rtLibInstance.Amplify;
	  this.auth = rtLibInstance.Auth;
	  this.hub = rtLibInstance.Hub;
	  this.pubSub = rtLibInstance.PubSub;
	  this.awsIoTProvider = rtLibInstance.AWSIoTProvider;
	  this.connectionStateChange = rtLibInstance.CONNECTION_STATE_CHANGE;
  
	  this.SETTINGS = SETTINGS;

	  this.CONFIG= CONFIG;
  
	  this.subscribers = [];
	}
  
	initialize() {
	  return new Promise(async (resolve, reject) => {
		try {
		  await this.amplify.configure(this.CONFIG);
  
		  this.hub.listen('pubsub', (data) => {
			const { payload } = data;
			if (payload.event === this.connectionStateChange) {
			  const { connectionState } = payload.data;
			  console.log(connectionState);
			}
		  });
  
		  this.user = await this.auth.currentAuthenticatedUser({ bypassCache: false });
		  this.subscribe();
  
		  resolve(); // Signal that initialization is complete
		} catch (error) {
		  console.error('Initialization error:', error);
		  reject(error); // Signal that initialization failed
		}
	  });
	}
  
	onMessage(f) {
	  if (typeof f === 'function') {
		console.log('Subscribing...');
		this.pubSub.subscribe(this.SETTINGS.CHANNEL).subscribe({
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
		const _user = await this.auth.signIn(this.SETTINGS.IAM_USERNAME, this.SETTINGS.IAM_PASSWORD);
		this.user = _user;
		this.subscribe();
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
  
	async subscribe() {
	  this.amplify.addPluggable(
		new this.awsIoTProvider({
		  aws_pubsub_region: this.SETTINGS.AWS_REGION,
		  aws_pubsub_endpoint: this.SETTINGS.AWS_WEBSOCKET,
		})
	  );
	}
  }
  

  

export { RealTimeLib  as RealTimeLib};

/*
class RealTimeLib {

	constructor(rtLibClass){

		var rtLibInstance = new rtLibClass();

		this.amplify = rtLibInstance.Amplify;
    	this.auth = rtLibInstance.Auth;
    	this.hub = rtLibInstance.Hub;
    	this.pubSub = rtLibInstance.PubSub;
    	this.awsIoTProvider = rtLibInstance.AWSIoTProvider;
    	this.connectionStateChange = rtLibInstance.CONNECTION_STATE_CHANGE;

		this.amplify.configure({
			Auth: {
			  identityPoolId: 'us-east-1:b52d3392-dd5a-4aa4-b4a5-203d3df23ef3',
			  region: 'us-east-1',
			  userPoolId: 'us-east-1_2FfwVWHSA',
			  userPoolWebClientId: '37p9ficqb17ou7r8kdm7utgf2a'
			}
		});

		this.hub.listen('pubsub', (data) => {

			const { payload } = data;
		
			if (payload.event === this.connectionStateChange) {
		
				const { connectionState } = payload.data;
				console.log(connectionState);
		
			}
		
		});

		this.SETTINGS = {
			AWS_REGION: 'us-east-1',
			AWS_WEBSOCKET: 'wss://a1q6zds606s7ll-ats.iot.us-east-1.amazonaws.com/mqtt',
			CHANNEL: `routes/vehicles/d0c1a9b3-81fb-4b45-b42b-dc170408a227`,
			IAM_PASSWORD: 'uhGZJg6uo2U!',
			IAM_USERNAME: 'adonai@bsdenterprise.com'
	   };
		


		this.subscribers = [ ];

		this.auth.currentAuthenticatedUser({ bypassCache: false })
		.then(_user => {

			this.user = _user;
			this._subscribe();

		})
		.catch(e => {

		    this._signIn();
		    console.log('user not signed in. signing in...');

		});

	}


	onMessage(f){

		if(typeof f === 'function'){

			console.log('Subscribing...');

			this.pubSub.subscribe(this.SETTINGS.CHANNEL).subscribe({
			    next: data => {
			    	f(data);
			    	// this.subscribers.forEach(subscribeFn => subscribeFn(data));
			    	console.log('Message received', data)
			    },
			    error: error => console.error(error),
			    complete: () => console.log('Done with subscription...'),
			});

				return this.subscribers.push(f);
		}

		return console.error('onMessage requires a function.');

	}


	async _signIn(){

		try {

	        const _user = await this.auth.signIn(this.SETTINGS.IAM_USERNAME, this.SETTINGS.IAM_PASSWORD);
	        
	        this.user = _user;
	        this._subscribe();

	    } catch (error) {

	        console.log('error signing in', error);

	    }

	}


	async _signOut(){

	    try{
	        await this.auth.signOut();
	        this.user = undefined;
	    } catch(e){
	        console.error(e);
	    }

	}


	async _subscribe(){

		this.amplify.addPluggable(
			new this.awsIoTProvider({
				aws_pubsub_region: this.SETTINGS.AWS_REGION,
  			aws_pubsub_endpoint: this.SETTINGS.AWS_WEBSOCKET,
			})
		);
	}

}


export { RealTimeLib  as RealTimeLib};
*/