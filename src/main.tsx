import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// StrictMode намеренно выключен: он дважды вызывает эффекты в dev-режиме,
// и ленты событий в демо useEffect / useLayoutEffect читались бы вдвое.
createRoot(document.getElementById('root')!).render(<App />)
