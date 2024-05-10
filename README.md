# File Upload and Management System

Welcome to the skiywater File upload and management system. This project provides very useful endpoint for secure upload and management of file to the cloud. The RESTful API will facilitate user interactions and file management within the platform.

## Project Setup Instructions

To set up the project, follow these steps:


## To run locally:
### Install mongodb on your local machine:

Ubuntu: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/ 
Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/

Edit "MONGO_URL_DEV"  field in your .env file and specify db name of your choice
e.g MONGO_URL_DEV="mongodb://localhost/skiywater" where "skiywater" is the db name


1. Clone the repository:
   ```bash
   git clone https://github.com/Timmy-Edibo/skiywater.git


2. Navigate to the project directory:
    ```bash
    cd skiywater.git


3. Install dependencies::
    ```bash
    npm install



4. RUn the TypeScript files:
    ```bash
    npm run dev


5. To run test:
    ```bash
    npm test


6. Build the TypeScript files:
    ```bash
    npm run build


Dependencies
The project uses the following dependencies:

Express.js: A web application framework for Node.js
TypeScript: A superset of JavaScript that adds static types
Other necessary dependencies are listed in the package.json file.
How to Run the API
Once the project is set up, you can start the server by running:
    ```bash
    npm start


This will start the Express server, and the API will be accessible at http://localhost:3000.

For development purposes, you can run the following command which will start the server with auto-reload enabled:
    ```bash
        npm run dev


API Documentation
The API documentation will be available at https://bit.ly/skiywater-backend-tasks-docs once the server is running.


Solution

## Link to documentation (Postman API Documentation)
https://bit.ly/skiywater-backend-tasks-docs


## EMR Diagram:
https://lucid.app/lucidchart/823e7c53-bd02-4020-8215-91c91863ff3b/edit?viewport_loc=-808%2C93%2C2246%2C1044%2C0_0&invitationId=inv_9bbb677d-d6c3-469b-b4f2-832af69807fd



## GitHub link:
https://github.com/Timmy-Edibo/skiywater


## Link to the backend (Hosted on Render Cloud)
https://skiywater.onrender.com


# Technologies and toolings Used:
- Express Js (Webserver for handling HTTP and WebSocket requests)
- Multer
- AWS S3 (Cloud object storage for storing files)
- MongoDB (Used for storing users and File)
- Postman (API testing and documentation)
- GitHub (Code repository)
