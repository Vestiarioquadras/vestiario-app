import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import App from './App.jsx'
import './scripts/populateFirestoreAuth.js' // Importar script de população com autenticação
import './scripts/clearFirestoreData.js' // Importar script de limpeza
import './scripts/debugFirestore.js' // Importar script de debug
import './scripts/checkAllFirestoreData.js' // Importar script de verificação completa
import './scripts/updateFirestoreRules.js' // Importar script de atualização de regras
import './scripts/populatePlayerData.js' // Importar script de dados do jogador
import './scripts/createPlayerData.js' // Importar script simples de criação de dados
import './scripts/updateFavorites.js' // Importar script de atualização de favoritos
import './scripts/fixFavorites.js' // Importar script de correção de favoritos
import './scripts/testSearch.js' // Importar script de teste de busca
import './scripts/updateCourtsWithStates.js' // Importar script de atualização de estados
import './scripts/testCourts.js' // Importar script de teste de quadras
import './scripts/debugEstablishment.js' // Importar script de debug do estabelecimento
import './scripts/debugApp.js' // Importar script de debug da aplicação
import './scripts/testReact.js' // Importar script de teste do React
import './scripts/debugFavorites.js' // Importar script de debug de favoritos
import './scripts/debugCourtsData.js' // Importar script de debug dos dados das quadras

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <App />
  </BrowserRouter>
)
