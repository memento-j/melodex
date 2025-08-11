import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import GetPlaylists from './pages/GetPlaylists';
import TransferPlaylists from './pages/TransferPlaylists';
import Home from './pages/Home';
import { ThemeProvider } from './components/theme-provider';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/get-playlists" element={<GetPlaylists />} />
          <Route path="/transfer-playlists" element={<TransferPlaylists />} />
        </Routes>
    </BrowserRouter>
  </ThemeProvider>
)
