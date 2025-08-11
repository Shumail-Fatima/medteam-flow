import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { NotificationProvider } from './context/NotifSocketContext.tsx'
import {store} from './store/Store'
import { Provider } from "react-redux";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
)
