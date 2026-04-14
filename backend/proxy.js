const Unblocker = require('unblocker');
const { Transform } = require('stream');

function createProxy() {
  return new Unblocker({ 
    prefix: '/proxy/',
    responseMiddleware: [
      (data) => {
        // Strip out headers that prevent iframe rendering
        if (data.headers) {
          delete data.headers['x-frame-options'];
          delete data.headers['content-security-policy'];
          delete data.headers['content-security-policy-report-only'];
        }

        // Intercept native file downloads sent via Content-Disposition headers
        if (data.headers && data.headers['content-disposition'] && data.headers['content-disposition'].toLowerCase().includes('attachment')) {
          // Change the response to an HTML page that instantly broadcasts our custom event
          data.contentType = 'text/html';
          if (data.headers['content-type']) {
            data.headers['content-type'] = 'text/html';
          }
          
          let extFilename = 'download';
          const match = /filename="?([^"]+)"?/.exec(data.headers['content-disposition']);
          if (match && match[1]) {
            extFilename = match[1];
          }

          // Very important: Prevent errors when manually overriding a stream by clearing related chunk/size headers
          delete data.headers['content-disposition'];
          delete data.headers['content-length'];
          delete data.headers['content-encoding']; 

          const fallbackScript = `
            <!DOCTYPE html>
            <html><head><script>
              const targetWindow = window.parent !== window ? window.parent : (window.opener ? (window.opener.parent || window.opener) : null);
              if (targetWindow) {
                targetWindow.postMessage({
                  type: 'PROXIED_DOWNLOAD_INTERCEPTED',
                  url: "${data.url}",
                  filename: "${extFilename}"
                }, '*');
              }
              if (window.opener) {
                window.close(); // If it somehow opened in a popup
              } else {
                history.back(); // If it hijacked an iframe frame
              }
            </script></head><body></body></html>
          `;
          
          data.stream = require('stream').Readable.from([Buffer.from(fallbackScript)]);
          return; // Skip normal HTML injection below since we replaced the stream entirely
        }

        if (data.contentType && data.contentType.includes('text/html')) {
          let injected = false;
          
          // data.url contains the remote URL being requested
          const remoteUrl = data.url || '';

          const scriptToInject = `
            <script>
              document.addEventListener('DOMContentLoaded', function() {
                window.parent.postMessage({
                  type: 'PROXIED_PAGE_LOADED',
                  url: "${remoteUrl}",
                  title: document.title
                }, '*');
              });

              // Intercept JS triggered downloads via a.click()
              const originalClick = HTMLAnchorElement.prototype.click;
              HTMLAnchorElement.prototype.click = function() {
                if (this.hasAttribute('download')) {
                  window.parent.postMessage({
                    type: 'PROXIED_DOWNLOAD_INTERCEPTED',
                    url: this.href,
                    filename: this.getAttribute('download') || this.href.split('/').pop() || 'download'
                  }, '*');
                  return;
                }
                return originalClick.apply(this, arguments);
              };

              document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                
                if (link && link.hasAttribute('download')) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.parent.postMessage({
                    type: 'PROXIED_DOWNLOAD_INTERCEPTED',
                    url: link.href,
                    filename: link.getAttribute('download') || link.href.split('/').pop() || 'download'
                  }, '*');
                  return;
                }

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
          `;

          const injectTransform = new Transform({
            transform(chunk, encoding, callback) {
              let chunkStr = chunk.toString();
              // Try to inject before </body>, if present in the current chunk
              if (!injected && /<\/body>/i.test(chunkStr)) {
                chunkStr = chunkStr.replace(/<\/body>/i, scriptToInject + '\n</body>');
                injected = true;
              }
              this.push(Buffer.from(chunkStr));
              callback();
            },
            flush(callback) {
              // If we didn't inject near </body>, append it at the end
              if (!injected) {
                this.push(Buffer.from(scriptToInject));
              }
              callback();
            }
          });
          
          data.stream = data.stream.pipe(injectTransform);
        }
      }
    ]
  });
}

module.exports = createProxy;
