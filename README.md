# royalgames

Step-by-Step Workflow for Local Setup
**Step 1: Repository Setup**
Fork then clone the original repository to local machine:

bash
git clone https://github.com/realbrodiwhite/royalgames.git
cd royalgames

Navigate to the /royalgames/royalgames-next Directory and install the dependencies:

bash
cd royalgames-next
npm install typescript tailwindcss postcss autoprefixer react-redux @reduxjs/toolkit socket.io-client express eslint

**Step 2: Tailwind CSS Setup**
Initialize Tailwind CSS (if not already set up):

bash
Copy code
npx tailwindcss init -p

Open tailwind.config.js and update the content paths to include:

javascript
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

Then ensure the globals.css file includes:

css
@tailwind base;
@tailwind components;
@tailwind utilities;

**Step 3: Move and Convert Existing Files (Main Focus)**
The /royalgames/royalgames-client directory contains the following main folders and files which are relevant for your migration to royalgames-next:

/royalgames/royalgames-client/src: Contains the JavaScript, React, React-Redux files like store.js and lobbySlice.js. for the client application.
/royalgames/royalgames-client/public:
/royalgames/royalgames-client/src/context: Contains socket.js, which you need for Socket.io integration.
/royalgames/royalgames-server/index.js: The servers current file for entry
/royalgames/royalgames-server/index.js: The servers current file for entry
/royalgames/royalgames-server/server.js: Called to extend index.js

Steps to Move and Convert Files:

Move Files from royalgames-client to royalgames-next:

Move store.js:

Source: royalgames-client/src/redux/store.js
Destination: royalgames-next/src/store.js
Command:
bash
Copy code
cp royalgames-client/src/redux/store.js royalgames-next/src/store.js
Move lobbySlice.js:

Source: royalgames-client/src/redux/lobbySlice.js
Destination: royalgames-next/src/lobbySlice.js
Command:
bash
Copy code
cp royalgames-client/src/redux/lobbySlice.js royalgames-next/src/lobbySlice.js
Move socket.js:

Source: royalgames-client/src/context/socket.js
Destination: royalgames-next/src/context/socket.js
Command:
bash
Copy code
cp royalgames-client/src/context/socket.js royalgames-next/src/context/socket.js
Rename JavaScript Files to TypeScript:

Rename store.js to TypeScript:

bash
Copy code
mv royalgames-next/src/store.js royalgames-next/src/store.ts
Rename lobbySlice.js to TypeScript:

bash
Copy code
mv royalgames-next/src/lobbySlice.js royalgames-next/src/lobbySlice.ts
Rename socket.js to TypeScript (tsx):

bash
Copy code
mv royalgames-next/src/context/socket.js royalgames-next/src/context/socket.tsx
Step 4: Update Files to TypeScript
Update store.ts:

Open royalgames-next/src/store.ts and make the following updates:

Import Redux tools:

typescript
Copy code
import { configureStore } from '@reduxjs/toolkit';
import lobbyReducer from './lobbySlice';
Configure and export the store:

typescript
Copy code
export const store = configureStore({
  reducer: {
    lobby: lobbyReducer,
  },
});
Add type definitions for the store:

typescript
Copy code
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
Update lobbySlice.ts:

Open royalgames-next/src/lobbySlice.ts and add TypeScript annotations:

Update imports to include TypeScript:

typescript
Copy code
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
Define an interface for initialState:

typescript
Copy code
interface LobbyState {
  value: number; // Update to match actual state properties
}

const initialState: LobbyState = {
  value: 0,
};
Update reducer functions:

typescript
Copy code
reducers: {
  increment: (state) => {
    state.value += 1;
  },
  decrement: (state) => {
    state.value -= 1;
  },
  incrementByAmount: (state, action: PayloadAction<number>) => {
    state.value += action.payload;
  },
},
Update socket.tsx:

Open royalgames-next/src/context/socket.tsx and adjust the following:

Update imports:

typescript
Copy code
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
Define type interfaces:

typescript
Copy code
interface SocketContextProps {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextProps>({ socket: null });

interface SocketProviderProps {
  children: ReactNode;
}
Update SocketProvider to be typed:

typescript
Copy code
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const retryConnect = useCallback((): void => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  const handleConnect = useCallback((): void => {
    console.log('Socket connected');
  }, []);

  const handleDisconnect = useCallback((): void => {
    console.log('Socket disconnected');
    retryConnect();
  }, [retryConnect]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket, handleConnect, handleDisconnect]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
Step 5: Set Up the Layout
Update layout.tsx:
Open royalgames-next/src/app/layout.tsx and wrap the application with both Redux and Socket.io providers:

Update imports:

typescript
Copy code
import '../globals.css';
import { Provider } from 'react-redux';
import { store } from '../store';
import { SocketProvider } from '../context/socket';
Wrap children with the providers:

tsx
Copy code
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <SocketProvider>{children}</SocketProvider>
        </Provider>
      </body>
    </html>
  );
}
Step 6: Backend Server Setup
Check Backend Server (server.js and index.js):

Make sure server.js exists in the root directory of royalgames-server and is properly set up to handle Socket.io.
Update Environment Variables:

Create a .env file in the root of royalgames-next:
env
Copy code
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
Update package.json Scripts:

Modify package.json to use server.js for starting the application:
json
Copy code
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "node server.js"
}
Step 7: Testing & Deployment
Testing:

Run the application in development mode:
bash
Copy code
npm run dev
Verify Socket.io connections by opening multiple tabs.
Confirm Redux state is working using developer tools.
Production Build:

Build and start in production mode:
bash
Copy code
npm run build
npm run start
This workflow combines detailed file movement and updates, especially focusing on the migration