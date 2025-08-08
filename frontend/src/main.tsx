import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import GetPlaylists from './pages/GetPlaylists';
import TransferPlaylists from './pages/TransferPlaylists';
import Home from './pages/Home';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/get-playlists" element={<GetPlaylists />} />
      <Route path="/transfer-playlists" element={<TransferPlaylists />} />
    </Routes>
  </BrowserRouter>
)
