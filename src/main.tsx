import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
