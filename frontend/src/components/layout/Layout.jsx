import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen grid-bg">
      <Sidebar />
      <main className="ml-[260px] min-h-screen transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
