import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* O Outlet renderizará a página correspondente à rota atual */}
      <Outlet />
    </div>
  );
}

export default App;