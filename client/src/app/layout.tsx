import { FC, ReactNode } from 'react';
import { SocketProvider } from '../context/socket';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <SocketProvider>
      <div>
        <header>
          <h1>Royal Games</h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2023 Royal Games</p>
        </footer>
      </div>
    </SocketProvider>
  );
};

export default Layout;
