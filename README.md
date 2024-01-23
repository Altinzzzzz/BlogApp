# BlogApp
A simple BlogApp where users can upload blogs about whatever comes to their minds

# Project Stack

Frontend: React
Backend: Nodejs
Database: MongoDB

# Project Initialization
After opening the project folder in Visual Studio Code, run the following command to install the required modules:

Using npm:
npm install

Using yarn:
yarn install

(This will install the necessary dependencies listed in the package.json file)

# Next, install the specific project dependencies:

Using npm:
npm install autoprefixer bcryptjs cookie-parser cors express jsonwebtoken mongoose multer fs nodemon postcss-cli tailwindcss

Navigate to client folder with "cd client" and install the dependencies npm i react-quill date-fns --save

Using yarn:
yarn add autoprefixer bcryptjs cookie-parser cors express jsonwebtoken mongoose multer fs nodemon postcss-cli tailwindcss react-quill date-fns

Navigate to the client folder with "cd client" and install the dependencies yarn add react-quill date-fns --save

# The connection to the database: MongoDB is done in the api/index.js file on line 25 

# Project Setup
After installing the dependencies, follow these steps:

# 1. Frontend (client folder)
- Open a terminal.
- Navigate to the client folder:
- cd client
- Start the frontend project:
- run "npm start" / run "yarn start"

# 2. Backend (api folder)
- Open another terminal.
- Navigate to the API folder:
- cd api
- Start the backend server:
- run "node index.js"

Note: The backend server runs on port 3001 by default. You can change this in the api/index.js file, but ensure that you update the corresponding calls in the client files.

# The project should now be up and running! Feel free to explore and have a great experience!
