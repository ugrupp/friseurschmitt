//
// Friseur Schmitt JS entry file
// --------------------------------------------------

// SVG <use> polyfill
import 'svgxuse';

// Babel polyfill
// This import will transpile to single core-js module imports. Only the polyfills needed for our target browsers will be imported.
// Powered by `useBuiltIns: usage` in .babelrc
import 'babel-polyfill';

// module imports
import './modules/fontfaceobserver';
import Nav from './modules/nav';
import Slides from './modules/slides';

new Nav();
new Slides();
