import { StrictMode } from 'react' // Importing StrictMode from React for strict rendering
import { createRoot } from 'react-dom/client' // Importing createRoot from react-dom for rendering the app
import './styles/index.css' // Importing main CSS styles
import './fonts.css' // Importing custom fonts
import './custom.css' // Importing additional custom styles
import App from './App.tsx' // Importing the main App component

// Creating a root for the React application and rendering it
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> {/* Rendering the App component within StrictMode */}
  </StrictMode>,
)
