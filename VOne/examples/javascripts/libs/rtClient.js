var RTClient = function(config){

	var serverUrl = config.serverUrl || 'http://geckode.mx';
	var serverPort = config.serverPort || '8088';

	this.room = config.room || 'waste';

	this.connectionUrl = serverUrl + ':' + serverPort;

	this.socket = io.connect(this.connectionUrl, { reconnect: true });

	return this;

};


RTClient.prototype = {

	constructor: RTClient,


	onConnect: function(f){

		if(typeof f !== 'function'){

			console.error('onConnect expects a function as parameter!');
			return -1;

		}


		this.socket.on('connect', function(data){

			f(data);

		});


		this.socket.emit('subscribe', { room: this.room});

		return this;

	},


	onError: function(f){

		if(typeof f !== 'function'){

			console.error('onError expects a function as parameter!');
			return -1;

		}

		this.socket.on('error', function(data){

			f(data);

		});

		return this;

	},


	onDisconnect: function(f){

		if(typeof f !== 'function'){

			console.error('onDisconnect expects a function as parameter!');
			return -1;

		}

		this.socket.on('disconnect', function(data){

			f(data);

		});

		return this;

	},


	onReconnecting: function(f){

		if(typeof f !== 'function'){

			console.error('onReconnecting expects a function as parameter!');
			return -1;

		}

		this.socket.on('reconnecting', function(data){

			f(data);

		});

		return this;

	},


	onMessage: function(f){


		if(typeof f !== 'function'){

			console.error('onMessage expects a function as parameter!');
			return -1;

		}

		this.socket.on('received', function(data){

			f(data);

		});


		return this;

	}

}
