// import { Express, Request, Response } from 'express';
// import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
// import { version } from '../../package.json';
// import log from './logger';

// const options: swaggerJsdoc.Options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'REST API Docs',
//       version
//     },
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT'
//         }
//       }
//     },
//     security: [
//       {
//         bearerAuth: []
//       }
//     ]
//   },
//   apis: ['./src/routes/*.ts', './src/schema/*.ts']
// };

// export const swaggerSpec = swaggerJsdoc(options);
