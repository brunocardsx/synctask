import { Outlet, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  console.log('App component rendered, location:', location.pathname);
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <h1>SyncTask App</h1>
      {/* O Outlet renderizará a página correspondente à rota atual */}
      <Outlet />
    </div>
  );
}

export default App;