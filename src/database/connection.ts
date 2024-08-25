import mongoose from 'mongoose';

const uri = process.env.URI;

const connectWithRetry = async () => {
	console.log('MongoDB connection with retry');
	await mongoose
		.connect(uri, {
			dbName: 'TaskManager',
			serverSelectionTimeoutMS: 30000, // 30 seconds
			connectTimeoutMS: 30000, // 30 seconds
		})
		.then(() => {
			console.log('MongoDB is connected');
		})
		.catch((err) => {
			console.error(
				'MongoDB connection unsuccessful, retry after 5 seconds.',
				err
			);
			setTimeout(connectWithRetry, 5000);
		});
};

mongoose.connection.on('connected', () => {
	console.log('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (error) => {
	console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
	console.log('Mongoose disconnected');
});

mongoose.set('debug', true);

export default connectWithRetry;
