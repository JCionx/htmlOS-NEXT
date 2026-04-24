const Unblocker = require('unblocker');
const { Transform } = require('stream');

function createProxy() {
  return new Unblocker({ 
    prefix: '/proxy/',
    standardizeOrigin: true,
    persistSession: true,
    requestMiddleware: [
      (data) => {
        // Read htmlos_theme cookie from the client request
        const clientCookies = data.clientRequest.headers['cookie'] || '';
        const match = clientCookies.match(/htmlos_theme=(light|dark)/);
        const theme = match ? match[1] : 'light';

        // 1. Client Hints (HTTP)
        data.headers['sec-ch-prefers-color-scheme'] = theme;
        
        // Pass theme to response middleware via data object
        data.clientTheme = theme;
        // Make sure it doesn't get stripped by mistake or conflict if the client sent none
        data.headers['Sec-CH-Prefers-Color-Scheme'] = theme;
      }
    ],
    responseMiddleware: [
      (data) => {
        // Strip out headers that prevent iframe rendering
        if (data.headers) {
          if (data.headers['set-cookie']) {
            const cookies = data.headers['set-cookie'];
            data.headers['set-cookie'] = (Array.isArray(cookies) ? cookies : [cookies]).map(cookie => {
              return cookie + '; SameSite=None; Secure';
            })
          }
          delete data.headers['x-frame-options'];
          delete data.headers['content-security-policy'];
          delete data.headers['content-security-policy-report-only'];
        }

        if (data.contentType && data.contentType.includes('text/html')) {
          let injected = false;
          
          // data.url contains the remote URL being requested
          const remoteUrl = data.url || '';

          const scriptToInject = `
            <script>
              // 1. matchMedia Override (JS)
              const originalMatchMedia = window.matchMedia;
              window.matchMedia = function(query) {
                if (query && query.includes('prefers-color-scheme')) {
                  const isDarkQuery = query.includes('dark');
                  const themeIsDark = '${data.clientTheme}' === 'dark';
                  const matches = isDarkQuery === themeIsDark;
                  return {
                    matches: matches,
                    media: query,
                    onchange: null,
                    addListener: function(fn) {},
                    removeListener: function(fn) {},
                    addEventListener: function(type, fn) {},
                    removeEventListener: function(type, fn) {},
                    dispatchEvent: function() { return true; }
                  };
                }
                return originalMatchMedia.call(window, query);
              };

              document.addEventListener('DOMContentLoaded', function() {
                // 2. Meta color-scheme
                let meta = document.querySelector('meta[name="color-scheme"]');
                if (!meta) {
                  meta = document.createElement('meta');
                  meta.name = "color-scheme";
                  document.head.appendChild(meta);
                }
                meta.content = "${data.clientTheme}";

                window.parent.postMessage({
                  type: 'PROXIED_PAGE_LOADED',
                  url: "${remoteUrl}",
                  title: document.title
                }, '*');
              });

              document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                
                if (link && link.target === '_blank') {
                  e.preventDefault();
                  e.stopPropagation();
                  window.parent.postMessage({
                    type: 'OPEN_PROXIED_WINDOW',
                    url: link.href
                  }, '*');
                }
              }, true); // use capture phase to intercept early
            </script>
            <style>
              /* 3. CSS color-scheme */
              :root { color-scheme: ${data.clientTheme} !important; }
            </style>
          `;

          const themeD = data.clientTheme === 'dark' ? 'min-width: 0' : 'max-width: 0';
          const themeL = data.clientTheme === 'light' ? 'min-width: 0' : 'max-width: 0';

          const injectTransform = new Transform({
            transform(chunk, encoding, callback) {
              let chunkStr = chunk.toString();
              
              // 4. CSS @media override in inline styles or HTML text
              chunkStr = chunkStr.replace(/\(\s*prefers-color-scheme\s*:\s*dark\s*\)/gi, '(' + themeD + ')');
              chunkStr = chunkStr.replace(/\(\s*prefers-color-scheme\s*:\s*light\s*\)/gi, '(' + themeL + ')');

              if (!injected && /<head[^>]*>/i.test(chunkStr)) {
                chunkStr = chunkStr.replace(/(<head[^>]*>)/i, '$1' + scriptToInject);
                injected = true;
              } else if (!injected && /<\/body>/i.test(chunkStr)) {
                chunkStr = chunkStr.replace(/(<\/body>)/i, scriptToInject + '$1');
                injected = true;
              }
              
              this.push(Buffer.from(chunkStr));
              callback();
            },
            flush(callback) {
              if (!injected) {
                this.push(Buffer.from(scriptToInject));
              }
              callback();
            }
          });
          
          delete data.headers['content-length'];

          data.stream = data.stream.pipe(injectTransform);
        } else if (data.contentType && data.contentType.includes('text/css')) {
          const themeD = data.clientTheme === 'dark' ? 'min-width: 0' : 'max-width: 0';
          const themeL = data.clientTheme === 'light' ? 'min-width: 0' : 'max-width: 0';

          const cssTransform = new Transform({
            transform(chunk, encoding, callback) {
              let chunkStr = chunk.toString();
              chunkStr = chunkStr.replace(/\(\s*prefers-color-scheme\s*:\s*dark\s*\)/gi, '(' + themeD + ')');
              chunkStr = chunkStr.replace(/\(\s*prefers-color-scheme\s*:\s*light\s*\)/gi, '(' + themeL + ')');
              this.push(Buffer.from(chunkStr));
              callback();
            }
          });

          // Prevent content-length mismatch errors due to string replacement making it shorter/longer
          delete data.headers['content-length'];

          data.stream = data.stream.pipe(cssTransform);
        }
      }
    ]
  });
}

module.exports = createProxy;
