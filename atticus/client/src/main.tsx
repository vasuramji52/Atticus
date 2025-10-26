import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App'

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_96wClzCbY",
  client_id: "7ikmvo0k2glff8dkqn8chgg3mg",
  redirect_uri: "http://localhost:5174",
  post_logout_redirect_uri: "http://localhost:5174",
  response_type: "code",
  scope: "email openid",
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider {...cognitoAuthConfig}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
