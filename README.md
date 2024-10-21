# royalgames
Fork the repository from the Royal Games GitHub link to your GitHub account.
Clone the forked repository to your local machine using the provided link.
Navigate to the /royalgames/royalgames-next directory.
Install all necessary dependencies without overwriting existing configurations.
The tailwind.config.js file has already been updated correctly:

tailwind.config.js

The globals.css file is present in /src/app/ and contains the necessary Tailwind imports:

globals.css
The tsconfig.json file is properly configured:

tsconfig.json

The components in the src/components directory have been renamed to TypeScript files (.tsx). Update their TypeScript syntax:

GameList.tsx:



Updated GameList.tsx

Game.tsx:

Updated Game.tsx
Header.tsx:

Updated Header.tsx
The src directory already exists in the Next.js project.
The necessary files from the old project have been copied to the new project.
The Redux store file (store.ts) has been created with the correct configuration:

store.ts
The Redux slices have been moved to the store.
The pages have been moved to the /src/app directory.
The Next.js App Router has been set up with layout.tsx and page.tsx files:


layout.tsx:

layout.tsx

page.tsx:

page.tsx
The Socket.io client library is already installed.
The Socket.io client setup in socket.tsx has been verified:

socket.tsx

The app is already wrapped in the SocketProvider in layout.tsx.
The custom server (server.js and index.js) has been set up:


server.js:

server.js

index.js:

index.js

The start script in package.json has been updated to use server.js:

package.json
To complete the migration, follow these final steps:

Review the import statements in all components and ensure they point to the correct locations.
Install any missing dependencies:
Copynpm install @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome axios gsap pixi.js react-router-dom

Update the next.config.js file to handle image imports:

next.config.js

Install the url-loader:
npm install --save-dev url-loader

Update the tsconfig.json to include the new src directory:

Updated tsconfig.json

Run the development server to test the application: