import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './SoltwinAi2.tsx'

// Apply initial styles to the root element
const rootStyle = document.createElement('style')
rootStyle.textContent = `
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
`
document.head.appendChild(rootStyle)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
