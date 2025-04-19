Author: Daniel Schuster
Chat app backend project

Contents:
   1. Prerequisites
   2. Installation
   3. Usage
   4. Features
   5. Testing

1. Prerequisites:
      Ensure the following are installed on your machine before proceeding:
         Node.js
         npm (comes with Node)
         MongoDB Community Edition

2. Installation:
      Clone repository or download source code
      Navigate to CS314project/backend directory in terminal
      install dependencies:
         npm install

3. Usage:
      Start the server:
         npm run dev
         server will run at http://localhost:8747

      Access the frontend client (not created by me):
         open web browser
         go to the following link
         https://dreamqin68.github.io/frontend-project/

      Notes:
         a. occasionally it requires reloading https://dreamqin68.github.io/frontend-project/
         for the backend operations to reflect on the frontend, especially when logging in
         b. the minimal-frontend folder contains simple frontend, not written by me, that was used earlier in development.  The backend is currently set up to use the full frontend accessed at the link above.  

4. Features:
      Auth: user signup, user login, get user info, update user profile, user logout
      Contacts: search contacts, get contacts for list, all contacts, delete DMs with a contact
      Messages: get messages, websocket events for sending and receiving messages in real time

5. Testing:
      Testing uses the following:
         Jest as the test runner
         Supertest to simulate http requests against the Express server
         @shelf/jest-mongodb to use an in-memory MongoDB instance for test purposes

      Running tests:
         Navigate to the CS314project/backend directory in terminal
         use the following command:
            npm run test

      