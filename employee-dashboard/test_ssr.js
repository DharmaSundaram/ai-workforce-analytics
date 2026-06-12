require('@babel/register')({
  presets: ['@babel/preset-env', ['@babel/preset-react', {runtime: 'automatic'}]],
  ignore: [/node_modules/]
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Mock CSS and SVG imports
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
  if (path.endsWith('.css') || path.endsWith('.svg') || path.endsWith('.scss')) return {};
  return originalRequire.apply(this, arguments);
};

// Mock react-router-dom
const reactRouterDom = {
  useNavigate: () => (() => {}),
  useLocation: () => ({ pathname: '/' }),
  Navigate: (props) => React.createElement('div', { 'data-mock': 'Navigate' }),
  Route: (props) => React.createElement('div', { 'data-mock': 'Route' }, props.element),
  Routes: ({ children }) => React.createElement('div', { 'data-mock': 'Routes' }, children),
  BrowserRouter: ({ children }) => React.createElement('div', { 'data-mock': 'BrowserRouter' }, children),
  Link: ({ children }) => React.createElement('a', { 'data-mock': 'Link' }, children),
};
require.cache[require.resolve('react-router-dom')] = {
  id: require.resolve('react-router-dom'),
  filename: require.resolve('react-router-dom'),
  loaded: true,
  exports: reactRouterDom
};

const AppRoutes = require('./src/routes/AppRoutes.js').default;

try {
  const html = ReactDOMServer.renderToString(React.createElement(AppRoutes));
  console.log("Render Success!");
} catch (e) {
  console.error("Render failed:");
  console.error(e);
}
