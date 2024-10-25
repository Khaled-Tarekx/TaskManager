import swaggerJsdoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Express API',
			version: '1.0.0',
			description: 'A simple Express API',
		},
		servers: [
			{
				url: 'http://localhost:7500/api',
			},
		],
	},
	apis: ['../modules/**/controllers.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
