import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create 404.html that redirects to index.html for SPA routing
const notFoundPage = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>CodeMate - Redirecting</title>
    <script>
      // Single Page Apps for GitHub Pages
      // https://github.com/rafgraph/spa-github-pages
      // This script takes the current url and converts the path and query
      // string into just a query string, and then redirects the browser
      // to the new url with only a query string and hash fragment
      
      // This is to handle SPA routing with GitHub Pages
      var pathSegmentsToKeep = 1;

      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
    Redirecting...
  </body>
</html>
`;

// Create a redirect script for index.html
const indexRedirectScript = `
  <!-- Start Single Page Apps for GitHub Pages -->
  <script>
    // Single Page Apps for GitHub Pages
    // https://github.com/rafgraph/spa-github-pages
    // This script checks to see if a redirect is present in the query string,
    // converts it back into the correct url and adds it to the
    // browser's history using window.history.replaceState(...),
    // which won't cause the browser to attempt to load the new url.
    // When the single page app is loaded further down in this file,
    // the correct url will be waiting in the browser's history for
    // the single page app to route accordingly.
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
  <!-- End Single Page Apps for GitHub Pages -->
`;

// Function to add the redirect script to index.html after build
function setupGitHubPagesSupport() {
  try {
    console.log('Setting up GitHub Pages support...');
    
    // Create the dist directory if it doesn't exist
    const distDir = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Create 404.html for SPA routing on GitHub Pages
    fs.writeFileSync(path.resolve(distDir, '404.html'), notFoundPage);
    console.log('Created 404.html for SPA routing on GitHub Pages');
    
    // Create a .nojekyll file to disable Jekyll processing
    fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '');
    console.log('Created .nojekyll file');
    
    // Add a note to remind to include the redirect script in index.html
    console.log('\nIMPORTANT: For GitHub Pages deployment, add the following script to your index.html <head> section:');
    console.log(indexRedirectScript);
    console.log('\nThis script handles client-side routing for Single Page Applications on GitHub Pages.');
    
    console.log('\nGitHub Pages setup complete!');
  } catch (error) {
    console.error('Error setting up GitHub Pages support:', error);
  }
}

// Run the setup
setupGitHubPagesSupport();