import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

// Estilos propios
import './assets/Css/Principales/Global.Oscuro.scss';
import './assets/Css/Principales/Global.Claro.scss';
import './assets/Css/Principales/Global.css';

// Estilos librerias 
import 'boxicons/css/boxicons.min.css';
import 'ldrs/react/Hourglass.css'

import router from './router.jsx';
import { AuthProvider } from './Pages/Context/AuthContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ColorContexts } from './Pages/Context/ColorContexts.jsx';

const queryClient = new QueryClient()

/**
 * Orden de providers (de fuera hacia dentro):
 *   QueryProvider   → cliente react-query global
 *   ColorContexts   → Tema oscuro/claro/sistema
 *   AuthProvider    → proveedor de autenticacion
 *   RouterProvider → proveedor de rutas
 */

function ProvidersWrap({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorContexts>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ColorContexts>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProvidersWrap>
      <RouterProvider router={router} />
    </ProvidersWrap>
  </StrictMode>,
)
