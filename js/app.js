/**
 * app.js
 * Vanilla replacement for src/index.js.
 * No build step, no ReactDOM root, no Redux Provider (the original Redux
 * store was unused dead code — auth state actually lived in AuthContext /
 * localStorage, which this project's Auth module now owns directly).
 */
renderNavbar();
Router.resolve();
