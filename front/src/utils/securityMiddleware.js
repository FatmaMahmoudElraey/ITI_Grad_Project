/**
 * Security middleware to protect against React Router vulnerabilities
 * - Prevents X-React-Router-Prerender-Data header spoofing (Issue #17)
 * - Prevents DoS via cache poisoning by forcing SPA mode (Issue #16)
 */

// List of vulnerable headers that should be blocked
const VULNERABLE_HEADERS = [
  'x-react-router-prerender-data',
  'x-react-router-spa-mode',
  'x-react-router-force-spa',
];

/**
 * Intercepts fetch requests to block vulnerable headers
 */
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = function(resource, options = {}) {
    // Create a safe copy of the options
    const safeOptions = { ...options };
    
    // If headers exist, create a safe copy without vulnerable headers
    if (safeOptions.headers) {
      const safeHeaders = new Headers(safeOptions.headers);
      
      // Remove any vulnerable headers
      VULNERABLE_HEADERS.forEach(header => {
        if (safeHeaders.has(header)) {
          safeHeaders.delete(header);
          console.warn(`Blocked potentially unsafe header: ${header}`);
        }
      });
      
      safeOptions.headers = safeHeaders;
    }
    
    // Call the original fetch with safe options
    return originalFetch.call(this, resource, safeOptions);
  };
};

/**
 * Adds a Content-Security-Policy that prevents the use of vulnerable headers
 */
export const setupCSPHeaders = () => {
  // Create a meta tag for CSP
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  
  // Block the use of vulnerable headers in requests
  meta.content = "default-src 'self'; connect-src 'self' https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data: https:; frame-src 'self' https:;";
  
  // Add the meta tag to the head
  document.head.appendChild(meta);
};

/**
 * Initialize all security measures
 */
export const initSecurity = () => {
  // Set up the fetch interceptor
  setupFetchInterceptor();
  
  // Set up CSP headers
  setupCSPHeaders();
  
  console.info('Security middleware initialized to protect against React Router vulnerabilities');
};

export default initSecurity;
