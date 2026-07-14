import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '../../styles.css'   // 바닐라 프로토타입과 같은 스타일 재사용

createRoot(document.getElementById('root')).render(<App />)
