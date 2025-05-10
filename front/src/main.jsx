import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
window.jQuery = window.$ = $;
import 'bootstrap/dist/js/bootstrap.bundle';
import store from './store/index.js';
import { Provider } from 'react-redux';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { initSecurity } from './utils/securityMiddleware';

// Initialize security middleware to protect against React Router vulnerabilities
initSecurity();

createRoot(document.getElementById('root')).render(
  <Provider store={store}>        
  <App />
  </Provider>
)
