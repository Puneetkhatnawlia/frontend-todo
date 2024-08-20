import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import Body from './body.jsx'
import App from "./App.jsx";
import { BrowserRouter } from 'react-router-dom';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Body /> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
