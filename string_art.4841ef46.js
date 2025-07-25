// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"huHYX":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "1d23b73e4841ef46";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"3Aj1C":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _playerJs = require("./editor/Player.js");
var _playerJsDefault = parcelHelpers.interopDefault(_playerJs);
var _patternTypesJs = require("./pattern_types.js");
var _patternTypesJsDefault = parcelHelpers.interopDefault(_patternTypesJs);
var _editorControlsJs = require("./editor/EditorControls.js");
var _editorControlsJsDefault = parcelHelpers.interopDefault(_editorControlsJs);
var _editorSizeControlsJs = require("./editor/EditorSizeControls.js");
var _editorSizeControlsJsDefault = parcelHelpers.interopDefault(_editorSizeControlsJs);
var _thumbnailsJs = require("./thumbnails/Thumbnails.js");
var _serializeJs = require("./Serialize.js");
var _shareJs = require("./share.js");
var _pwaJs = require("./pwa.js");
var _canvasRendererJs = require("./renderers/CanvasRenderer.js");
var _canvasRendererJsDefault = parcelHelpers.interopDefault(_canvasRendererJs);
var _svgrendererJs = require("./renderers/SVGRenderer.js");
var _svgrendererJsDefault = parcelHelpers.interopDefault(_svgrendererJs);
var _svgdownloadJs = require("./download/SVGDownload.js");
var _downloadJs = require("./download/Download.js");
window.addEventListener('error', function(event) {
    alert('Error: ' + event.message);
});
const elements = {
    canvas: document.querySelector('#canvas_panel'),
    patternLink: document.querySelector('#pattern_link'),
    downloadBtn: document.querySelector('#download_btn'),
    downloadSVGBtn: document.querySelector('#download_svg_btn'),
    downloadNailsBtn: document.querySelector('#download_nails_btn'),
    resetBtn: document.querySelector('#reset_btn'),
    shareBtn: document.querySelector('#share_btn'),
    playerBtn: document.querySelector('#player_btn'),
    buttons: document.querySelector('#buttons'),
    instructionsLink: document.querySelector('#pattern_select_dropdown_instructions')
};
let canvasRenderer;
let patterns;
let currentPattern;
const player = new (0, _playerJsDefault.default)(document.querySelector('#player'));
const sizeControls = new (0, _editorSizeControlsJsDefault.default)({
    getCurrentSize: ()=>[
            elements.canvas.clientWidth,
            elements.canvas.clientHeight
        ]
});
const thumbnails = new (0, _thumbnailsJs.Thumbnails)();
let controls;
window.addEventListener('load', main);
async function main() {
    initRouting();
    await (0, _pwaJs.initServiceWorker)();
    document.body.querySelectorAll('.pattern_only').forEach(hide);
    unHide(document.querySelector('main'));
    const queryParams = new URLSearchParams(document.location.search);
    canvasRenderer = queryParams.get('renderer') === 'svg' ? new (0, _svgrendererJsDefault.default)(elements.canvas) : new (0, _canvasRendererJsDefault.default)(elements.canvas);
    patterns = (0, _patternTypesJsDefault.default).map((Pattern)=>new Pattern(canvasRenderer));
    if (history.state?.pattern) updateState(history.state);
    else {
        const queryPattern = queryParams.get('pattern');
        if (queryPattern) {
            const config = queryParams.get('config');
            updateState({
                pattern: queryPattern,
                config
            });
        } else thumbnails.toggle();
    }
    elements.downloadBtn.addEventListener('click', downloadCanvas);
    elements.downloadSVGBtn.addEventListener('click', downloadSVG);
    elements.downloadNailsBtn.addEventListener('click', downloadNailsImage);
    elements.resetBtn.addEventListener('click', reset);
    elements.shareBtn.addEventListener('click', async ()=>await (0, _shareJs.share)({
            renderer: canvasRenderer,
            pattern: currentPattern
        }));
    elements.playerBtn.addEventListener('click', ()=>{
        document.querySelectorAll('#buttons [data-toggle-for]').forEach((btn)=>{
            if (btn.classList.contains('active')) btn.click();
        });
    });
    elements.instructionsLink.addEventListener('click', (e)=>{
        e.preventDefault();
        history.pushState({
            pattern: null
        }, 'String Art Studio', './');
        unselectPattern();
    });
    thumbnails.addOnChangeListener(({ detail })=>{
        const pattern = findPatternById(detail.pattern);
        setCurrentPattern(pattern);
    });
    document.body.addEventListener('click', (e)=>{
        const toggleBtn = e.target.closest('[data-toggle-for]');
        if (toggleBtn) {
            const dialogId = toggleBtn.dataset.toggleFor;
            toggleBtn.classList.toggle('active');
            const toggledElement = document.querySelector('#' + dialogId);
            toggledElement.classList.toggle('open');
            document.body.classList.toggle('dialog_' + dialogId);
            currentPattern && currentPattern.draw({
                position: currentPattern.position
            });
        }
    });
}
async function initPattern() {
    if (!currentPattern) throw new Error("Can't init pattern - no current pattern available!");
    initSize();
    window.addEventListener('resize', ()=>currentPattern && currentPattern.draw());
    elements.downloadBtn.addEventListener('click', downloadCanvas);
    elements.downloadNailsBtn.addEventListener('click', downloadNailsImage);
    elements.resetBtn.addEventListener('click', reset);
    const showShare = await (0, _shareJs.isShareSupported)({
        renderer: canvasRenderer,
        pattern: currentPattern
    });
    if (showShare) unHide(elements.shareBtn);
}
function downloadCanvas() {
    (0, _downloadJs.downloadFile)(canvasRenderer.toDataURL(), currentPattern.name + '.png');
}
function downloadSVG() {
    (0, _svgdownloadJs.downloadPatternAsSVG)(currentPattern, canvasRenderer.getSize());
}
function downloadNailsImage() {
    const currentConfig = currentPattern.config;
    currentPattern.config = {
        darkMode: false,
        showNails: true,
        showNailNumbers: true,
        showStrings: false,
        nailsColor: '#000000'
    };
    currentPattern.draw();
    downloadCanvas();
    // Reset to the config before the download:
    currentPattern.config = currentConfig;
    currentPattern.draw();
}
function reset() {
    if (confirm('Are you sure you wish to reset options to defaults?')) setCurrentPattern(currentPattern, {
        config: {}
    });
}
function onInputsChange({ withConfig = true } = {}) {
    player.update(currentPattern);
    const configQuery = withConfig ? (0, _serializeJs.serializeConfig)(currentPattern) : null;
    history.replaceState({
        pattern: currentPattern.id,
        config: configQuery
    }, currentPattern.name, `?pattern=${currentPattern.id}${withConfig && configQuery ? `&config=${encodeURIComponent(configQuery)}` : ''}`);
}
function setCurrentPattern(pattern, setPatternOptions) {
    selectPattern(pattern, setPatternOptions);
    history.pushState({
        pattern: pattern.id
    }, pattern.name, '?pattern=' + pattern.id);
}
function initSize() {
    sizeControls.element.addEventListener('sizechange', ({ detail })=>{
        setSize(detail);
    });
}
function setSize(size) {
    if (size.width && size.height) {
        canvasRenderer.setSize(size);
        if (!elements.canvas.classList.contains('overflow')) elements.canvas.classList.add('overflow');
    } else {
        elements.canvas.classList.remove('overflow');
        canvasRenderer.setSize(null);
    }
    currentPattern.draw();
}
function initRouting() {
    window.addEventListener('popstate', ({ state })=>{
        updateState(state);
    });
}
function updateState(state) {
    if (state?.pattern) {
        const pattern = findPatternById(state.pattern);
        selectPattern(pattern, {
            draw: false,
            config: state.config ? (0, _serializeJs.deserializeConfig)(pattern, state.config) : {}
        });
        thumbnails.close();
        currentPattern.draw();
    } else {
        unselectPattern();
        thumbnails.open();
    }
}
function findPatternById(patternId) {
    const pattern = patterns.find(({ id })=>id === patternId);
    if (!pattern) throw new Error(`Pattern with id "${patternId}" not found!`);
    return pattern;
}
function selectPattern(pattern, { config, draw = true } = {}) {
    const isFirstTime = !currentPattern;
    currentPattern = pattern;
    if (config) currentPattern.setConfig(config);
    if (controls) controls.destroy();
    controls = new (0, _editorControlsJsDefault.default)({
        pattern,
        config
    });
    controls.addEventListener('input', ()=>currentPattern.draw());
    controls.addEventListener('change', onInputsChange);
    if (pattern.link) {
        elements.patternLink.setAttribute('href', pattern.link);
        elements.patternLink.innerText = pattern.linkText ?? 'Example';
        unHide(elements.patternLink);
    } else hide(elements.patternLink);
    if (draw) requestAnimationFrame(()=>{
        currentPattern.draw();
    });
    player.update(currentPattern, {
        draw: false
    });
    thumbnails.setCurrentPattern(pattern);
    document.title = `${pattern.name} - String Art Studio`;
    document.body.setAttribute('data-pattern', pattern.id);
    if (isFirstTime) {
        initPattern();
        document.body.querySelectorAll('.pattern_only').forEach(unHide);
    }
}
function unHide(element) {
    element.removeAttribute('hidden');
}
function hide(element) {
    element.setAttribute('hidden', 'hidden');
}
function unselectPattern() {
    currentPattern = null;
    canvasRenderer.clear();
    hide(elements.patternLink);
    thumbnails.setCurrentPattern(null);
    controls && controls.destroy();
    document.body.querySelectorAll('.pattern_only').forEach(hide);
    document.body.removeAttribute('data-pattern');
}

},{"./editor/Player.js":"dDm40","./pattern_types.js":"5FyJ3","./editor/EditorControls.js":"9YWTc","./editor/EditorSizeControls.js":"3oHF4","./thumbnails/Thumbnails.js":"jp7mh","./Serialize.js":"5NOwb","./share.js":"d51ZT","./pwa.js":"eaRyg","./renderers/CanvasRenderer.js":"15b2W","./renderers/SVGRenderer.js":"6LXVK","./download/SVGDownload.js":"1ser6","./download/Download.js":"9qPiA","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"dDm40":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
class Player {
    constructor(parentEl){
        this.elements = {
            player: parentEl,
            step: parentEl.querySelector('#step'),
            //stepInstructions: parentEl.querySelector('#step_instructions'),
            playerPosition: parentEl.querySelector('#player_position'),
            playBtn: parentEl.querySelector('#play_btn'),
            pauseBtn: parentEl.querySelector('#pause_btn'),
            text: parentEl.querySelector('#player_text')
        };
        this.stepCount = 0;
        this._isPlaying = false;
        this.elements.playerPosition.addEventListener('input', ({ target })=>{
            this.goto(+target.value);
        });
        this.elements.playBtn.addEventListener('click', ()=>{
            this.play();
        });
        this.elements.pauseBtn.addEventListener('click', ()=>{
            this.pause();
        });
    }
    updateStatus(isPlaying) {
        if (this._isPlaying !== isPlaying) {
            this.elements.player.classList.toggle('playing');
            this._isPlaying = isPlaying;
        }
    }
    update(stringArt, { draw = true } = {}) {
        this.stringArt = stringArt;
        this.stepCount = stringArt.getStepCount();
        this.elements.playerPosition.setAttribute('max', this.stepCount);
        this.elements.step.innerText = `${this.stepCount}/${this.stepCount}`;
        this.elements.text.style.removeProperty('width');
        this.elements.text.style.width = (this.elements.text.clientWidth || 70) + 'px';
        this.goto(this.stepCount, {
            updateStringArt: draw
        });
    }
    updatePosition(position) {
        this.elements.step.innerText = `${position}/${this.stepCount}`;
        this.elements.playerPosition.value = position;
    }
    goto(position, { updateStringArt = true } = {}) {
        this.pause();
        this.updatePosition(position);
        if (updateStringArt) this.stringArt.goto(position);
    }
    setInstructions(instructions) {
    // this.elements.stepInstructions.innerText = instructions;
    }
    play() {
        this.updateStatus(true);
        cancelAnimationFrame(this.renderRafId);
        if (this.stringArt.position === this.stepCount) this.stringArt.goto(0);
        const self = this;
        step();
        function step() {
            if (!self.stringArt.drawNext().done) self.renderRafId = requestAnimationFrame(step);
            else self.updateStatus(false);
            self.updatePosition(self.stringArt.position);
        }
    }
    pause() {
        cancelAnimationFrame(this.renderRafId);
        this.updateStatus(false);
    }
    toggle() {
        if (this._isPlaying) this.pause();
        else this.play();
    }
}
exports.default = Player;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"jnFvT":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"5FyJ3":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _spiralJs = require("./string_art_types/Spiral.js");
var _spiralJsDefault = parcelHelpers.interopDefault(_spiralJs);
var _spiralsJs = require("./string_art_types/Spirals.js");
var _spiralsJsDefault = parcelHelpers.interopDefault(_spiralsJs);
var _waveJs = require("./string_art_types/Wave.js");
var _waveJsDefault = parcelHelpers.interopDefault(_waveJs);
var _eyeJs = require("./string_art_types/Eye.js");
var _eyeJsDefault = parcelHelpers.interopDefault(_eyeJs);
var _mandalaJs = require("./string_art_types/Mandala.js");
var _mandalaJsDefault = parcelHelpers.interopDefault(_mandalaJs);
var _starJs = require("./string_art_types/Star.js");
var _starJsDefault = parcelHelpers.interopDefault(_starJs);
var _assymetryJs = require("./string_art_types/Assymetry.js");
var _assymetryJsDefault = parcelHelpers.interopDefault(_assymetryJs);
var _freestyleJs = require("./string_art_types/Freestyle.js");
var _freestyleJsDefault = parcelHelpers.interopDefault(_freestyleJs);
var _polygonPatternJs = require("./string_art_types/PolygonPattern.js");
var _polygonPatternJsDefault = parcelHelpers.interopDefault(_polygonPatternJs);
var _flowerJs = require("./string_art_types/Flower.js");
var _flowerJsDefault = parcelHelpers.interopDefault(_flowerJs);
var _maurerRoseJs = require("./string_art_types/MaurerRose.js");
var _maurerRoseJsDefault = parcelHelpers.interopDefault(_maurerRoseJs);
var _flowerOfLifeJs = require("./string_art_types/FlowerOfLife.js");
var _flowerOfLifeJsDefault = parcelHelpers.interopDefault(_flowerOfLifeJs);
var _cometJs = require("./string_art_types/Comet.js");
var _cometJsDefault = parcelHelpers.interopDefault(_cometJs);
const patternTypes = [
    (0, _starJsDefault.default),
    (0, _assymetryJsDefault.default),
    (0, _mandalaJsDefault.default),
    (0, _spiralJsDefault.default),
    (0, _spiralsJsDefault.default),
    (0, _waveJsDefault.default),
    (0, _eyeJsDefault.default),
    (0, _freestyleJsDefault.default),
    (0, _polygonPatternJsDefault.default),
    (0, _flowerJsDefault.default),
    (0, _maurerRoseJsDefault.default),
    (0, _flowerOfLifeJsDefault.default),
    (0, _cometJsDefault.default)
];
exports.default = patternTypes;

},{"./string_art_types/Spiral.js":"4GtKT","./string_art_types/Spirals.js":"7VEjR","./string_art_types/Wave.js":"66Ik6","./string_art_types/Eye.js":"9xnRu","./string_art_types/Mandala.js":"21uFi","./string_art_types/Star.js":"7Nh6p","./string_art_types/Assymetry.js":"fqUuN","./string_art_types/Freestyle.js":"eB3bc","./string_art_types/PolygonPattern.js":"hS6F3","./string_art_types/Flower.js":"1RM1O","./string_art_types/MaurerRose.js":"jE01T","./string_art_types/FlowerOfLife.js":"1KjlV","./string_art_types/Comet.js":"kfE2A","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"4GtKT":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
const COLOR_CONFIG = (0, _colorJsDefault.default).getConfig({
    defaults: {
        isMultiColor: true,
        colorCount: 7,
        color: '#ffbb29',
        multicolorRange: '21',
        multicolorStart: 32,
        multicolorByLightness: true,
        minLightness: 36,
        maxLightness: 98
    },
    exclude: [
        'repeatColors',
        'mirrorColors'
    ]
});
class Spiral extends (0, _stringArtJsDefault.default) {
    id = 'spiral';
    name = 'Spiral';
    link = 'https://www.etsy.com/il-en/listing/840974781/boho-wall-decor-artwork-spiral-round';
    controls = [
        {
            ...(0, _circleJsDefault.default).nailsConfig,
            defaultValue: 200
        },
        {
            key: 'repetition',
            label: 'Repetition',
            defaultValue: 5,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        {
            key: 'innerLength',
            label: 'Spiral thickness',
            defaultValue: 0.5,
            type: 'range',
            attr: {
                min: ({ config: { n } })=>1 / n,
                max: 1,
                step: ({ config: { n } })=>1 / n
            },
            displayValue: ({ n, innerLength })=>Math.round(n * innerLength)
        },
        {
            ...(0, _circleJsDefault.default).rotationConfig,
            defaultValue: 0.75
        },
        (0, _circleJsDefault.default).distortionConfig,
        COLOR_CONFIG
    ];
    setUpDraw() {
        super.setUpDraw();
        const { n, rotation, layers, margin, colorCount, repetition, distortion } = this.config;
        this.layersCount = layers ?? 1;
        this.realRepetition = repetition * 2 - 1;
        const circleConfig = {
            size: this.size,
            n,
            margin,
            rotation,
            distortion
        };
        if (this.circle) this.circle.setConfig(circleConfig);
        else this.circle = new (0, _circleJsDefault.default)(circleConfig);
        this.color = new (0, _colorJsDefault.default)({
            ...this.config,
            colorCount: layers ?? colorCount
        });
        if (colorCount) this.colorMap = this.color.getColorMap({
            stepCount: this.getStepCount(),
            colorCount
        });
    }
    *drawSpiral({ shift = 0, color = '#ffffff' } = {}) {
        const { innerLength, n } = this.config;
        let currentInnerLength = Math.round(innerLength * n);
        let repetitionCount = 0;
        this.renderer.setColor(color);
        let prevPointIndex = shift;
        let prevPoint = this.circle.getPoint(prevPointIndex);
        let isPrevPoint = false;
        for(let i = 0; currentInnerLength > 0; i++){
            if (this.colorMap) {
                const stepColor = this.colorMap.get(i);
                if (stepColor) this.renderer.setColor(stepColor);
            }
            prevPointIndex = isPrevPoint ? prevPointIndex - currentInnerLength + 1 : prevPointIndex + currentInnerLength;
            if (repetitionCount === this.realRepetition) {
                currentInnerLength--;
                repetitionCount = 0;
                prevPointIndex++;
            } else repetitionCount++;
            const nextPoint = this.circle.getPoint(prevPointIndex);
            this.renderer.renderLines(prevPoint, nextPoint);
            prevPoint = nextPoint;
            yield i;
            isPrevPoint = !isPrevPoint;
        }
    }
    *generateStrings() {
        yield* this.drawSpiral({
            color: this.color.getColor(0)
        });
    }
    getStepCount() {
        const { innerLength, repetition, n, layers = 1 } = this.config;
        return Math.round(layers * n * (innerLength * 2) * repetition);
    }
    drawNails() {
        this.circle.drawNails(this.nails);
    }
    static thumbnailConfig = {
        n: 60
    };
}
exports.default = Spiral;

},{"../helpers/Color.js":"c9VvN","../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"c9VvN":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const COLOR_CONTROLS = [
    {
        key: 'isMultiColor',
        label: 'Use multiple colors',
        defaultValue: false,
        type: 'checkbox'
    },
    {
        key: 'colorCount',
        label: 'Colors count',
        defaultValue: 7,
        type: 'range',
        attr: {
            min: 1,
            max: 20,
            step: 1
        },
        show: ({ isMultiColor })=>isMultiColor
    },
    {
        key: 'color',
        label: 'String color',
        defaultValue: '#ff4d00',
        type: 'color',
        show: ({ isMultiColor })=>!isMultiColor
    },
    {
        key: 'multicolorRange',
        label: 'Multicolor range',
        defaultValue: 360,
        type: 'range',
        attr: {
            min: 1,
            max: 360,
            step: 1
        },
        show: ({ isMultiColor })=>isMultiColor
    },
    {
        key: 'multicolorStart',
        label: 'Multicolor start',
        defaultValue: 0,
        type: 'range',
        attr: {
            min: 0,
            max: 360,
            step: 1
        },
        show: ({ isMultiColor })=>isMultiColor
    },
    {
        key: 'saturation',
        label: 'Saturation',
        defaultValue: 100,
        type: 'range',
        attr: {
            min: 0,
            max: 100,
            step: 1
        },
        show: ({ isMultiColor })=>isMultiColor
    },
    {
        key: 'lightness',
        label: 'Lightness',
        type: 'group',
        defaultValue: 'minimized',
        show: ({ isMultiColor })=>isMultiColor,
        children: [
            {
                key: 'multicolorByLightness',
                label: 'Multi lightness',
                defaultValue: false,
                type: 'checkbox',
                show: ({ isMultiColor })=>isMultiColor
            },
            {
                key: 'minLightness',
                label: 'Minimum lightness',
                defaultValue: 0,
                type: 'range',
                attr: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                show: ({ multicolorByLightness, isMultiColor })=>multicolorByLightness && isMultiColor
            },
            {
                key: 'maxLightness',
                label: 'Maximum lightness',
                defaultValue: 100,
                type: 'range',
                attr: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                show: ({ multicolorByLightness, isMultiColor })=>multicolorByLightness && isMultiColor
            }
        ]
    },
    {
        key: 'colorOrderGroup',
        type: 'group',
        label: 'Order',
        defaultValue: 'minimized',
        show: ({ isMultiColor })=>isMultiColor,
        children: [
            {
                key: 'reverseColors',
                label: 'Reverse colors order',
                defaultValue: false,
                type: 'checkbox',
                show: ({ isMultiColor })=>isMultiColor
            },
            {
                key: 'repeatColors',
                label: 'Repeat colors',
                defaultValue: false,
                type: 'checkbox',
                show: ({ isMultiColor })=>isMultiColor
            },
            {
                key: 'mirrorColors',
                label: 'Mirror Colors',
                defaultValue: false,
                type: 'checkbox',
                show: ({ isMultiColor, repeatColors })=>isMultiColor && repeatColors
            }
        ]
    }
];
class Color {
    constructor(config){
        this.config = config;
        const { multicolorRange, colorCount, multicolorByLightness, minLightness = 0, maxLightness = 100, multicolorStart, darkMode, saturation, reverseColors, repeatColors, mirrorColors, isMultiColor } = config;
        if (isMultiColor) {
            this.multiColorStep = multicolorRange / colorCount;
            this.multiColorLightnessStep = multicolorByLightness ? (maxLightness - minLightness) / (Math.max(colorCount, 2) - 1) : 1;
            this.colors = new Array(colorCount).fill(null).map((_, colorIndex)=>{
                const lightness = multicolorByLightness ? minLightness + this.multiColorLightnessStep * colorIndex : darkMode ? 50 : 40;
                return `hsl(${multicolorStart + colorIndex * this.multiColorStep}, ${saturation}%, ${lightness}%)`;
            });
            if (repeatColors && mirrorColors) {
                const [_firstColor, ...restColors] = this.colors;
                restColors.pop();
                this.colors = [
                    ...this.colors,
                    ...restColors.reverse()
                ];
            }
            if (reverseColors) this.colors.reverse();
        }
    }
    /**
   * Returns the color to be used in the provided layer index. If no multiColor is used, will use the 'color' config property.
   * @param {number} colorIndex
   * @returns string
   */ getColor(colorIndex) {
        const { isMultiColor, colorCount, color, repeatColors, mirrorColors } = this.config;
        if (!isMultiColor) return color;
        if (colorIndex >= colorCount) colorIndex = repeatColors ? colorIndex % this.colors.length : this.colors.length - 1;
        return this.colors[colorIndex];
    }
    getColorMap({ stepCount, colorCount }) {
        if (!colorCount) throw new Error("Can't get color map, no colorCount provided!");
        const stepsPerColor = Math.floor(stepCount / colorCount);
        const colorMap = new Map();
        for(let i = 0; i < colorCount; i++)colorMap.set(i * stepsPerColor, this.getColor(i));
        return colorMap;
    }
    static getConfig({ include, exclude, defaults = {}, customControls }) {
        const controls = getControls();
        return {
            key: 'colorGroup',
            label: 'Color',
            type: 'group',
            children: [
                ...customControls ?? [],
                ...controls
            ]
        };
        function getControls(controlsConfig = COLOR_CONTROLS) {
            return controlsConfig.filter(({ key })=>(!exclude || !exclude.includes(key)) && (!include || include.includes(key))).map((control)=>{
                const finalControl = {
                    ...control,
                    defaultValue: defaults[control.key] ?? control.defaultValue
                };
                if (control.type === 'group') finalControl.children = getControls(control.children);
                return Object.freeze(finalControl);
            });
        }
    }
}
exports.default = Color;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"8dqjf":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _nailsJs = require("./Nails.js");
var _nailsJsDefault = parcelHelpers.interopDefault(_nailsJs);
var _rendererJs = require("./renderers/Renderer.js");
var _rendererJsDefault = parcelHelpers.interopDefault(_rendererJs);
const COLORS = {
    dark: '#0e0e0e',
    light: '#ffffff'
};
const COMMON_CONFIG_CONTROLS = [
    {
        key: 'strings',
        label: 'Strings',
        type: 'group',
        defaultValue: 'minimized',
        children: [
            {
                key: 'showStrings',
                label: 'Show strings',
                defaultValue: true,
                type: 'checkbox',
                isDisabled: ({ showNails })=>!showNails
            },
            {
                key: 'stringWidth',
                label: 'String width',
                defaultValue: 1,
                type: 'range',
                attr: {
                    min: 0.2,
                    max: 4,
                    step: 0.1
                },
                show: ({ showStrings })=>showStrings
            }
        ]
    },
    {
        key: 'nails',
        label: 'Nails',
        type: 'group',
        defaultValue: 'minimized',
        children: [
            {
                key: 'showNails',
                label: 'Show nails',
                defaultValue: true,
                type: 'checkbox',
                isDisabled: ({ showStrings })=>!showStrings
            },
            {
                key: 'showNailNumbers',
                label: 'Show nail numbers',
                defaultValue: false,
                type: 'checkbox',
                show: ({ showNails })=>showNails
            },
            {
                key: 'nailNumbersFontSize',
                label: 'Nail numbers font size',
                defaultValue: 10,
                type: 'range',
                attr: {
                    min: 6,
                    max: 24,
                    step: 0.5
                },
                displayValue: ({ nailNumbersFontSize })=>`${nailNumbersFontSize}px`,
                show: ({ showNails, showNailNumbers })=>showNails && showNailNumbers
            },
            {
                key: 'margin',
                label: 'Margin',
                defaultValue: 20,
                type: 'number',
                attr: {
                    min: 0,
                    max: 500,
                    step: 1
                },
                displayValue: ({ margin })=>`${margin}px`
            },
            {
                key: 'nailRadius',
                label: 'Nail size',
                defaultValue: 1.5,
                type: 'range',
                attr: {
                    min: 0.5,
                    max: 5,
                    step: 0.25
                },
                show: ({ showNails })=>showNails
            },
            {
                key: 'nailsColor',
                label: 'Nails color',
                defaultValue: '#ffffff',
                type: 'color',
                show: ({ showNails })=>showNails
            }
        ]
    },
    {
        key: 'background',
        label: 'Background',
        type: 'group',
        defaultValue: 'minimized',
        children: [
            {
                key: 'darkMode',
                label: 'Dark mode',
                defaultValue: true,
                type: 'checkbox',
                isDisabled: ({ enableBackground })=>!enableBackground
            },
            {
                key: 'customBackgroundColor',
                label: 'Custom background color',
                defaultValue: false,
                type: 'checkbox',
                isDisabled: ({ enableBackground })=>!enableBackground
            },
            {
                key: 'backgroundColor',
                label: 'Background color',
                defaultValue: COLORS.dark,
                type: 'color',
                show: ({ customBackgroundColor })=>customBackgroundColor,
                isDisabled: ({ enableBackground })=>!enableBackground
            },
            {
                key: 'enableBackground',
                label: 'Enable background',
                defaultValue: true,
                type: 'checkbox'
            }
        ]
    }
];
class StringArt {
    constructor(renderer){
        if (!renderer) throw new Error('Renderer not specified!');
        if (!(renderer instanceof (0, _rendererJsDefault.default))) throw new Error('Renderer is not an instance of Renderer!');
        this.renderer = renderer;
    }
    get configControls() {
        return (this.controls ?? []).concat(COMMON_CONFIG_CONTROLS);
    }
    get controlsIndex() {
        if (!this._controlsIndex) this._controlsIndex = getControlsIndex(this.controls);
        return this._controlsIndex;
    }
    get defaultConfig() {
        if (!this._defaultConfig) this._defaultConfig = Object.freeze(Object.assign(flattenConfig(this.configControls), this.defaultValues));
        return this._defaultConfig;
    }
    get config() {
        return this._config ?? this.defaultConfig;
    }
    set config(value) {
        this._config = Object.assign({}, this.defaultConfig, value);
    }
    setConfig(config) {
        const currentConfig = this.config;
        this.config = config;
        if (this.onConfigChange) {
            const changedControlKeys = Object.keys(currentConfig).filter((key)=>config[key] !== currentConfig[key]);
            this.onConfigChange({
                controls: changedControlKeys.map((key)=>({
                        control: this.controlsIndex[key],
                        value: config[key]
                    }))
            });
        }
    }
    resetStructure() {}
    onConfigChange({ controls }) {
        if (controls.some(({ control })=>control.isStructural)) {
            this.resetStructure();
            if (this.stepCount != null && controls.some(({ control })=>control.affectsStepCount !== false)) this.stepCount = null;
        }
    }
    onResize() {
        this.resetStructure();
    }
    setConfigValue(controlKey, value) {
        this._config = Object.freeze({
            ...this._config ?? this.defaultConfig,
            [controlKey]: value
        });
        if (this.onConfigChange) this.onConfigChange({
            controls: [
                {
                    control: this.controlsIndex[controlKey],
                    value
                }
            ].filter(({ control })=>!!control)
        });
    }
    getSize() {
        return this.renderer.getSize();
    }
    setUpDraw() {
        const previousSize = this.size;
        this.renderer.reset();
        const [width, height] = this.size = this.getSize();
        Object.assign(this, this.size);
        this.center = this.size.map((value)=>value / 2);
        if (previousSize && (previousSize[0] !== width || previousSize[1] !== height)) {
            if (this.onResize) this.onResize();
        }
        if (this.nails) this.nails.setConfig(this.config);
        else this.nails = new (0, _nailsJsDefault.default)(this.renderer, this.config);
        this.renderer.setLineWidth(this.config.stringWidth);
    }
    afterDraw() {
        const { showNails, showNailNumbers } = this.config;
        if (showNails) {
            this.drawNails();
            this.nails.fill({
                drawNumbers: showNailNumbers
            });
        }
    }
    initDraw() {
        this.setUpDraw(this.config);
        const { showNails, showNailNumbers, darkMode, backgroundColor, customBackgroundColor, enableBackground } = this.config;
        if (enableBackground) this.renderer.setBackground(customBackgroundColor ? backgroundColor : darkMode ? COLORS.dark : COLORS.light);
        if (showNails) {
            this.drawNails();
            this.nails.fill({
                drawNumbers: showNailNumbers
            });
        }
    }
    /**
   * Draws the string art
   * @param { step: number } renderConfig configuration for rendering. Accepts the step to render (leave undefined or null to render all)
   */ draw({ position = Infinity } = {}) {
        this.initDraw();
        const { showStrings } = this.config;
        if (showStrings) {
            this.stringsIterator = this.generateStrings();
            this.position = 0;
            while(!this.drawNext().done && this.position < position);
            this.afterDraw();
        }
    }
    goto(position) {
        if (position === this.position) return;
        if (this.stringsIterator && position > this.position) {
            while(!this.drawNext().done && this.position < position);
        } else this.draw({
            position
        });
    }
    drawNext() {
        const result = this.stringsIterator.next();
        if (result.done) this.afterDraw();
        else this.position++;
        return result;
    }
    generateStrings() {
        throw new Error('generateStrings method not defined!');
    }
    getStepCount() {
        throw new Error(`'getStepCount' method not implemented for string art type "${this.name}"`);
    }
}
function flattenConfig(configControls) {
    return configControls.reduce((config, { key, defaultValue, children })=>children ? {
            ...config,
            ...flattenConfig(children)
        } : {
            ...config,
            [key]: defaultValue
        }, {});
}
function getControlsIndex(configControls) {
    return configControls.reduce((controlsIndex, control)=>control.children ? {
            ...controlsIndex,
            ...getControlsIndex(control.children)
        } : {
            ...controlsIndex,
            [control.key]: control
        }, {});
}
exports.default = StringArt;

},{"./Nails.js":"i9ElF","./renderers/Renderer.js":"8LGOS","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"i9ElF":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const NUMBER_MARGIN = 4;
class Nails {
    constructor(renderer, config){
        this.setConfig(config);
        this.nails = [];
        this.addedPoints = new Set();
        this.renderer = renderer;
    }
    setConfig({ nailRadius, nailsColor, nailNumbersFontSize }) {
        this.nailRadius = nailRadius;
        this.nailsColor = nailsColor;
        this.nailNumbersFontSize = nailNumbersFontSize;
        this.nails = [];
        if (this.addedPoints) this.addedPoints.clear();
    }
    // Adds a nail to be rendered. nail: { point, number }
    addNail(nail) {
        const nailPoint = nail.point.map(Math.round).join('_');
        if (!this.addedPoints.has(nailPoint)) {
            this.nails.push(nail);
            this.addedPoints.add(nailPoint);
        }
    }
    fill({ drawNumbers = true } = {}) {
        this.renderer.renderNails(this.nails, {
            color: this.nailsColor,
            fontSize: this.nailNumbersFontSize,
            radius: this.nailRadius,
            renderNumbers: drawNumbers,
            margin: NUMBER_MARGIN
        });
        this.nails = [];
        this.addedPoints.clear();
    }
}
exports.default = Nails;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"8LGOS":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
class Renderer {
    constructor(parentElement){
        this.parentElement = parentElement;
    }
    destroy() {
        this.parentElement.removeElement(this.element);
    }
    get element() {
        throw new Error('element getter not implemented!');
    }
    reset() {}
    setColor(color) {
        this.color = color;
    }
    setLineWidth(width) {}
    setBackground(color) {}
    renderLines(startPosition, ...positions) {
        throw new Error('Renderer "renderLines" method not implemented!');
    }
    /**
   * Renders the nails for the string art
   * @param {[{ point: [x: number, y: number], number: string }]} nails
   * @param {*} param1
   */ renderNails(nails, { color, fontSize, radius, renderNumbers, margin }) {
        throw new Error('Renderer "renderNails" method not implemented!');
    }
    getSize() {
        const { width, height } = this.parentElement.getBoundingClientRect();
        return [
            width,
            height
        ];
    }
    setSize(size) {
        this.size = size;
        this.element.removeAttribute('width');
        this.element.removeAttribute('height');
        if (size) {
            this.element.style.width = `${size.width}px`;
            this.element.style.height = `${size.height}px`;
        } else this.element.removeAttribute('style');
    }
    clear() {
        throw new Error('Renderer "clear" method not implemented!');
    }
    toDataURL() {
        throw new Error('Renderer "toDataURL" method not implemented!');
    }
}
exports.default = Renderer;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"c8IFm":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _nailsJs = require("../Nails.js");
var _nailsJsDefault = parcelHelpers.interopDefault(_nailsJs);
var _easingJs = require("./easing.js");
var _easingJsDefault = parcelHelpers.interopDefault(_easingJs);
var _mathUtilsJs = require("./math_utils.js");
class Circle {
    constructor(config){
        this.setConfig(config);
    }
    getPoint(index = 0) {
        const realIndex = this.getNailIndex(index);
        if (this.points.has(index)) return this.points.get(index);
        const angle = this.easingFunction(realIndex / this.config.n) * (0, _mathUtilsJs.PI2) + this.rotationAngle;
        const point = [
            this.center[0] + Math.sin(angle) * this.xyRadius[0],
            this.center[1] + Math.cos(angle) * this.xyRadius[1]
        ];
        this.points.set(index, point);
        return point;
    }
    getNailIndex(index = 0) {
        let realIndex = this.isReverse ? this.config.n - 1 - index : index;
        if (realIndex > this.config.n - 1) realIndex = realIndex % this.config.n;
        return realIndex;
    }
    setConfig(config) {
        const serializedConfig = this._serializeConfig(config);
        if (serializedConfig !== this.serializedConfig) {
            const { n, size, margin = 0, rotation = 0, center: configCenter, radius, reverse = false } = config;
            const center = configCenter ?? size.map((v)=>v / 2);
            const clampedRadius = radius ?? Math.min(...center) - margin;
            let xyRadius = [
                clampedRadius,
                clampedRadius
            ];
            if (config.distortion) {
                const distortedBox = config.distortion < 0 ? [
                    clampedRadius * (1 - Math.abs(config.distortion)),
                    clampedRadius
                ] : [
                    clampedRadius / (1 - config.distortion),
                    clampedRadius
                ];
                xyRadius = (0, _mathUtilsJs.fitInside)(distortedBox, center.map((v)=>v - margin));
            }
            const props = {
                center,
                radius: clampedRadius,
                xyRadius,
                indexAngle: (0, _mathUtilsJs.PI2) / n,
                rotationAngle: -(0, _mathUtilsJs.PI2) * rotation,
                isReverse: reverse
            };
            const easingFunction = config.displacementFunc ? (0, _easingJsDefault.default)[config.displacementFunc] : (0, _easingJsDefault.default).linear;
            const easingParams = [];
            if (easingFunction.requirePower) easingParams.push(config.displacementMag);
            if (easingFunction.requireFastArea) easingParams.push(config.displacementFastArea);
            const easingFunctionWithParams = easingParams.length ? easingFunction.bind(null, ...easingParams) : easingFunction;
            this.easingFunction = easingFunctionWithParams;
            this.config = config;
            this.serializedConfig = serializedConfig;
            Object.assign(this, props);
            if (this.points) this.points.clear();
            else this.points = new Map();
        }
    }
    _serializeConfig({ n, size, margin = 0, rotation = 0, center, radius, reverse = false, distortion = 0, displacementFunc, displacementMag, displacementFastArea }) {
        return [
            size?.join(','),
            center?.join(','),
            radius,
            margin,
            n,
            rotation,
            reverse,
            distortion
        ].concat(displacementFunc === 'linear' ? [] : [
            displacementFunc,
            displacementMag,
            displacementFastArea
        ]).join('_');
    }
    /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   * @param {Nails} nails
   * @param {{nailsNumberStart?: number, getNumber?: Function}} param1
   */ drawNails(nails, { nailsNumberStart = 0, getNumber } = {}) {
        for(let i = 0; i < this.config.n; i++)nails.addNail({
            point: this.getPoint(i),
            number: getNumber ? getNumber(i) : i + nailsNumberStart
        });
    }
    *drawRing(renderer, { ringSize, color }) {
        const { n } = this.config;
        const ringDistance = Math.floor(ringSize * n);
        let prevPoint;
        let prevPointIndex = 0;
        let isPrevSide = false;
        renderer.setColor(color);
        for(let i = 0; i < n; i++){
            if (!prevPoint) prevPoint = this.getPoint(0);
            const startPoint = prevPoint;
            const positions = [];
            prevPointIndex = isPrevSide ? i : prevPointIndex + ringDistance;
            prevPoint = this.getPoint(prevPointIndex);
            positions.push(prevPoint);
            if (i < n - 1) {
                prevPointIndex++;
                prevPoint = this.getPoint(prevPointIndex);
                positions.push(prevPoint);
            }
            renderer.renderLines(startPoint, ...positions);
            yield;
            isPrevSide = !isPrevSide;
        }
    }
    static rotationConfig = Object.freeze({
        key: 'rotation',
        label: 'Rotation',
        defaultValue: 0,
        type: 'range',
        attr: {
            min: 0,
            max: 1 + 1 / 360,
            step: 1 / 360
        },
        displayValue: (config, { key })=>`${Math.round(config[key] * 360)}\xb0`,
        isStructural: true,
        affectsStepCount: false
    });
    static nailsConfig = Object.freeze({
        key: 'n',
        label: 'Number of nails',
        defaultValue: 144,
        type: 'range',
        attr: {
            min: 3,
            max: 300,
            step: 1
        },
        isStructural: true
    });
    static displacementConfig = Object.freeze({
        key: 'displacement',
        label: 'Displacement',
        type: 'group',
        children: [
            {
                key: 'displacementFunc',
                label: 'Displacement function',
                defaultValue: 'linear',
                type: 'select',
                options: Object.keys((0, _easingJsDefault.default)),
                isStructural: true,
                affectsStepCount: false
            },
            {
                key: 'displacementMag',
                label: 'Displacement magnitude',
                defaultValue: 3,
                type: 'range',
                attr: {
                    min: 0,
                    max: 10,
                    step: 0.1
                },
                show: ({ displacementFunc })=>(0, _easingJsDefault.default)[displacementFunc].requirePower,
                isStructural: true,
                affectsStepCount: false
            },
            {
                key: 'displacementFastArea',
                label: 'Displacement fast area',
                defaultValue: 0.4,
                type: 'range',
                attr: {
                    min: 0,
                    max: 0.5,
                    step: 0.01
                },
                show: ({ displacementFunc })=>(0, _easingJsDefault.default)[displacementFunc].requireFastArea,
                isStructural: true,
                affectsStepCount: false
            }
        ]
    });
    static distortionConfig = Object.freeze({
        key: 'distortion',
        label: 'Distortion',
        defaultValue: 0,
        type: 'range',
        attr: {
            min: -0.99,
            max: 0.99,
            step: 0.01
        },
        isStructural: true,
        affectsStepCount: false
    });
}
exports.default = Circle;

},{"../Nails.js":"i9ElF","./easing.js":"ktkRn","./math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"ktkRn":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const easing = {
    linear: (x)=>x,
    inOutCirc (x) {
        return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    },
    easeOutQuint (x) {
        return 1 - Math.pow(1 - x, 5);
    },
    fastSlowFast (t) {
        // Clamp t to [0,1] just to be safe
        t = Math.max(0, Math.min(1, t));
        // Custom easing formula: accelerates, slows in middle, then accelerates again
        return 0.5 * (1 - Math.cos(Math.PI * t)) ** 1.5;
    },
    fastInOutSquare (x) {
        return x <= 0.5 ? (1 - Math.pow(1 - x * 2, 2)) / 2 : 0.5 + Math.pow(x * 2 - 1, 2) / 2;
    },
    fastInOutCubic (x) {
        return x <= 0.5 ? (1 - Math.pow(1 - x * 2, 3)) / 2 : 0.5 + Math.pow(x * 2 - 1, 3) / 2;
    },
    fastInOutQuint (x) {
        return x <= 0.5 ? (1 - Math.pow(1 - x * 2, 5)) / 2 : 0.5 + Math.pow(x * 2 - 1, 5) / 2;
    },
    fastInOut (pow, x) {
        return x <= 0.5 ? (1 - Math.pow(1 - x * 2, pow)) / 2 : 0.5 + Math.pow(x * 2 - 1, pow) / 2;
    },
    fastInOutFixed (pow, fastArea, x) {
        if (x > fastArea && x < 1 - fastArea) {
            const y1 = (1 - Math.pow(1 - fastArea * 2, pow)) / 2;
            const y2 = 0.5 + Math.pow((1 - fastArea) * 2 - 1, pow) / 2;
            return y1 + (x - fastArea) * (y2 - y1) / (1 - 2 * fastArea);
        }
        return x <= fastArea ? (1 - Math.pow(1 - x * 2, pow)) / 2 : 0.5 + Math.pow(x * 2 - 1, pow) / 2;
    }
};
easing.fastInOut.requirePower = true;
easing.fastInOutFixed.requirePower = true;
easing.fastInOutFixed.requireFastArea = true;
exports.default = easing;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"iaiaj":[function(require,module,exports,__globalThis) {
/**
 * Returns the greatest common divisor of two integers
 * https://en.wikipedia.org/wiki/Euclidean_algorithm
 * @param {number} int1
 * @param {number} int2
 * @returns number
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "gcd", ()=>gcd);
/**
 * Fits the first size inside size2
 * @param {[number, number]} size1
 * @param {[number, number]} size2
 */ parcelHelpers.export(exports, "fitInside", ()=>fitInside);
parcelHelpers.export(exports, "PI2", ()=>PI2);
function gcd(int1, int2) {
    if (!int2) return int1;
    return gcd(int2, int1 % int2);
}
function fitInside(size1, size2) {
    const ratio = Math.min(size2[0] / size1[0], size2[1] / size1[1]);
    return size1.map((v)=>v * ratio);
}
const PI2 = Math.PI * 2;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"7VEjR":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _mathUtilsJs = require("../helpers/math_utils.js");
class Spirals extends (0, _stringArtJsDefault.default) {
    name = 'Spirals';
    id = 'spirals';
    link = 'https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1';
    controls = [
        {
            key: 'radiusIncrease',
            label: 'Radius change',
            defaultValue: 5.7,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 0.1
            }
        },
        {
            key: 'angleStep',
            label: 'Angle step',
            defaultValue: 0.45,
            type: 'range',
            attr: {
                min: 0,
                max: 1,
                step: 0.01
            }
        },
        {
            key: 'nSpirals',
            label: 'Number of spirals',
            defaultValue: 3,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        {
            ...(0, _circleJsDefault.default).rotationConfig,
            defaultValue: 330 / 360
        },
        (0, _colorJsDefault.default).getConfig({
            defaults: {
                isMultiColor: true,
                colorCount: 4,
                color: '#00d5ff',
                multicolorRange: 1,
                multicolorStart: 190,
                multicolorByLightness: true,
                minLightness: 50,
                maxLightness: 88,
                reverseColors: true
            }
        })
    ];
    setUpDraw() {
        super.setUpDraw();
        const { nSpirals, rotation, margin, radiusIncrease, angleStep, colorCount } = this.config;
        this.spiralRotations = new Array(nSpirals).fill(null).map((_, i)=>i * (0, _mathUtilsJs.PI2) / nSpirals);
        this.rotationAngle = -(0, _mathUtilsJs.PI2) * rotation;
        const maxRadius = Math.min(...this.size) / 2 - margin;
        this.nailsPerSpiral = Math.floor(maxRadius / radiusIncrease);
        this.angleIncrease = angleStep / (maxRadius / 50);
        this.color = new (0, _colorJsDefault.default)(this.config);
        this.colorMap = this.color.getColorMap({
            stepCount: this.getStepCount(),
            colorCount
        });
    }
    *generatePoints() {
        const { nSpirals } = this.config;
        for(let i = 0; i < this.nailsPerSpiral; i++)for(let s = 0; s < nSpirals; s++){
            const point = this.getPoint(s, i);
            yield {
                point,
                nailNumber: `${s}_${i}`
            };
        }
    }
    getPoint(spiralIndex, index) {
        const [centerx, centery] = this.center;
        const { radiusIncrease } = this.config;
        const angle = this.rotationAngle + this.angleIncrease * index + this.spiralRotations[spiralIndex];
        const radius = index * radiusIncrease;
        return [
            centerx + radius * Math.sin(angle),
            centery + radius * Math.cos(angle)
        ];
    }
    *generateStrings() {
        const points = this.generatePoints();
        let index = 0;
        this.renderer.setColor(this.color.getColor(0));
        let lastPoint = this.center;
        for (const { point } of points){
            if (this.colorMap) {
                const stepColor = this.colorMap.get(index);
                if (stepColor) this.renderer.setColor(stepColor);
            }
            if (lastPoint) this.renderer.renderLines(lastPoint, point);
            lastPoint = point;
            yield index++;
        }
    }
    getStepCount() {
        const { nSpirals, radiusIncrease, margin } = this.config;
        const maxRadius = Math.min(...this.getSize()) / 2 - margin;
        const n = Math.floor(maxRadius / radiusIncrease);
        return n * nSpirals;
    }
    drawNails() {
        const points = this.generatePoints();
        for (const { point, nailNumber } of points)this.nails.addNail({
            point,
            number: nailNumber
        });
    }
    static thumbnailConfig = {
        radiusIncrease: 1.4,
        angleStep: 0.11
    };
}
exports.default = Spirals;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","../helpers/Color.js":"c9VvN","../helpers/math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"66Ik6":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
var _mandalaJs = require("./Mandala.js");
var _mandalaJsDefault = parcelHelpers.interopDefault(_mandalaJs);
class Wave extends (0, _mandalaJsDefault.default) {
    id = 'wave';
    name = 'Wave';
    link = 'https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1';
    controls = [
        {
            ...(0, _circleJsDefault.default).nailsConfig,
            defaultValue: 200
        },
        {
            key: 'layerFill',
            label: 'Layer fill',
            defaultValue: 0.5,
            type: 'range',
            attr: {
                min: ({ config: { n } })=>1 / n,
                max: 1,
                step: ({ config: { n } })=>1 / n
            },
            displayValue: ({ layerFill })=>Math.floor(100 * layerFill) + '%'
        },
        {
            ...(0, _circleJsDefault.default).rotationConfig,
            defaultValue: 176 / 360
        },
        (0, _circleJsDefault.default).distortionConfig,
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 11,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        {
            key: 'layerSpread',
            label: 'Layer spread',
            defaultValue: 0.075,
            type: 'range',
            attr: {
                min: 0,
                max: 1,
                step: ({ config: { n } })=>1 / n
            },
            displayValue: ({ layerSpread, n })=>Math.round(layerSpread * n)
        },
        {
            key: 'reverse',
            label: 'Reverse',
            defaultValue: true,
            type: 'checkbox'
        },
        (0, _colorJsDefault.default).getConfig({
            defaults: {
                isMultiColor: true,
                multicolorRange: 216,
                multicolorStart: 263,
                color: '#ffffff',
                multicolorByLightness: true,
                minLightness: 10,
                maxLightness: 90
            },
            exclude: [
                'colorCount'
            ]
        })
    ];
    setUpDraw() {
        super.setUpDraw();
        const { n, layerSpread } = this.config;
        this.layerShift = Math.round(n * layerSpread);
        this.base = 2;
    }
    *generateStrings() {
        const { layers, reverse } = this.config;
        for(let layer = 0; layer < layers; layer++)yield* this.drawTimesTable({
            color: this.color.getColor(layer),
            shift: this.layerShift * (reverse ? 1 : -1) * layer,
            time: layer
        });
    }
    static thumbnailConfig = {
        n: 70
    };
}
exports.default = Wave;

},{"../helpers/Color.js":"c9VvN","../helpers/Circle.js":"c8IFm","./Mandala.js":"21uFi","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"21uFi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
class Mandala extends (0, _stringArtJsDefault.default) {
    name = 'Mandala';
    id = 'mandala';
    link = 'https://www.youtube.com/watch?v=qhbuKbxJsk8';
    linkText = 'Learn';
    controls = [
        {
            key: 'n',
            label: 'Number of nails',
            defaultValue: 180,
            type: 'range',
            attr: {
                min: 3,
                max: 240,
                step: 1
            }
        },
        {
            key: 'base',
            label: 'Multiplication',
            defaultValue: 2,
            type: 'range',
            attr: {
                min: 2,
                max: 99,
                step: 1
            }
        },
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 7,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        (0, _circleJsDefault.default).rotationConfig,
        (0, _circleJsDefault.default).distortionConfig,
        (0, _colorJsDefault.default).getConfig({
            defaults: {
                isMultiColor: true,
                multicolorRange: 180,
                multicolorStart: 256,
                color: '#ff4d00'
            },
            exclude: [
                'colorCount'
            ]
        })
    ];
    get n() {
        if (!this._n) {
            const { n, layers } = this.config;
            const extraNails = n % layers;
            this._n = n - extraNails; // The number of nails should be a multiple of the layers, so the strings are exactly on the nails.
        }
        return this._n;
    }
    setUpDraw() {
        this._n = null;
        super.setUpDraw();
        const { layers, rotation, distortion, margin, layerFill, base, reverse } = this.config;
        const circleConfig = {
            size: this.size,
            n: this.n,
            margin,
            rotation,
            distortion,
            reverse
        };
        this.stringsPerLayer = layerFill ? Math.floor(this.n * layerFill) : this.n;
        if (this.circle) this.circle.setConfig(circleConfig);
        else this.circle = new (0, _circleJsDefault.default)(circleConfig);
        this.color = new (0, _colorJsDefault.default)({
            ...this.config,
            colorCount: layers
        });
        this.layerShift = Math.floor(this.n / layers);
        this.base = base;
    }
    *drawTimesTable({ shift = 0, color = '#f00', time }) {
        const n = this.n;
        this.renderer.setColor(color);
        let point = this.circle.getPoint(shift);
        for(let i = 1; i <= this.stringsPerLayer; i++){
            const startPoint = point;
            point = this.circle.getPoint(i + shift);
            const toIndex = i * this.base % n;
            this.renderer.renderLines(startPoint, point, this.circle.getPoint(toIndex + shift));
            yield {
                instructions: `${i - 1} \u{2192} ${i} \u{2192} ${toIndex} \u{2192} ${i}`,
                index: time * n + i
            };
        }
    }
    *generateStrings() {
        const { layers } = this.config;
        for(let time = 0; time < layers; time++){
            const color = this.color.getColor(time);
            yield* this.drawTimesTable({
                time,
                color,
                shift: this.layerShift * time
            });
        }
    }
    drawNails() {
        this.circle.drawNails(this.nails);
    }
    getStepCount() {
        const { layers, layerFill } = this.config;
        const stringsPerLayer = layerFill ? Math.floor(this.n * layerFill) : this.n;
        return (layers ?? 1) * stringsPerLayer;
    }
    static thumbnailConfig = {
        n: 70
    };
}
exports.default = Mandala;

},{"../helpers/Color.js":"c9VvN","../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"9xnRu":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
const SIDES = [
    'left',
    'bottom',
    'right',
    'top'
];
const SIDES_ORDER = [
    'left',
    'bottom',
    'right',
    'top'
];
const SIDES_ROTATION = {
    left: 0,
    bottom: Math.PI / 2,
    right: Math.PI,
    top: Math.PI * 1.5
};
class Eye extends (0, _stringArtJsDefault.default) {
    name = 'Eye';
    id = 'eye';
    link = 'https://www.etsy.com/listing/489853161/rose-of-space-string-art-sacred-geometry?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=string+art&ref=sr_gallery_1&epik=dj0yJnU9WXNpM1BDTnNkLVBtcWdCa3AxN1J5QUZRY1FlbkJ5Z18mcD0wJm49ZXdJb2JXZmVpNVVwN1NKQ3lXMy10ZyZ0PUFBQUFBR0ZuUzZv';
    controls = [
        {
            key: 'n',
            label: 'Number of nails per side',
            defaultValue: 82,
            type: 'range',
            attr: {
                min: 2,
                max: 200,
                step: 1
            }
        },
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 13,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        {
            key: 'angle',
            label: 'Layer angle',
            defaultValue: 30,
            displayValue: ({ angle })=>`${angle}\xb0`,
            type: 'range',
            attr: {
                min: 0,
                max: 45,
                step: 1
            }
        },
        {
            key: 'color',
            label: 'Color',
            type: 'group',
            children: [
                {
                    key: 'color1',
                    label: 'String #1 color',
                    defaultValue: '#11e8bd',
                    type: 'color'
                },
                {
                    key: 'color2',
                    label: 'String #2 color',
                    defaultValue: '#6fff52',
                    type: 'color'
                },
                {
                    key: 'colorPerLayer',
                    label: 'Color per layer',
                    defaultValue: false,
                    type: 'checkbox'
                }
            ]
        }
    ];
    setUpDraw() {
        super.setUpDraw();
        const { n, angle, layers, margin } = this.config;
        this.maxSize = Math.min(...this.size) - 2 * margin;
        this.nailSpacing = this.maxSize / (n - 1);
        this.layerAngle = angle * Math.PI / 180;
        this.layers = new Array(layers).fill(null).map((_, layerIndex)=>this._getLayerProps(layerIndex));
    }
    // Sides: top, right, bottom, left
    getPoint({ index, angle, layerStart, rotation }) {
        const theta = angle + rotation;
        const point = {
            x: layerStart.x,
            y: layerStart.y + this.nailSpacing * index
        };
        const pivot = {
            x: this.center[0],
            y: this.center[1]
        };
        const cosAngle = Math.cos(theta);
        const sinAngle = Math.sin(theta);
        const position = [
            cosAngle * (point.x - pivot.x) - sinAngle * (point.y - pivot.y) + pivot.x,
            sinAngle * (point.x - pivot.x) + cosAngle * (point.y - pivot.y) + pivot.y
        ];
        return position;
    }
    *drawSide({ side, color = '#ffffff', angle, size, layerStart, layerStringCount }) {
        const sideIndex = SIDES.indexOf(side);
        const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];
        const rotation = SIDES_ROTATION[side];
        const nextSideRotation = SIDES_ROTATION[nextSide];
        const sideProps = {
            layerStringCount,
            size,
            layerStart,
            angle
        };
        this.renderer.setColor(color);
        for(let i = 0; i <= layerStringCount; i++){
            this.renderer.renderLines(this.getPoint({
                side,
                index: i,
                rotation,
                ...sideProps
            }), this.getPoint({
                side: nextSide,
                index: i,
                rotation: nextSideRotation,
                ...sideProps
            }));
            yield i;
        }
    }
    _getLayerProps(layerIndex) {
        const colors = this._getLayerColors(layerIndex);
        const layerAngle = this.layerAngle * layerIndex;
        const layerSize = this.maxSize / Math.pow(Math.cos(this.layerAngle) + Math.sin(this.layerAngle), layerIndex);
        const layerStart = {
            x: this.center[0] - layerSize / 2,
            y: this.center[1] - layerSize / 2
        };
        const layerStringCount = Math.floor(layerSize / this.nailSpacing);
        return {
            colors,
            layerAngle,
            layerSize,
            layerStart,
            layerStringCount
        };
    }
    _getLayerColors(layerIndex) {
        const { color1, color2, colorPerLayer } = this.config;
        if (colorPerLayer) {
            const layerColor = layerIndex % 2 ? color1 : color2;
            return [
                layerColor,
                layerColor,
                layerColor,
                layerColor
            ];
        } else return [
            color2,
            color1,
            color2,
            color1
        ];
    }
    *drawLayer(layerIndex) {
        const { colors, layerAngle, layerSize, layerStart, layerStringCount } = this.layers[layerIndex];
        for(let i = 0; i < SIDES.length; i++)yield* this.drawSide({
            color: colors[i],
            side: SIDES_ORDER[i],
            angle: layerAngle,
            size: layerSize,
            layerStart,
            layerStringCount
        });
    }
    *generateStrings() {
        const { layers } = this.config;
        for(let layer = layers - 1; layer >= 0; layer--)yield* this.drawLayer(layer);
    }
    getStepCount() {
        let count = 0;
        const { layers, angle, n, margin } = this.config;
        const layerAngle = angle * Math.PI / 180;
        const maxSize = Math.min(...this.renderer.getSize()) - 2 * margin;
        const nailSpacing = maxSize / (n - 1);
        for(let layer = 0; layer < layers; layer++){
            const layerSize = maxSize / Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layer);
            count += 4 * (Math.floor(layerSize / nailSpacing) + 1);
        }
        return count;
    }
    drawNails() {
        const { layers } = this.config;
        for(let layer = layers - 1; layer >= 0; layer--){
            const { layerAngle: angle, layerSize: size, layerStart, layerStringCount } = this.layers[layer];
            for(let s = 0; s < SIDES.length; s++){
                const sideOrder = SIDES_ORDER[s];
                const rotation = SIDES_ROTATION[sideOrder];
                for(let i = 0; i <= layerStringCount; i++){
                    const sideProps = {
                        layerStringCount,
                        size,
                        layerStart,
                        angle
                    };
                    this.nails.addNail({
                        point: this.getPoint({
                            sideOrder,
                            index: i,
                            rotation,
                            ...sideProps
                        }),
                        number: `${layer}_${s}_${i}`
                    });
                }
            }
        }
    }
    static thumbnailConfig = {
        n: 25,
        layers: 7
    };
}
exports.default = Eye;

},{"../StringArt.js":"8dqjf","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"7Nh6p":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
class Star extends (0, _stringArtJsDefault.default) {
    name = 'Star';
    id = 'star';
    link = 'https://www.etsy.com/listing/557818258/string-art-meditation-geometric-yoga?epik=dj0yJnU9Mm1hYmZKdks1eTc3bVY2TkVhS2p2Qlg0N2dyVWJxaTEmcD0wJm49MGlWSXE1SVJ2Vm0xZ0xtaGhITDBWQSZ0PUFBQUFBR0Zwd2lj';
    controls = [
        {
            key: 'sides',
            label: 'Sides',
            defaultValue: 3,
            type: 'range',
            attr: {
                min: 3,
                max: 20,
                step: 1
            }
        },
        {
            key: 'sideNails',
            label: 'Nails per side',
            defaultValue: 40,
            type: 'range',
            attr: {
                min: 1,
                max: 200,
                step: 1
            }
        },
        {
            key: 'ringSize',
            label: 'Outer ring size',
            defaultValue: 0.1,
            type: 'range',
            attr: {
                min: 0,
                max: 0.5,
                step: ({ config: { sideNails, sides } })=>1 / (sideNails * sides)
            },
            displayValue: ({ sideNails, sides, ringSize })=>Math.floor(ringSize * sideNails * sides)
        },
        (0, _circleJsDefault.default).rotationConfig,
        (0, _circleJsDefault.default).distortionConfig,
        {
            key: 'colorGroup',
            label: 'Color',
            type: 'group',
            children: [
                {
                    key: 'innerColor',
                    label: 'Star color',
                    defaultValue: '#2ec0ff',
                    type: 'color'
                },
                {
                    key: 'outterColor',
                    label: 'Outter color',
                    defaultValue: '#2a82c6',
                    type: 'color'
                },
                {
                    key: 'ringColor',
                    label: 'Ring color',
                    defaultValue: '#2ec0ff',
                    type: 'color'
                }
            ]
        }
    ];
    get n() {
        if (!this._n) {
            const { n, sides } = this.config;
            const extraNails = n % sides;
            this._n = n - extraNails;
        }
        return this._n;
    }
    setUpDraw() {
        this._n = null;
        super.setUpDraw();
        const { sides, rotation, distortion, sideNails, margin = 0 } = this.config;
        const circleConfig = {
            size: this.size,
            n: sideNails * sides,
            margin,
            rotation,
            distortion
        };
        if (this.circle) this.circle.setConfig(circleConfig);
        else this.circle = new (0, _circleJsDefault.default)(circleConfig);
        this.sideAngle = Math.PI * 2 / sides;
        this.nailSpacing = this.circle.radius / sideNails;
        this.starCenterStart = sideNails % 1 * this.nailSpacing;
        this.sides = new Array(sides).fill(null).map((_, side)=>{
            const sideAngle = side * this.sideAngle + this.circle.rotationAngle;
            const circlePointsStart = side * sideNails;
            return {
                sinSideAngle: Math.sin(sideAngle),
                cosSideAngle: Math.cos(sideAngle),
                circlePointsStart,
                circlePointsEnd: circlePointsStart + sideNails
            };
        });
    }
    getStarPoint({ side, sideIndex }) {
        const radius = this.starCenterStart + sideIndex * this.nailSpacing;
        const { sinSideAngle, cosSideAngle } = this.sides[side];
        const [centerX, centerY] = this.circle.center;
        return [
            centerX + sinSideAngle * radius,
            centerY + cosSideAngle * radius
        ];
    }
    getArcPoint({ side, sideIndex }) {
        return this.circle.getPoint(side * this.config.sideNails + sideIndex);
    }
    *generateStarPoints({ reverseOrder = false } = {}) {
        const { sides, sideNails } = this.config;
        for(let side = 0; side < sides; side++){
            const prevSide = side === 0 ? sides - 1 : side - 1;
            for(let i = 0; i < sideNails; i++){
                const sideIndex = reverseOrder ? sideNails - i : i;
                yield {
                    side,
                    prevSide,
                    sideIndex,
                    point: this.getStarPoint({
                        side,
                        sideIndex
                    })
                };
            }
        }
    }
    *drawStar() {
        const { innerColor, sideNails, sides } = this.config;
        this.renderer.setColor(innerColor);
        let alternate = false;
        const linesPerRound = sides % 2 ? sides * 2 : sides;
        const rounds = sides % 2 ? Math.floor(sideNails / 2) : sideNails;
        let prevPointIndex = 0;
        let prevPoint = this.getStarPoint({
            side: 0,
            sideIndex: prevPointIndex
        });
        for(let round = 0; round <= rounds; round++){
            let side = 0;
            const linesPerThisRound = linesPerRound - (round === rounds ? sides : 0);
            for(let i = 0; i < linesPerThisRound; i++){
                side = side !== sides - 1 ? side + 1 : 0;
                alternate = !alternate;
                prevPointIndex = alternate ? sideNails - round : round;
                const nextPoint = this.getStarPoint({
                    side,
                    sideIndex: prevPointIndex
                });
                this.renderer.renderLines(prevPoint, nextPoint);
                prevPoint = nextPoint;
                yield;
            }
            prevPointIndex = alternate ? prevPointIndex - 1 : prevPointIndex + 1;
            const nextPoint = this.getStarPoint({
                side: 0,
                sideIndex: prevPointIndex
            });
            this.renderer.renderLines(prevPoint, nextPoint);
            prevPoint = nextPoint;
        }
    }
    *drawCircle() {
        const { outterColor, sides, sideNails } = this.config;
        this.renderer.setColor(outterColor);
        let prevPoint = this.getStarPoint({
            side: 0,
            sideIndex: 0
        });
        let alternate = false;
        let isStar = false;
        const rounds = sides % 2 ? Math.ceil(sideNails / 2) : sideNails;
        let side = 0;
        const linesPerRound = sides % 2 ? sides * 4 : sides * 2;
        for(let round = 0; round <= rounds; round++){
            const linesPerThisRound = linesPerRound - (round === rounds ? sides * 2 : 0);
            for(let i = 0; i < linesPerThisRound; i++){
                const pointPosition = {
                    side,
                    sideIndex: alternate ? sideNails - round : round
                };
                const nextPoint = isStar ? this.getStarPoint(pointPosition) : this.getArcPoint(pointPosition);
                this.renderer.renderLines(prevPoint, nextPoint);
                prevPoint = nextPoint;
                yield;
                isStar = !isStar;
                if (isStar) {
                    side = side !== sides - 1 ? side + 1 : 0;
                    alternate = !alternate;
                }
            }
            prevPoint = this.getStarPoint({
                side: 0,
                sideIndex: round + 1
            });
        }
    }
    *generateStrings() {
        yield* this.drawCircle();
        const { ringSize, ringColor } = this.config;
        if (ringSize !== 0) yield* this.circle.drawRing(this.renderer, {
            ringSize,
            color: ringColor
        });
        yield* this.drawStar();
    }
    drawNails() {
        this.circle.drawNails(this.nails);
        for (const { point, side, sideIndex } of this.generateStarPoints())this.nails.addNail({
            point,
            number: sideIndex ? `${side}_${sideIndex}` : 0
        });
        this.circle.drawNails(this.nails);
    }
    getStepCount() {
        const { sides, sideNails, ringSize } = this.config;
        const ringCount = ringSize ? sideNails * sides : 0;
        const starAndCircleCount = 3 * sides * (sideNails + (sides % 2 ? 1 : 0));
        return starAndCircleCount + ringCount;
    }
    static thumbnailConfig = {
        sideNails: 18
    };
}
exports.default = Star;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"fqUuN":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
const LAYER_DEFAULTS = [
    {
        size: 0.25,
        end: 1,
        color: '#a94fb0'
    },
    {
        size: 0.125,
        end: 0.888,
        color: '#ec6ad0'
    },
    {
        size: 0,
        end: 0.826,
        color: '#f08ad5',
        reverse: true
    }
];
class Assymetry extends (0, _stringArtJsDefault.default) {
    name = 'Assymetry';
    id = 'assymetry';
    link = 'https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for';
    controls = [
        (0, _circleJsDefault.default).nailsConfig,
        (0, _circleJsDefault.default).rotationConfig,
        (0, _circleJsDefault.default).distortionConfig,
        {
            key: 'layers',
            label: 'Layers',
            type: 'group',
            children: LAYER_DEFAULTS.map(({ size, end, color, reverse }, i)=>{
                const layer = i + 1;
                return {
                    key: `layer${layer}`,
                    label: `Layer ${layer}`,
                    type: 'group',
                    children: [
                        {
                            key: `show${layer}`,
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: `size${layer}`,
                            label: 'Size',
                            defaultValue: size,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: ({ config: { n } })=>1 / n
                            },
                            displayValue: (config, { key })=>Math.round(config.n * config[key]),
                            show: (config)=>config[`show${layer}`]
                        },
                        {
                            key: `end${layer}`,
                            label: 'End Position',
                            defaultValue: end,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: ({ config: { n } })=>1 / n
                            },
                            displayValue: (config, { key })=>Math.round(config.n * config[key]),
                            show: (config)=>config[`show${layer}`]
                        },
                        {
                            key: `color${layer}`,
                            label: 'Color',
                            defaultValue: color,
                            type: 'color',
                            show: (config)=>config[`show${layer}`]
                        },
                        {
                            key: `reverse${layer}`,
                            label: 'Reverse',
                            defaultValue: reverse === true,
                            type: 'checkbox',
                            show: (config)=>config[`show${layer}`]
                        }
                    ]
                };
            })
        }
    ];
    setUpDraw() {
        super.setUpDraw();
        Object.assign(this, this.getSetUp());
    }
    getSetUp() {
        const { rotation, n, margin = 0, distortion } = this.config;
        const size = this.getSize();
        const circleConfig = {
            size,
            n,
            margin,
            rotation: rotation - 0.25,
            distortion
        };
        let circle;
        if (this.circle) {
            circle = this.circle;
            this.circle.setConfig(circleConfig);
        } else circle = new (0, _circleJsDefault.default)(circleConfig);
        let lineSpacing = circle.indexAngle * circle.radius;
        const lineNailCount = Math.floor(circle.radius / lineSpacing) - 1;
        lineSpacing += (circle.radius - lineSpacing * lineNailCount) / lineNailCount;
        const firstCirclePoint = circle.getPoint(0);
        const totalNailCount = lineNailCount + n;
        const totalIndexCount = totalNailCount + lineNailCount;
        const layers = new Array(3).fill(null).map((_, i)=>getLayer.call(this, i + 1)).filter(({ enable })=>enable);
        return {
            circle,
            lineSpacing,
            lineNailCount,
            firstCirclePoint,
            layers,
            totalNailCount,
            totalIndexCount
        };
        function getLayer(layerIndex) {
            const size = Math.round(n * this.config['size' + layerIndex]) + lineNailCount;
            return {
                size,
                endIndex: Math.round(this.config['end' + layerIndex] * (totalNailCount + lineNailCount)) - size,
                color: this.config['color' + layerIndex],
                enable: this.config['show' + layerIndex],
                isReverse: this.config['reverse' + layerIndex]
            };
        }
    }
    /**
   * Returns the position of a point on the line
   * @param {index of the point in the circle, 0 is the center} index
   */ getPoint(index) {
        if (index < this.lineNailCount || index > this.totalNailCount) {
            const linePosition = index < this.lineNailCount ? this.lineNailCount - index : index - this.totalNailCount;
            const indexLength = linePosition * this.lineSpacing;
            return [
                this.firstCirclePoint[0] - indexLength * Math.sin(this.circle.rotationAngle),
                this.firstCirclePoint[1] - indexLength * Math.cos(this.circle.rotationAngle)
            ];
        } else {
            const circleIndex = index - this.lineNailCount;
            return this.circle.getPoint(circleIndex);
        }
    }
    *drawCircle({ endIndex, color, isReverse, size }) {
        let prevPoint;
        let prevPointIndex;
        let isPrevSide = false;
        this.renderer.setColor(color);
        const self = this;
        const advance = isReverse ? -1 : 1;
        for(let index = 0; index <= endIndex; index++){
            const startPoint = prevPoint ?? this.getPoint(getPointIndex(index));
            const positions = [];
            if (prevPoint) positions.push(this.getPoint(prevPointIndex + advance));
            prevPointIndex = getPointIndex(isPrevSide ? index : index + size);
            positions.push(prevPoint = this.getPoint(prevPointIndex));
            this.renderer.renderLines(startPoint, ...positions);
            yield;
            isPrevSide = !isPrevSide;
        }
        function getPointIndex(index) {
            return isReverse ? self.totalIndexCount - index : index;
        }
    }
    *generateStrings() {
        for (const layer of this.layers)yield* this.drawCircle(layer);
    }
    drawNails() {
        this.circle.drawNails(this.nails, {
            nailsNumberStart: this.lineNailCount
        });
        for(let i = 0; i < this.lineNailCount; i++)this.nails.addNail({
            point: this.getPoint(i),
            number: i
        });
    }
    getStepCount() {
        const { layers } = this.getSetUp();
        return layers.reduce((stepCount, layer)=>stepCount + layer.endIndex + 1, 0);
    }
    static thumbnailConfig = {
        n: 50
    };
}
exports.default = Assymetry;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"eB3bc":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
class Freestyle extends (0, _stringArtJsDefault.default) {
    name = 'Freestyle';
    id = 'freestyle';
    link = 'https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for';
    controls = [
        {
            key: 'n',
            label: 'Circle nails',
            defaultValue: 80,
            type: 'range',
            attr: {
                min: 1,
                max: 300,
                step: 1
            }
        },
        {
            key: 'minNailDistance',
            label: 'Min nail distance',
            defaultValue: 20,
            type: 'range',
            attr: {
                min: 1,
                max: 300,
                step: 1
            }
        },
        {
            key: 'color',
            label: 'Color',
            defaultValue: '#ec6ad0',
            type: 'color'
        },
        {
            key: 'layers',
            label: 'Layers',
            type: 'group',
            children: [
                {
                    key: 'layer1',
                    label: 'Layer 1',
                    type: 'group',
                    children: [
                        {
                            key: 'show1',
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: 'radius1',
                            label: 'Radius',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0.01,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show1 })=>show1
                        },
                        {
                            key: 'x1',
                            label: 'Position X',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show1 })=>show1
                        },
                        {
                            key: 'y1',
                            label: 'Position Y',
                            defaultValue: 0,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show1 })=>show1
                        },
                        {
                            ...(0, _circleJsDefault.default).rotationConfig,
                            key: 'rotation1',
                            show: ({ show1 })=>show1
                        },
                        {
                            key: 'reverse1',
                            label: 'Reverse',
                            defaultValue: false,
                            type: 'checkbox',
                            show: ({ show1 })=>show1
                        }
                    ]
                },
                {
                    key: 'layer2',
                    label: 'Layer 2',
                    type: 'group',
                    children: [
                        {
                            key: 'show2',
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: 'radius2',
                            label: 'Radius',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0.01,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show2 })=>show2
                        },
                        {
                            key: 'x2',
                            label: 'Position X',
                            defaultValue: 0,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show2 })=>show2
                        },
                        {
                            key: 'y2',
                            label: 'Position Y',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show2 })=>show2
                        },
                        {
                            ...(0, _circleJsDefault.default).rotationConfig,
                            key: 'rotation2',
                            show: ({ show2 })=>show2
                        },
                        {
                            key: 'reverse2',
                            label: 'Reverse',
                            defaultValue: false,
                            type: 'checkbox',
                            show: ({ show2 })=>show2
                        }
                    ]
                },
                {
                    key: 'layer3',
                    label: 'Layer 3',
                    type: 'group',
                    children: [
                        {
                            key: 'show3',
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: 'radius3',
                            label: 'Radius',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0.01,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show3 })=>show3
                        },
                        {
                            key: 'x3',
                            label: 'Position X',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show3 })=>show3
                        },
                        {
                            key: 'y3',
                            label: 'Position Y',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({ show3 })=>show3
                        },
                        {
                            ...(0, _circleJsDefault.default).rotationConfig,
                            key: 'rotation3',
                            show: ({ show3 })=>show3
                        },
                        {
                            key: 'reverse3',
                            label: 'Reverse',
                            defaultValue: false,
                            type: 'checkbox',
                            show: ({ show3 })=>show3
                        }
                    ]
                }
            ]
        }
    ];
    setUpDraw() {
        super.setUpDraw();
        Object.assign(this, this.getSetUp());
    }
    getSetUp() {
        const { n, margin = 0, minNailDistance } = this.config;
        const size = this.getSize();
        const maxRadius = Math.min(...size.map((v)=>v - 2 * margin)) / 2;
        const layers = new Array(3).fill(null).map((_, i)=>getLayer.call(this, i + 1)).filter(({ enable })=>enable);
        const maxShapeNailsCount = Math.max(...layers.map(({ circle })=>circle.config.n));
        return {
            layers,
            maxShapeNailsCount
        };
        function getLayer(layerIndex) {
            const prop = (prop)=>this.config[prop + layerIndex];
            const props = {
                enable: prop('show'),
                isReverse: prop('reverse'),
                position: [
                    prop('x'),
                    prop('y')
                ],
                radius: maxRadius * prop('radius'),
                rotation: prop('rotation')
            };
            const circumsference = Math.PI * 2 * props.radius;
            const circleNails = Math.min(n, Math.floor(circumsference / minNailDistance));
            const circle = new (0, _circleJsDefault.default)({
                radius: props.radius,
                center: props.position.map((v, i)=>props.radius + margin + (size[i] - (props.radius + margin) * 2) * v),
                n: circleNails,
                rotation: props.rotation,
                reverse: props.isReverse
            });
            return {
                circle,
                ...props
            };
        }
    }
    getPoint(layer, index) {
        const { circle } = layer;
        let circleIndex = Math.round(index * circle.config.n / this.maxShapeNailsCount);
        return circle.getPoint(circleIndex);
    }
    *generateStrings() {
        const { n, color } = this.config;
        this.renderer.setColor(color);
        let prevCirclePoint;
        for(let i = 0; i < this.maxShapeNailsCount; i++)for(let layerIndex = 0; layerIndex < this.layers.length; layerIndex++){
            const layer = this.layers[layerIndex];
            const startPoint = prevCirclePoint ?? this.getPoint(layer, i);
            const positions = [];
            if (layerIndex === 0 && i) positions.push(this.getPoint(layer, i));
            let nextLayerIndex = layerIndex + 1;
            if (nextLayerIndex === this.layers.length) nextLayerIndex = 0;
            prevCirclePoint = this.getPoint(this.layers[nextLayerIndex], i);
            this.renderer.renderLines(startPoint, prevCirclePoint);
            yield;
        }
    }
    drawNails() {
        const n = this.config;
        this.layers.forEach(({ circle }, layerIndex)=>circle.drawNails(this.nails, {
                getNumber: (i)=>`${layerIndex + 1}_${i + 1}`
            }));
    }
    getStepCount() {
        const { layers, maxShapeNailsCount } = this.getSetUp();
        return layers.length * maxShapeNailsCount - 1;
    }
    static thumbnailConfig = {
        minNailDistance: 3
    };
}
exports.default = Freestyle;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"hS6F3":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
var _polygonJs = require("../helpers/Polygon.js");
var _polygonJsDefault = parcelHelpers.interopDefault(_polygonJs);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
const COLOR_CONFIG = (0, _colorJsDefault.default).getConfig({
    defaults: {
        isMultiColor: true,
        color: '#ff0000',
        multicolorRange: 1,
        multicolorStart: 0,
        multicolorByLightness: true,
        minLightness: 20,
        maxLightness: 50
    },
    exclude: [
        'colorCount'
    ]
});
class PolygonPattern extends (0, _stringArtJsDefault.default) {
    name = 'Polygon';
    id = 'polygon';
    controls = [
        {
            key: 'sides',
            label: 'Sides',
            defaultValue: 5,
            type: 'range',
            attr: {
                min: 3,
                max: 10,
                step: 1
            }
        },
        {
            key: 'n',
            label: 'Nails per side',
            defaultValue: 60,
            type: 'range',
            attr: {
                min: 1,
                max: 100,
                step: 1
            }
        },
        {
            key: 'bezier',
            label: 'Bezier',
            defaultValue: 2,
            type: 'range',
            attr: {
                min: 1,
                max: 4,
                step: 1
            },
            show: ({ sides })=>sides > 4
        },
        (0, _circleJsDefault.default).rotationConfig,
        COLOR_CONFIG
    ];
    defaultValues = {
        nailsColor: '#5c5c5c',
        nailRadius: 1
    };
    setUpDraw() {
        super.setUpDraw();
        const { n, rotation, sides, margin, isMultiColor } = this.config;
        const size = this.getSize();
        const polygonConfig = {
            sides,
            rotation,
            margin,
            size,
            nailsSpacing: 1 / n,
            fitSize: true
        };
        if (this.polygon) this.polygon.setConfig(polygonConfig);
        else this.polygon = new (0, _polygonJsDefault.default)(polygonConfig);
        this.color = new (0, _colorJsDefault.default)({
            ...this.config,
            isMultiColor,
            colorCount: sides
        });
        if (isMultiColor) this.colorMap = this.color.getColorMap({
            stepCount: this.getStepCount(),
            colorCount: sides
        });
        else this.colorMap = null;
    }
    *generateStrings() {
        const { sides, bezier } = this.config;
        const limitedBezier = Math.min(bezier, Math.ceil(sides / 2) - 1);
        let step = 0;
        this.renderer.setColor(this.color.getColor(0));
        for(let side = 0; side < sides; side++){
            const nextSide = (side + limitedBezier) % sides;
            if (this.colorMap) this.renderer.setColor(this.colorMap.get(step));
            for(let index = 0; index < this.polygon.nailsPerSide; index++){
                this.renderer.renderLines(this.polygon.getSidePoint({
                    side,
                    index
                }), this.polygon.getSidePoint({
                    side: nextSide,
                    index
                }));
                yield;
                step++;
            }
        }
    }
    getStepCount() {
        const { sides, n } = this.config;
        return sides * n;
    }
    drawNails() {
        this.polygon.drawNails(this.nails);
    }
    static thumbnailConfig = {
        n: 20
    };
}
exports.default = PolygonPattern;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","../helpers/Polygon.js":"lFkTi","../helpers/Color.js":"c9VvN","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"lFkTi":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _mathUtilsJs = require("./math_utils.js");
class Polygon {
    constructor(config){
        this.setConfig(config);
    }
    setConfig(config) {
        const serializedConfig = this._serializeConfig(config);
        if (serializedConfig !== this.serializedConfig) {
            const { rotation = 0, sides: sideCount } = this.config = config;
            const sideAngle = (0, _mathUtilsJs.PI2) / sideCount;
            const sides = new Array(sideCount).fill(null).map((_, i)=>{
                const angle = sideAngle * i + (0, _mathUtilsJs.PI2) * rotation;
                const radiusAngle = -sideAngle * (i - 0.5) - (0, _mathUtilsJs.PI2) * rotation;
                return {
                    cos: Math.cos(angle),
                    sin: Math.sin(angle),
                    center: {
                        cos: Math.cos(radiusAngle),
                        sin: Math.sin(radiusAngle)
                    }
                };
            });
            Object.assign(this, {
                sides,
                sideCount,
                sideAngle
            });
            if (this.points) this.points.clear();
            else this.points = new Map();
            Object.assign(this, this._getProps());
            if (config.fitSize) {
                Object.assign(this, this._getProps(this.getSizeAndCenter()));
                this.points.clear();
            }
        }
    }
    getSizeAndCenter() {
        const { size: configSize, margin } = this.config;
        const boundingRect = this.getBoundingRect();
        const scale = Math.min((configSize[0] - 2 * margin) / boundingRect.width, (configSize[1] - 2 * margin) / boundingRect.height);
        const size = configSize.map((v)=>v * scale);
        const center = [
            this.center[0] - scale * (boundingRect.left - configSize[0] + boundingRect.right) / 2,
            this.center[1] - scale * (boundingRect.top - configSize[1] + boundingRect.bottom) / 2
        ];
        this.points.clear();
        return {
            size,
            center
        };
    }
    _getProps(overrideConfig) {
        const { nailsSpacing, size, margin = 0, center: configCenter } = Object.assign({}, this.config, overrideConfig);
        const center = configCenter ?? this.config.size.map((v)=>v / 2);
        const radius = Math.min(...size) / 2 - margin;
        const sideSize = 2 * radius * Math.sin(this.sideAngle / 2);
        const start = [
            radius * Math.sin(this.sideAngle / 2),
            radius * Math.cos(this.sideAngle / 2)
        ];
        const nailsDistance = sideSize * nailsSpacing;
        const radiusNailsCount = Math.floor(radius / nailsDistance);
        const radiusNailsDistance = radius / radiusNailsCount;
        return {
            nailsSpacing,
            nailsPerSide: 1 / nailsSpacing,
            center,
            radius,
            sideSize,
            start,
            nailsDistance,
            radiusNailsCount,
            radiusNailsDistance
        };
    }
    _serializeConfig({ size, margin = 0, rotation = 0, center, sides }) {
        return [
            size?.join(','),
            center?.join(','),
            sides,
            margin,
            rotation
        ].join('_');
    }
    getSidePoint({ side, index }) {
        const pointsMapIndex = [
            side,
            index
        ].join('_');
        if (this.points.has(pointsMapIndex)) return this.points.get(pointsMapIndex);
        const startX = this.start[0] - index * this.nailsDistance;
        const { cos, sin } = this.sides[side];
        const point = [
            cos * startX - sin * this.start[1] + this.center[0],
            sin * startX + cos * this.start[1] + this.center[1]
        ];
        this.points.set(pointsMapIndex, point);
        return point;
    }
    getCenterPoint({ side, index }) {
        const radius = index * this.radiusNailsDistance;
        const { sin, cos } = this.sides[side].center;
        return [
            this.center[0] + sin * radius,
            this.center[1] + cos * radius
        ];
    }
    getBoundingRect() {
        const points = this.sides.map((_, side)=>this.getSidePoint({
                side,
                index: 0
            }));
        const firstPoint = points[0];
        const boundingRect = points.slice(1).reduce((boundingRect, [x, y])=>({
                left: Math.min(boundingRect.left, x),
                right: Math.max(boundingRect.right, x),
                top: Math.min(boundingRect.top, y),
                bottom: Math.max(boundingRect.bottom, y)
            }), {
            left: firstPoint[0],
            right: firstPoint[0],
            top: firstPoint[1],
            bottom: firstPoint[1]
        });
        boundingRect.height = boundingRect.bottom - boundingRect.top;
        boundingRect.width = boundingRect.right - boundingRect.left;
        Object.freeze(boundingRect);
        return boundingRect;
    }
    drawNails(nails, { drawCenter = false, drawSides = true } = {}) {
        for(let side = 0; side < this.sideCount; side++){
            const sideIndexStart = side * this.nailsPerSide;
            if (drawSides) for(let index = 0; index < this.nailsPerSide; index++)nails.addNail({
                point: this.getSidePoint({
                    side,
                    index
                }),
                number: sideIndexStart + index
            });
            if (drawCenter) for(let index = 0; index < this.radiusNailsCount; index++)nails.addNail({
                point: this.getCenterPoint({
                    side,
                    index
                }),
                number: `${side}_${index}`
            });
        }
    }
}
exports.default = Polygon;

},{"./math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"1RM1O":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
var _polygonJs = require("../helpers/Polygon.js");
var _polygonJsDefault = parcelHelpers.interopDefault(_polygonJs);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
const COLOR_CONFIG = (0, _colorJsDefault.default).getConfig({
    defaults: {
        isMultiColor: true,
        color: '#29f1ff',
        multicolorRange: 264,
        multicolorStart: 53,
        multicolorByLightness: false,
        minLightness: 30,
        maxLightness: 70
    },
    exclude: [
        'colorCount'
    ]
});
class Flower extends (0, _stringArtJsDefault.default) {
    name = 'Flower';
    id = 'flower';
    link = 'https://www.sqrt.ch/Buch/fadenmodell4_100.svg';
    controls = [
        {
            key: 'sides',
            label: 'Sides',
            defaultValue: 4,
            type: 'range',
            attr: {
                min: 3,
                max: 10,
                step: 1
            }
        },
        {
            key: 'n',
            label: 'Nails per side',
            defaultValue: 60,
            type: 'range',
            attr: {
                min: 1,
                max: 100,
                step: 1
            }
        },
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 2,
            type: 'range',
            attr: {
                min: 1,
                max: 10,
                step: 1
            }
        },
        (0, _circleJsDefault.default).rotationConfig,
        COLOR_CONFIG
    ];
    defaultValues = {
        nailsColor: '#29f1ff',
        nailRadius: 1,
        stringWidth: 0.5
    };
    setUpDraw() {
        super.setUpDraw();
        const { n, rotation, sides, layers, margin, isMultiColor } = this.config;
        const size = this.getSize();
        const layerAngleShift = 1 / (sides * layers);
        this.polygons = new Array(layers).fill(null).map((_, i)=>{
            const polygonConfig = {
                sides,
                rotation: rotation + i * layerAngleShift,
                margin,
                size,
                nailsSpacing: 1 / n
            };
            return new (0, _polygonJsDefault.default)(polygonConfig);
        });
        this.color = new (0, _colorJsDefault.default)({
            ...this.config,
            isMultiColor,
            colorCount: layers
        });
        if (isMultiColor) this.colorMap = this.color.getColorMap({
            stepCount: this.getStepCount(),
            colorCount: layers
        });
        else this.colorMap = null;
    }
    *generateStrings() {
        const { sides, layers } = this.config;
        let step = 0;
        this.renderer.setColor(this.color.getColor(0));
        for(let layer = 0; layer < layers; layer++){
            const polygon = this.polygons[layer];
            for(let side = 0; side < sides; side++){
                const leftSide = side === sides - 1 ? 0 : side + 1;
                for(let index = 0; index <= polygon.nailsPerSide; index++){
                    if (this.colorMap?.has(step)) this.renderer.setColor(this.colorMap.get(step));
                    const centerIndexes = this.getCenterIndexes({
                        polygon,
                        sideIndex: index
                    });
                    this.renderer.renderLines(polygon.getCenterPoint({
                        side: side,
                        index: centerIndexes[0]
                    }), polygon.getSidePoint({
                        side,
                        index
                    }), polygon.getCenterPoint({
                        side: leftSide,
                        index: centerIndexes[1]
                    }));
                    yield;
                    step++;
                }
            }
        }
    }
    getCenterIndexes({ polygon, sideIndex }) {
        const extraNailCount = polygon.nailsPerSide - polygon.radiusNailsCount;
        return [
            sideIndex < extraNailCount ? -extraNailCount + sideIndex : sideIndex - extraNailCount,
            polygon.radiusNailsCount - sideIndex
        ];
    }
    getStepCount() {
        const { sides, n, layers } = this.config;
        return sides * (n + 1) * layers;
    }
    drawNails() {
        this.polygons.forEach((polygon)=>polygon.drawNails(this.nails, {
                drawCenter: true
            }));
    }
    static thumbnailConfig = {
        n: 20
    };
}
exports.default = Flower;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","../helpers/Polygon.js":"lFkTi","../helpers/Color.js":"c9VvN","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"jE01T":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _mathUtilsJs = require("../helpers/math_utils.js");
const COLOR_CONFIG = (0, _colorJsDefault.default).getConfig({
    defaults: {
        isMultiColor: true,
        color: '#ffffff',
        multicolorRange: 133,
        multicolorStart: 239,
        multicolorByLightness: false,
        minLightness: 30,
        maxLightness: 70,
        colorCount: 4
    },
    exclude: [
        'repeatColors',
        'mirrorColors'
    ]
});
class MaurerRose extends (0, _stringArtJsDefault.default) {
    name = 'Maurer Rose';
    id = 'maurer_rose';
    link = 'https://blog.glitch.land/en/posts/maurer-rose/';
    linkText = 'Learn';
    controls = [
        {
            key: 'n',
            label: 'N',
            defaultValue: 4,
            type: 'range',
            attr: {
                min: 1,
                max: 12,
                step: 1
            },
            isStructural: true
        },
        {
            key: 'maxSteps',
            label: 'Max steps',
            defaultValue: 512,
            type: 'range',
            attr: {
                min: 3,
                max: 720,
                step: 1
            },
            isStructural: true
        },
        {
            key: 'angle',
            label: 'Angle',
            defaultValue: 341,
            type: 'range',
            attr: {
                min: 1,
                max: 720,
                step: 1
            },
            displayValue: ({ angle })=>`${angle}\xb0`,
            isStructural: true
        },
        (0, _circleJsDefault.default).rotationConfig,
        COLOR_CONFIG
    ];
    resetStructure() {
        super.resetStructure();
        if (this.points) this.points.clear();
        this.calc = null;
    }
    setUpDraw() {
        super.setUpDraw();
        const { isMultiColor, colorCount } = this.config;
        if (!this.calc) this.calc = this.getCalc();
        if (!this.points) this.points = new Map();
        if (!this.stepCount) this.stepCount = this.getStepCount();
        this.color = new (0, _colorJsDefault.default)({
            ...this.config,
            isMultiColor,
            colorCount
        });
        if (isMultiColor) this.colorMap = this.color.getColorMap({
            stepCount: this.stepCount,
            colorCount
        });
        else this.colorMap = null;
    }
    getCalc() {
        const { n, angle, rotation, maxSteps } = this.config;
        const size = this.getSize();
        return {
            n,
            angleRadians: (0, _mathUtilsJs.PI2) * angle / maxSteps,
            radius: Math.min(...size) / 2,
            currentSize: size,
            rotationAngle: -Math.PI * 2 * rotation
        };
    }
    getPoint(index) {
        if (this.points.has(index)) return this.points.get(index);
        const k = index * this.calc.angleRadians;
        const r = this.calc.radius * Math.sin(this.calc.n * k);
        const point = [
            this.center[0] - r * Math.cos(k - this.calc.rotationAngle),
            this.center[1] - r * Math.sin(k - this.calc.rotationAngle)
        ];
        this.points.set(index, point);
        return point;
    }
    *generatePoints() {
        const count = this.stepCount;
        for(let i = 0; i < count + 1; i++)yield {
            point: this.getPoint(i),
            index: i
        };
    }
    *generateStrings() {
        const points = this.generatePoints();
        let prevPoint;
        this.renderer.setColor(this.color.getColor(0));
        for (const { point, index } of points){
            if (!prevPoint) {
                prevPoint = point;
                continue;
            }
            if (this.colorMap) {
                const stepColor = this.colorMap.get(index);
                if (stepColor) this.renderer.setColor(stepColor);
            }
            this.renderer.renderLines(prevPoint, point);
            prevPoint = point;
            yield;
        }
    }
    getStepCount() {
        if (this.stepCount) return this.stepCount;
        const { maxSteps, angle, n } = this.config;
        const angleGcd = (0, _mathUtilsJs.gcd)(maxSteps, angle);
        let steps = maxSteps / angleGcd;
        if (!(steps % 2) && n % 2) steps /= 2;
        return Math.round(steps);
    }
    drawNails() {
        const points = this.generatePoints();
        for (const { point, index } of points)this.nails.addNail({
            point,
            number: index
        });
    }
    static thumbnailConfig = {
        maxSteps: 160,
        angle: 213
    };
}
exports.default = MaurerRose;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","../helpers/Color.js":"c9VvN","../helpers/math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"1KjlV":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _mathUtilsJs = require("../helpers/math_utils.js");
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _polygonJs = require("../helpers/Polygon.js");
var _polygonJsDefault = parcelHelpers.interopDefault(_polygonJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
const COLOR_CONFIG = (0, _colorJsDefault.default).getConfig({
    defaults: {
        isMultiColor: true,
        color: '#29f1ff',
        multicolorRange: 43,
        multicolorStart: 25,
        multicolorByLightness: true,
        minLightness: 40,
        maxLightness: 95,
        colorCount: 3,
        repeatColors: true,
        saturation: 83,
        reverseColors: true
    },
    customControls: [
        {
            key: 'colorPerLevel',
            label: 'Color per level',
            defaultValue: true,
            type: 'checkbox'
        }
    ]
});
const ANGLE = -(0, _mathUtilsJs.PI2) / 6; // The angle of a equilateral triangle;
const SIDE_ANGLES = new Array(6).fill(null).map((_, i)=>Math.PI / 2 + ANGLE * i);
class FlowerOfLife extends (0, _stringArtJsDefault.default) {
    name = 'Flower of Life';
    id = 'flower_of_life';
    link = 'https://www.reddit.com/r/psychedelicartwork/comments/mk97gi/rainbow_flower_of_life_uv_reactive_string_art/';
    controls = [
        {
            key: 'levels',
            label: 'Levels',
            defaultValue: 3,
            type: 'range',
            attr: {
                min: 1,
                max: 10,
                step: 1
            },
            isStructural: true
        },
        {
            key: 'density',
            label: 'Density',
            defaultValue: 10,
            type: 'range',
            attr: {
                min: 1,
                max: 50,
                step: 1
            },
            isStructural: true
        },
        {
            key: 'globalRotation',
            label: 'Rotation',
            defaultValue: 0,
            type: 'range',
            attr: {
                min: 0,
                max: 30,
                step: 1
            },
            displayValue: (config, { key })=>`${config[key]}\xb0`,
            isStructural: true,
            affectsStepCount: false
        },
        {
            key: 'fillGroup',
            label: 'Fill',
            type: 'group',
            children: [
                {
                    key: 'fill',
                    label: 'Show fill',
                    defaultValue: true,
                    type: 'checkbox',
                    isStructural: true
                },
                {
                    key: 'fillColor',
                    label: 'Fill color',
                    defaultValue: '#292e29',
                    type: 'color',
                    show: ({ fill })=>fill
                }
            ]
        },
        {
            key: 'ringGroup',
            label: 'Ring',
            type: 'group',
            children: [
                {
                    key: 'renderRing',
                    label: 'Show outer ring',
                    type: 'checkbox',
                    defaultValue: true,
                    isStructural: true
                },
                {
                    key: 'ringNailCount',
                    label: 'Ring nail count',
                    defaultValue: 144,
                    type: 'range',
                    attr: {
                        min: 3,
                        max: 360,
                        step: 1
                    },
                    show: ({ renderRing })=>renderRing,
                    isStructural: true
                },
                {
                    key: 'ringSize',
                    label: 'Outer ring size',
                    defaultValue: 0.23,
                    type: 'range',
                    attr: {
                        min: 0,
                        max: 0.5,
                        step: 0.01
                    },
                    show: ({ renderRing })=>renderRing,
                    displayValue: ({ ringSize })=>`${Math.round(100 * ringSize)}%`,
                    isStructural: true
                },
                {
                    key: 'ringPadding',
                    label: 'Ring padding',
                    defaultValue: 0.06,
                    type: 'range',
                    attr: {
                        min: 0,
                        max: 0.5,
                        step: 0.01
                    },
                    show: ({ renderRing })=>renderRing,
                    isStructural: true,
                    displayValue: ({ ringPadding })=>`${Math.round(100 * ringPadding)}%`
                },
                {
                    key: 'ringColor',
                    label: 'Ring color',
                    defaultValue: '#e8b564',
                    type: 'color',
                    show: ({ renderRing })=>renderRing
                }
            ]
        },
        {
            key: 'renderTriangles',
            label: 'Show triangles',
            defaultValue: true,
            type: 'checkbox',
            isStructural: true
        },
        {
            key: 'renderCaps',
            label: 'Show caps',
            defaultValue: true,
            type: 'checkbox',
            show: ({ renderTriangles })=>renderTriangles,
            isStructural: true
        },
        COLOR_CONFIG
    ];
    defaultValues = {
        nailsColor: '#474747'
    };
    getCalc() {
        const { levels, density, margin, globalRotation, renderCaps, fill, renderTriangles, renderRing, ringNailCount, ringSize, ringPadding } = this.config;
        const globalRotationRadians = globalRotation * Math.PI / 180 + Math.PI / 6;
        const radius = renderRing ? Math.min(...(this.size ?? this.getSize()).map((v)=>v / 2 - margin)) : null;
        const ringDistance = renderRing ? Math.floor(ringSize * ringNailCount / 2) : 0; // The number of nails to count for strings in the outer ring
        const ringWidth = renderRing ? radius * (1 - Math.cos((0, _mathUtilsJs.PI2) * (ringDistance / ringNailCount) / 2)) : 0;
        const polygon = new (0, _polygonJsDefault.default)({
            sides: 6,
            size: this.getSize(),
            margin: margin + ringWidth + (renderRing && ringSize ? ringPadding * radius : 0),
            rotation: globalRotationRadians,
            fitSize: false
        });
        const edgeSize = polygon.sideSize / levels;
        const nailsLength = edgeSize / (2 * Math.cos(Math.PI / 6));
        const countPerLevelSide = new Array(levels + (renderCaps ? 1 : 0)).fill(null).map((_, level)=>level * 2 + 1);
        return {
            edgeSize,
            triangleHeight: edgeSize * Math.sqrt(3) / 2,
            nailsLength,
            triangleCenterDistance: edgeSize / 2,
            nailDistance: nailsLength / density,
            triangleCount: 6 * levels ** 2,
            countPerLevelSide,
            globalRotationRadians,
            fill,
            renderTriangles,
            renderCaps,
            ringNailCount,
            radius
        };
    }
    resetStructure() {
        super.resetStructure();
        this.points = null;
        this.calc = null;
    }
    setUpDraw() {
        super.setUpDraw();
        const { isMultiColor, levels, colorPerLevel, colorCount, renderRing, ringSize, ...config } = this.config;
        if (!this.calc) this.calc = this.getCalc();
        if (renderRing && ringSize) {
            const circleConfig = {
                size: this.size,
                n: this.calc.ringNailCount,
                margin: config.margin,
                rotation: config.globalRotation
            };
            if (this.circle) this.circle.setConfig(circleConfig);
            else this.circle = new (0, _circleJsDefault.default)(circleConfig);
        } else this.circle = null;
        if (!this.points) this.points = this.getPoints();
        if (!this.stepCount) this.stepCount = this.getStepCount(this.calc);
        const realColorCount = isMultiColor ? colorPerLevel ? levels : Math.min(colorCount, levels) : 1;
        this.color = new (0, _colorJsDefault.default)({
            ...config,
            isMultiColor,
            colorCount: realColorCount
        });
        if (isMultiColor) this.colorMap = this.color.getColorMap({
            stepCount: realColorCount,
            colorCount: realColorCount
        });
        else this.colorMap = null;
    }
    getTrianglePoints({ center, rotation, isCapLevel, triangleIndexInSide }) {
        let missingSide;
        if (isCapLevel) {
            const triangleIndex = (triangleIndexInSide + 2) % 3;
            missingSide = this._getNextIndexInTriangle(triangleIndex);
        }
        // For each side of the triangle, the first point is the center of the triangle:
        const trianglePoints = new Array(3).fill(null).map((_, i)=>i === missingSide ? [] : [
                center
            ]);
        for(let side = 0; side < 3; side++){
            if (isCapLevel && side === missingSide) continue;
            const sideAngle = rotation + side * ((0, _mathUtilsJs.PI2) / 3);
            const triangleSidePoints = trianglePoints[side];
            const cosSideAngle = Math.cos(sideAngle);
            const sinSideAngle = Math.sin(sideAngle);
            for(let n = 1; n <= this.config.density; n++){
                const nNailDistance = n * this.calc.nailDistance;
                triangleSidePoints.push([
                    center[0] + nNailDistance * cosSideAngle,
                    center[1] + nNailDistance * sinSideAngle
                ]);
            }
        }
        return trianglePoints;
    }
    getPoints() {
        if (this.points) return this.points;
        const { levels, renderCaps } = this.config;
        const largeDistance = this.calc.nailsLength;
        const smallDistance = this.calc.triangleHeight - largeDistance;
        const levelsPoints = [];
        const levelsCount = renderCaps ? levels + 1 : levels;
        for(let level = 0; level < levelsCount; level++){
            const isCapLevel = renderCaps && level === levels;
            const levelTrianglesPoints = [];
            levelsPoints.push(levelTrianglesPoints);
            const levelSideTriangleCount = this.calc.countPerLevelSide[level];
            // Caching distances to avoid repeated calculations for each side:
            const levelPositions = new Array(levelSideTriangleCount).fill(null).map((_, n)=>{
                const isFlipped = n % 2 === 0;
                const trianglePosition = [
                    this.calc.triangleCenterDistance * (n - level),
                    level * this.calc.triangleHeight + (isFlipped ? largeDistance : smallDistance)
                ];
                return {
                    rotation: Math.atan(trianglePosition[0] / trianglePosition[1]),
                    distanceFromCenter: Math.sqrt(trianglePosition[0] ** 2 + trianglePosition[1] ** 2)
                };
            });
            for(let side = 0; side < 6; side++){
                const sideRotation = SIDE_ANGLES[side];
                for(let n = 0; n < levelSideTriangleCount; n++){
                    if (isCapLevel && n % 2 === 0) {
                        // Cap triangles are only odd indexes
                        levelTrianglesPoints.push(null);
                        continue;
                    }
                    const { distanceFromCenter, rotation } = levelPositions[n];
                    const triangleCenterAngle = sideRotation - rotation - this.calc.globalRotationRadians;
                    const rotatedTrianglePosition = [
                        this.center[0] + distanceFromCenter * Math.cos(triangleCenterAngle),
                        this.center[1] - distanceFromCenter * Math.sin(triangleCenterAngle)
                    ];
                    const trianglePoints = this.getTrianglePoints({
                        center: rotatedTrianglePosition,
                        rotation: sideRotation + side * (0, _mathUtilsJs.PI2) / 3 - n * ANGLE + this.calc.globalRotationRadians,
                        isCapLevel,
                        triangleIndexInSide: n
                    });
                    levelTrianglesPoints.push(trianglePoints);
                }
            }
        }
        return levelsPoints;
    }
    *generateTriangleStrings({ points, level, indexInSide }) {
        this.renderer.setColor(this.color.getColor(level));
        const { density, levels } = this.config;
        const isCapLevel = level === levels;
        const initialSide = isCapLevel ? this._getNextIndexInTriangle(indexInSide % 3) : 0;
        const lastSide = isCapLevel ? initialSide : 2;
        const lastIndex = isCapLevel ? density : density - 1;
        for(let side = initialSide; side <= lastSide; side++){
            const nextSide = this._getNextIndexInTriangle(side);
            let prevPoint = points[side][0];
            for(let n = 0; n <= lastIndex; n++){
                const isNextSide = n % 2 === 0;
                const positions = [];
                const nextSidePoint = isNextSide ? this.config.density - n : n;
                const targetSide = isNextSide ? nextSide : side;
                positions.push(points[targetSide][nextSidePoint]);
                if (n < density) positions.push(points[targetSide][isNextSide ? nextSidePoint - 1 : nextSidePoint + 1]);
                this.renderer.renderLines(prevPoint, ...positions);
                prevPoint = positions[positions.length - 1];
                yield;
            }
        }
    }
    *generateStringsBetweenTriangles({ triangle1, triangle2, level, triangleIndex, triangleIndexInSide, isNextLevel, nextLevelTriangleIndex }) {
        const { density, fillColor } = this.config;
        const levelSideCount = this.calc.countPerLevelSide[level];
        const angleShift = triangleIndex % levelSideCount % 3;
        this.renderer.setColor(fillColor);
        const isLastTriangleInSide = triangleIndexInSide === levelSideCount - 1;
        const firstSide = angleShift;
        const sideIndex = isNextLevel ? [
            this._getNextIndexInTriangle(angleShift),
            this._getNextIndexInTriangle(angleShift, -1)
        ] : [
            firstSide,
            this._getNextIndexInTriangle(firstSide, triangleIndexInSide % 2 ? 1 : -1)
        ];
        for(let s = 0; s < 2; s++){
            const order = generateOrderInSide.call(this, s);
            for (const { pointIndex, triangle1Points, triangle2Points } of order){
                this.renderer.renderLines(triangle1Points[pointIndex], triangle2Points[pointIndex]);
                yield;
            }
        }
        function* generateOrderInSide(side) {
            const t1Side = sideIndex[side];
            const t2Side = getNextTriangleSide.call(this);
            const triangle1Points = triangle1[t1Side];
            const triangle2Points = triangle2[t2Side];
            const last = side ? density : density - 1;
            if (side === 0) for(let n = 0; n <= last; n++)yield {
                pointIndex: density - n,
                triangle1Points,
                triangle2Points
            };
            else for(let n = last; n >= 1; n--)yield {
                pointIndex: density - n,
                triangle1Points,
                triangle2Points
            };
            function getNextTriangleSide() {
                if (isNextLevel) return this._getNextIndexInTriangle(t1Side);
                else {
                    if (side === 0 && isLastTriangleInSide) return 1;
                    else {
                        if (side === 1 && isLastTriangleInSide) return 0;
                        else return this._getNextIndexInTriangle(t1Side, 1);
                    }
                }
            }
        }
    }
    _getNextIndexInTriangle(index, direction = 1) {
        const result = index + direction;
        if (result < 0) return 2;
        if (result > 2) return 0;
        return result;
    }
    *generateStrings() {
        const { fill, renderTriangles, renderCaps, levels, renderRing, ringSize, ringColor } = this.config;
        const triangleLevels = this.getPoints();
        let levelIndex = -1;
        for (const level of triangleLevels){
            levelIndex++;
            const isCapLevel = levelIndex === levels;
            let triangleIndex = -1;
            const lastIndexInLevel = level.length - 1;
            for (const triangle of level){
                triangleIndex++;
                const levelSideCount = this.calc.countPerLevelSide[levelIndex];
                const triangleIndexInSide = triangleIndex % levelSideCount;
                if (fill && !isCapLevel) {
                    if (triangleIndex === 0) yield* this.generateStringsBetweenTriangles({
                        triangle1: level[lastIndexInLevel],
                        triangle2: triangle,
                        level: levelIndex,
                        triangleIndex: lastIndexInLevel,
                        triangleIndexInSide: lastIndexInLevel % levelSideCount
                    });
                    if (triangleIndex !== lastIndexInLevel) yield* this.generateStringsBetweenTriangles({
                        triangle1: triangle,
                        triangle2: level[triangleIndex + 1],
                        level: levelIndex,
                        triangleIndex,
                        triangleIndexInSide
                    });
                    if (triangleIndexInSide % 2 === 0 && (renderCaps || levelIndex < levels - 1)) {
                        const side = Math.floor(triangleIndex / levelSideCount);
                        const nextLevelSideCount = this.calc.countPerLevelSide[levelIndex + 1];
                        const nextLevelTriangleIndex = side * nextLevelSideCount + triangleIndexInSide + 1;
                        yield* this.generateStringsBetweenTriangles({
                            triangle1: triangle,
                            triangle2: triangleLevels[levelIndex + 1][nextLevelTriangleIndex],
                            level: levelIndex,
                            triangleIndex,
                            triangleIndexInSide,
                            isNextLevel: true,
                            nextLevelTriangleIndex
                        });
                    }
                }
                const indexInSide = triangleIndex % this.calc.countPerLevelSide[levelIndex];
                if (renderTriangles && (!isCapLevel || indexInSide % 2)) yield* this.generateTriangleStrings({
                    points: triangle,
                    level: levelIndex,
                    indexInSide
                });
            }
        }
        if (renderRing && ringSize) yield* this.circle.drawRing(this.renderer, {
            ringSize: ringSize / 2,
            color: ringColor
        });
    }
    getStepCount(calc) {
        if (this.stepCount) return this.stepCount;
        if (!calc) calc = this.getCalc();
        const { levels, density, fill, renderTriangles, renderCaps } = this.config;
        const { triangleCount, ringNailCount = 0 } = calc;
        const fillStepsPerTriangle = fill ? density * 2 : 0;
        const triangleSteps = renderTriangles ? density * 3 : 0;
        const stepsPerTriangle = triangleSteps + fillStepsPerTriangle;
        const levelsWithFillBetween = levels + (renderCaps ? 1 : 0);
        const fillStepsBetweenLevels = fillStepsPerTriangle * (levelsWithFillBetween - 1) * 6 * levelsWithFillBetween / 2;
        const stepsPerCap = density + 1;
        const capSteps = renderTriangles && renderCaps ? 6 * levels * stepsPerCap : 0;
        return triangleCount * stepsPerTriangle + capSteps + fillStepsBetweenLevels + ringNailCount;
    }
    drawNails() {
        const triangleLevels = this.getPoints();
        let index = 0;
        for (const level of triangleLevels){
            for (const triangle of level)if (triangle != null) {
                // A cap level has nulls between caps
                for (const triangleSide of triangle)for (const point of triangleSide)this.nails.addNail({
                    point,
                    number: index++
                });
            }
        }
        if (this.circle) this.circle.drawNails(this.nails);
    }
    static thumbnailConfig = {
        levels: 3,
        density: 3,
        fill: false,
        renderRing: true
    };
}
exports.default = FlowerOfLife;

},{"../helpers/math_utils.js":"iaiaj","../StringArt.js":"8dqjf","../helpers/Color.js":"c9VvN","../helpers/Polygon.js":"lFkTi","../helpers/Circle.js":"c8IFm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"kfE2A":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _stringArtJs = require("../StringArt.js");
var _stringArtJsDefault = parcelHelpers.interopDefault(_stringArtJs);
var _circleJs = require("../helpers/Circle.js");
var _circleJsDefault = parcelHelpers.interopDefault(_circleJs);
var _colorJs = require("../helpers/Color.js");
var _colorJsDefault = parcelHelpers.interopDefault(_colorJs);
var _mathUtilsJs = require("../helpers/math_utils.js");
const COLOR_CONFIG = (0, _colorJsDefault.default).getConfig({
    defaults: {
        isMultiColor: true,
        color: '#ff0000',
        multicolorRange: 133,
        multicolorStart: 239,
        multicolorByLightness: false,
        minLightness: 30,
        maxLightness: 70,
        colorCount: 4
    },
    customControls: [
        {
            key: 'colorPerLayer',
            label: 'Color per layer',
            defaultValue: true,
            type: 'checkbox'
        }
    ]
});
const spreadModes = {
    evenly: {
        f: (layerIndex, { ringSize, layers, n })=>{
            const firstLayerDistance = Math.floor(n * ringSize);
            return Math.floor((layers - layerIndex) * firstLayerDistance / layers);
        },
        name: 'Evenly'
    },
    distance: {
        f: (layerIndex, { n, ringSize, layerDistance })=>{
            const firstLayerDistance = Math.floor(n * ringSize);
            if (layerIndex > 0) return firstLayerDistance - layerIndex * layerDistance;
            return firstLayerDistance;
        },
        name: 'Specific distance'
    }
};
class Comet extends (0, _stringArtJsDefault.default) {
    name = 'Comet';
    id = 'comet';
    controls = [
        (0, _circleJsDefault.default).nailsConfig,
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 5,
            type: 'range',
            attr: {
                min: 1,
                max: 20,
                step: 1
            },
            isStructural: true
        },
        {
            key: 'ringSize',
            label: 'First layer size',
            description: 'Nail count from the top center nail to the first connected nail in the first layer',
            defaultValue: 0.3,
            type: 'range',
            attr: {
                min: 0,
                max: 1,
                step: 0.01
            },
            displayValue: ({ ringSize, n })=>Math.floor(n * ringSize),
            isStructural: true
        },
        {
            key: 'layerSpread',
            label: 'Layer Spread',
            type: 'select',
            defaultValue: 'distance',
            options: Object.entries(spreadModes).map(([key, { name }])=>({
                    value: key,
                    label: name
                })),
            isStructural: true
        },
        {
            key: 'layerDistance',
            label: 'Layer Distance',
            type: 'range',
            attr: {
                min: 1,
                max: ({ config: { n, layers } })=>Math.floor(n / 2 / layers),
                step: 1
            },
            defaultValue: 1,
            isStructural: true,
            show: ({ layerSpread })=>layerSpread !== 'evenly'
        },
        (0, _circleJsDefault.default).rotationConfig,
        (0, _circleJsDefault.default).distortionConfig,
        (0, _circleJsDefault.default).displacementConfig,
        COLOR_CONFIG
    ];
    defaultValues = {
        n: 51,
        layers: 11,
        colorPerLayer: true,
        multicolorRange: 203,
        multicolorStart: 137,
        ringSize: 0.47,
        rotation: 0.25,
        distortion: 0.38,
        displacementFunc: 'fastInOut',
        displacementMag: 1.8,
        displacementFastArea: 0.43,
        layerSpread: 'distance',
        layerDistance: 1
    };
    resetStructure() {
        if (this.points) this.points.clear();
        if (this.layerRingDistances) this.layerRingDistances.clear();
    }
    setUpDraw() {
        super.setUpDraw();
        const circleConfig = {
            size: this.size,
            n: this.config.n,
            margin: this.config.margin,
            rotation: this.config.rotation,
            distortion: this.config.distortion,
            displacementFunc: this.config.displacementFunc,
            displacementMag: this.config.displacementMag,
            displacementFastArea: this.config.displacementFastArea
        };
        if (this.circle) this.circle.setConfig(circleConfig);
        else this.circle = new (0, _circleJsDefault.default)(circleConfig);
        if (!this.stepCount) this.stepCount = this.getStepCount();
        const { isMultiColor, colorCount, layers, colorPerLayer } = this.config;
        const realColorCount = isMultiColor ? colorPerLayer ? layers : Math.min(colorCount, layers) : 1;
        this.color = new (0, _colorJsDefault.default)({
            ...this.config,
            isMultiColor,
            colorCount: realColorCount
        });
    }
    getCalc() {
        const { n } = this.config;
        const size = this.getSize();
        return {
            n,
            angleRadians: (0, _mathUtilsJs.PI2) * angle / maxSteps,
            radius: Math.min(...size) / 2,
            currentSize: size,
            rotationAngle: -Math.PI * 2 * rotation
        };
    }
    getLayerRingDistance(layerIndex) {
        const spread = spreadModes[this.config.layerSpread];
        if (!spread) throw new Error(`Invalid spread mode, "${this.config.layerSpread}"!`);
        return spread.f(layerIndex, this.config);
    }
    getLayerRingStepCount(layerIndex) {
        const layerRingDistance = this.getLayerRingDistance(layerIndex);
        return (this.config.n - layerRingDistance + 1) * 2 - 1;
    }
    *drawLayer(layerIndex = 0) {
        const { n } = this.config;
        const ringDistance = this.getLayerRingDistance(layerIndex);
        const stepCount = n - ringDistance + 1;
        let prevPoint = this.circle.getPoint(0);
        let prevPointIndex = 0;
        this.renderer.setColor(this.color.getColor(layerIndex));
        for(let i = 0; i < n - ringDistance + 1; i++){
            const pointIndex = i + ringDistance;
            const point = this.circle.getPoint(pointIndex);
            this.renderer.renderLines(prevPoint, point);
            yield;
            if (i !== stepCount - 1) {
                prevPointIndex = i + 1;
                prevPoint = this.circle.getPoint(prevPointIndex);
                this.renderer.renderLines(point, prevPoint);
                yield;
            }
        }
    }
    *generateStrings() {
        for(let layer = 0; layer < this.config.layers; layer++)yield* this.drawLayer(layer);
    }
    getStepCount() {
        if (this.stepCount) return this.stepCount;
        const { layers } = this.config;
        return new Array(layers).fill(0).reduce((totalStepCount, _, layerIndex)=>totalStepCount + this.getLayerRingStepCount(layerIndex), 0);
    }
    drawNails() {
        this.circle.drawNails(this.nails);
    }
    static thumbnailConfig = {
        n: 24,
        layers: 8
    };
}
exports.default = Comet;

},{"../StringArt.js":"8dqjf","../helpers/Circle.js":"c8IFm","../helpers/Color.js":"c9VvN","../helpers/math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"9YWTc":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const elements = {
    controls: document.querySelector('#controls'),
    controlsPanel: document.querySelector('#controls_panel'),
    sidebarForm: document.querySelector('#sidebar_form')
};
const EVENTS = new Set([
    'input',
    'change'
]);
const STATE_LOCAL_STORAGE_KEY = 'controls_state';
const RANGE_SCROLL_LOCK_TIMEOUT = 120;
let inputTimeout;
class EditorControls {
    constructor({ pattern }){
        this.pattern = pattern;
        this.state = this._getState() ?? {
            groups: {}
        };
        this.eventHandlers = {
            input: new Set(),
            change: new Set()
        };
        this._toggleFieldset = (e)=>{
            if (e.target.nodeName === 'LEGEND') {
                e.target.parentElement.classList.toggle('minimized');
                const groupId = e.target.parentElement.dataset.group;
                this.state = {
                    ...this.state,
                    groups: {
                        ...this.state.groups,
                        [groupId]: !e.target.parentElement.classList.contains('minimized')
                    }
                };
                this._updateState(this.state);
            }
        };
        this._toggleFieldSetOnEnter = (e)=>{
            if (e.target.nodeName === 'LEGEND' && e.key === 'Enter') this._toggleFieldset(e);
        };
        this._wrappedOnInput = (e)=>this._onInput(e);
        elements.controls.addEventListener('input', this._wrappedOnInput);
        this._wrappedOnTouchStart = (e)=>this._onTouchStart(e);
        this._wrappedOnMouseDown = (e)=>this._onMouseDown(e);
        elements.controls.addEventListener('touchstart', this._wrappedOnTouchStart);
        elements.controls.addEventListener('mousedown', this._wrappedOnMouseDown);
        elements.sidebarForm.addEventListener('click', this._toggleFieldset);
        elements.sidebarForm.addEventListener('keydown', this._toggleFieldSetOnEnter);
        this.controlElements = {};
        this.renderControls();
    }
    destroy() {
        elements.controls.removeEventListener('input', this._wrappedOnInput);
        elements.sidebarForm.removeEventListener('click', this._toggleFieldset);
        elements.sidebarForm.removeEventListener('keydown', this._toggleFieldSetOnEnter);
        elements.controls.removeEventListener('touchstart', this._wrappedOnTouchStart);
        elements.controls.removeEventListener('mousedown', this._wrappedOnMouseDown);
        elements.controls.innerHTML = '';
    }
    addEventListener(event, eventHandler) {
        if (!EVENTS.has(event)) throw new Error(`Unsupported event for EditorControls, "${event}"!`);
        if (!(eventHandler instanceof Function)) throw new Error('Invalid event handler.');
        this.eventHandlers[event].add(eventHandler);
    }
    _triggerEvent(event, eventData) {
        for (const eventHandler of this.eventHandlers[event])eventHandler(eventData);
    }
    _onMouseDown(e) {
        // Clearing selection when starting to click in the controls, do avoid a buggy behavior,
        // when if a control's display value was selected (can happen by mistake), the drag of range input doesn't work.
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
    }
    /**
   * Needed for range inputs, to avoid changing the value when the user drags to
   * scroll and accidentally touches a range input when intending to scroll.
   * @param {Event} e
   */ _onTouchStart(e) {
        if (e.target.getAttribute('type') === 'range') {
            this._postponeRangeInput = true;
            this.currentInputRange = e.target;
            this.currentInputRangeValue = e.target.value;
            this._rangeLockTimeout = setTimeout(()=>{
                this._postponeRangeInput = false;
            }, RANGE_SCROLL_LOCK_TIMEOUT);
            this._wrappedOnTouchEnd = (e)=>this._onTouchEnd(e);
            document.body.addEventListener('touchend', this._wrappedOnTouchEnd);
            this._wrappedOnRangeScroll = (e)=>this._onRangeScroll(e);
            elements.controlsPanel.addEventListener('scroll', this._wrappedOnRangeScroll);
        }
    }
    _onTouchEnd() {
        document.body.removeEventListener('touchend', this._wrappedOnTouchEnd);
        elements.controlsPanel.removeEventListener('scroll', this._wrappedOnRangeScroll);
        if (this._lockRange) {
            this._lockRange = false;
            if (this.currentInputRange) this.currentInputRange.value = this.currentInputRangeValue;
        }
        this.currentInputRange = this.currentInputRangeValue = null;
    }
    _onRangeScroll() {
        this._lockRange = true;
    }
    _onInput(e) {
        clearTimeout(inputTimeout);
        clearTimeout(this._postponeRangeInputTimeout);
        if (this._postponeRangeInput && e.target.getAttribute('type') === 'range') {
            e.preventDefault();
            this._postponeRangeInputTimeout = setTimeout(()=>{
                this._onInput(e);
            }, RANGE_SCROLL_LOCK_TIMEOUT);
            return false;
        }
        if (this._lockRange) {
            e.preventDefault();
            return false;
        }
        this.updateInput({
            inputElement: e.target,
            originalEvent: e,
            deferChange: true
        });
    }
    updateInput({ inputElement, originalEvent, deferChange = true }) {
        const inputValue = getInputValue(inputElement.type, inputElement);
        const controlKey = inputElement.id.replace(/^config_/, '');
        this.pattern.setConfigValue(controlKey, inputValue);
        const { config, displayValue } = this.controlElements[controlKey];
        if (displayValue) {
            const formattedValue = config.displayValue ? config.displayValue(this.pattern.config, config) : inputElement.value;
            displayValue.innerText = formattedValue;
        }
        const eventData = Object.freeze({
            control: controlKey,
            value: inputValue,
            originalEvent,
            pattern: this.pattern
        });
        this._triggerEvent('input', eventData);
        const triggerChange = ()=>{
            this._triggerEvent('change', eventData);
            this.updateControlsVisibility();
            this.updateControlsAttributes();
        };
        if (deferChange) inputTimeout = setTimeout(triggerChange, 100);
        else triggerChange();
    }
    _getState() {
        const state = localStorage.getItem(STATE_LOCAL_STORAGE_KEY);
        if (state) try {
            return JSON.parse(state);
        } catch (e) {
            return null;
        }
        return null;
    }
    _updateState(newState) {
        if (newState) localStorage.setItem(STATE_LOCAL_STORAGE_KEY, JSON.stringify(newState));
        else localStorage.removeItem(STATE_LOCAL_STORAGE_KEY);
    }
    updateControlsAttributes(configControls = this.pattern.configControls) {
        configControls.forEach((control)=>{
            if (control.attr) {
                const functionAttrs = Object.entries(control.attr).filter(([_, value])=>value instanceof Function);
                if (functionAttrs.length) {
                    const inputEl = this.controlElements[control.key].input;
                    if (inputEl) functionAttrs.forEach(([name, value])=>{
                        const newAttrValue = value(this.pattern);
                        if (newAttrValue != inputEl.getAttribute(name)) {
                            if (name === 'min' && inputEl.value < newAttrValue || name === 'max' && inputEl.value > newAttrValue) {
                                inputEl.value = newAttrValue;
                                this.updateInput({
                                    inputElement: inputEl
                                });
                            }
                            inputEl.setAttribute(name, newAttrValue);
                        }
                    });
                }
            }
        });
    }
    updateControlsVisibility(configControls = this.pattern.configControls) {
        configControls.forEach((control)=>{
            if (control.show) {
                const shouldShowControl = control.show(this.pattern.config, control);
                const controlEl = this.controlElements[control.key].control;
                if (controlEl) {
                    if (shouldShowControl) controlEl.removeAttribute('hidden');
                    else controlEl.setAttribute('hidden', 'hidden');
                }
            }
            if (control.isDisabled) {
                const shouldDisableControl = control.isDisabled(this.pattern.config);
                const inputEl = this.controlElements[control.key].input;
                if (inputEl) {
                    if (shouldDisableControl) inputEl.setAttribute('disabled', 'disabled');
                    else inputEl.removeAttribute('disabled');
                }
            }
            if (control.children) this.updateControlsVisibility(control.children);
        });
    }
    updateInputs(config) {
        Object.entries(config).forEach(([key, value])=>{
            const { input, value: valueEl } = this.controlElements[key];
            if (input) {
                if (input.type === 'checkbox') input.checked = value;
                else input.value = value;
                if (valueEl) valueEl.innerText = value;
            }
        });
    }
    renderControls(containerEl = elements.controls, _configControls) {
        const configControls = _configControls ?? this.pattern.configControls;
        containerEl.innerHTML = '';
        const controlsFragment = document.createDocumentFragment();
        configControls.forEach((control)=>{
            const controlId = `config_${control.key}`;
            const controlElements = this.controlElements[control.key] = {
                config: control
            };
            let controlEl;
            if (control.type === 'group') {
                controlEl = document.createElement('fieldset');
                controlEl.setAttribute('data-group', control.key);
                const groupTitleEl = document.createElement('legend');
                groupTitleEl.setAttribute('tabindex', '0');
                groupTitleEl.innerText = control.label;
                controlEl.appendChild(groupTitleEl);
                controlEl.className = 'control control_group';
                if (control.defaultValue === 'minimized') {
                    controlEl.classList.add('minimized');
                    this.state.groups[control.key] = false;
                }
                const childrenContainer = document.createElement('div');
                controlEl.appendChild(childrenContainer);
                this.renderControls(childrenContainer, control.children);
            } else {
                controlEl = document.createElement('div');
                controlEl.className = 'control';
                const label = document.createElement('label');
                label.innerHTML = control.label;
                label.setAttribute('for', controlId);
                const inputEl = controlElements.input = document.createElement(control.type === 'select' ? 'select' : 'input');
                const inputValue = this.pattern.config[control.key] ?? control.defaultValue;
                if (control.type === 'select') {
                    const selectOptions = document.createDocumentFragment();
                    control.options.forEach((_option)=>{
                        const { value, label } = typeof _option === 'string' ? {
                            value: _option,
                            label: _option
                        } : _option;
                        const optionEl = document.createElement('option');
                        optionEl.setAttribute('value', value);
                        optionEl.innerText = label;
                        selectOptions.appendChild(optionEl);
                    });
                    inputEl.appendChild(selectOptions);
                    inputEl.value = inputValue;
                    controlEl.appendChild(label);
                    controlEl.appendChild(inputEl);
                } else {
                    inputEl.setAttribute('type', control.type);
                    if (control.type === 'checkbox') {
                        inputEl.checked = inputValue;
                        controlEl.appendChild(inputEl);
                        controlEl.appendChild(label);
                    } else {
                        controlEl.appendChild(label);
                        controlEl.appendChild(inputEl);
                        setTimeout(()=>{
                            inputEl.value = inputValue;
                        });
                        const inputValueEl = controlElements.displayValue = document.createElement('span');
                        inputValueEl.id = `config_${control.key}_value`;
                        inputValueEl.innerText = control.displayValue ? control.displayValue(this.pattern.config, control) : inputValue;
                        inputValueEl.className = 'control_input_value';
                        controlEl.appendChild(inputValueEl);
                    }
                }
                if (control.attr) Object.entries(control.attr).forEach(([attr, value])=>{
                    const realValue = value instanceof Function ? value(this.pattern) : value;
                    inputEl.setAttribute(attr, realValue);
                });
                inputEl.id = controlId;
            }
            this.controlElements[control.key].control = controlEl;
            controlEl.id = `control_${control.key}`;
            controlsFragment.appendChild(controlEl);
        });
        containerEl.appendChild(controlsFragment);
        this.updateGroupsState();
        requestAnimationFrame(()=>this.updateControlsVisibility());
    }
    updateGroupsState() {
        const groups = elements.sidebarForm.querySelectorAll('[data-group]');
        groups.forEach((groupEl)=>{
            const groupId = groupEl.dataset.group;
            const groupState = this.state.groups[groupId];
            if (typeof groupState === 'boolean') {
                if (groupState) groupEl.classList.remove('minimized');
                else groupEl.classList.add('minimized');
            }
        });
    }
}
exports.default = EditorControls;
function getInputValue(type, inputElement) {
    switch(type){
        case 'range':
            return parseFloat(inputElement.value);
        case 'checkbox':
            return inputElement.checked;
        case 'number':
            return parseFloat(inputElement.value);
        default:
            return inputElement.value;
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"3oHF4":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
const sizeControls = document.querySelector('#size_controls');
const elements = {
    sizeSelect: sizeControls.querySelector('#size_select'),
    sizeCustom: sizeControls.querySelector('#size_custom'),
    width: sizeControls.querySelector('#size_custom_width'),
    height: sizeControls.querySelector('#size_custom_height'),
    orientationSelect: sizeControls.querySelector('#size_orientation_select')
};
function cmToPixels(cm, dpi = 300) {
    return Math.floor(cm / 2.54 * dpi);
}
const SCREEN_SIZE = [
    Math.floor(window.screen.width),
    Math.floor(window.screen.height)
];
const SIZES = [
    {
        id: 'fit',
        name: 'Fit to screen'
    },
    {
        id: 'A4',
        value: [
            20,
            28
        ].map((v)=>cmToPixels(v)),
        orientationSelect: true
    },
    {
        id: 'A3',
        value: [
            28,
            40
        ].map((v)=>cmToPixels(v)),
        orientationSelect: true
    },
    {
        id: 'screen',
        name: `Screen size (${SCREEN_SIZE.join('x')})`,
        value: SCREEN_SIZE
    },
    {
        id: 'custom',
        name: 'Custom...'
    }
];
class EditorSizeControls {
    element = document.querySelector('#size_controls');
    constructor({ getCurrentSize }){
        const sizeOptionsFragment = document.createDocumentFragment();
        SIZES.forEach((size)=>{
            const sizeListItem = document.createElement('option');
            sizeListItem.setAttribute('value', size.id);
            sizeListItem.innerText = size.name ?? size.id;
            sizeOptionsFragment.appendChild(sizeListItem);
        });
        elements.sizeSelect.appendChild(sizeOptionsFragment);
        this.selectedSize = SIZES[0];
        elements.sizeSelect.addEventListener('change', (e)=>{
            const selectedSizeId = e.target.value;
            const size = SIZES.find(({ id })=>id === selectedSizeId);
            this.selectedSize = size;
            if (size.id === 'custom') {
                elements.sizeCustom.removeAttribute('hidden');
                const [width, height] = getCurrentSize();
                elements.width.value = width;
                elements.height.value = height;
            } else {
                elements.sizeCustom.setAttribute('hidden', 'hidden');
                this._notifyOnChange(this.getValue());
            }
            if (size.orientationSelect) elements.orientationSelect.removeAttribute('hidden');
            else elements.orientationSelect.setAttribute('hidden', 'hidden');
        });
        elements.orientationSelect.addEventListener('change', (e)=>{
            this._notifyOnChange(this.getValue());
        });
        elements.sizeCustom.addEventListener('focusin', (e)=>{
            e.target.select();
        });
        elements.sizeCustom.addEventListener('input', ()=>{
            this._notifyOnChange([
                elements.width.value ? parseInt(elements.width.value) : null,
                elements.height.value ? parseInt(elements.height.value) : null
            ]);
        });
    }
    _notifyOnChange([width, height] = []) {
        this.element.dispatchEvent(new CustomEvent('sizechange', {
            detail: {
                width,
                height
            }
        }));
    }
    getValue() {
        if (this.selectedSize.id === 'custom') return [
            parseInt(elements.width.value, 10),
            parseInt(elements.height.value, 10)
        ];
        else {
            let value = this.selectedSize.value;
            if (this.selectedSize.orientationSelect && elements.orientationSelect.value === 'horizontal') value = Array.from(value).reverse();
            return value;
        }
    }
}
exports.default = EditorSizeControls;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"jp7mh":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Thumbnails", ()=>Thumbnails);
var _patternTypesJs = require("../pattern_types.js");
var _patternTypesJsDefault = parcelHelpers.interopDefault(_patternTypesJs);
var _canvasRendererJs = require("../renderers/CanvasRenderer.js");
var _canvasRendererJsDefault = parcelHelpers.interopDefault(_canvasRendererJs);
const THUMBNAIL_WIDTH_PX = '100px';
const MINIMIZED_CLASS = 'minimized';
class Thumbnails {
    elements = {
        root: document.querySelector('#pattern_select_panel'),
        thumbnails: document.querySelector('#pattern_select_thumbnails'),
        toggleBtn: document.querySelector('#pattern_select_btn'),
        dropdown: document.querySelector('#pattern_select_dropdown')
    };
    constructor(){
        this.elements.toggleBtn.addEventListener('click', ()=>this.toggle());
    }
    toggle() {
        if (this.elements.root.classList.contains(MINIMIZED_CLASS)) this.open();
        else if (this.pattern) this.close();
    }
    open() {
        if (this.elements.root.classList.contains(MINIMIZED_CLASS)) {
            this.elements.root.classList.remove(MINIMIZED_CLASS);
            if (!this.thumbnailsRendered) {
                this.createThumbnails();
                this.thumbnailsRendered = true;
            }
            this._onClickOutside = (e)=>{
                if (!e.target.closest('#pattern_select_panel')) this.toggle();
            };
            document.body.addEventListener('mousedown', this._onClickOutside);
        }
    }
    close() {
        if (!this.elements.root.classList.contains(MINIMIZED_CLASS)) {
            this.elements.root.classList.add(MINIMIZED_CLASS);
            document.body.removeEventListener('mousedown', this._onClickOutside);
            this._onClickOutside = null;
        }
    }
    setCurrentPattern(pattern) {
        this.pattern = pattern;
        this.elements.toggleBtn.innerText = pattern?.name ?? 'Choose a pattern';
    }
    createThumbnails() {
        const thumbnailsFragment = document.createDocumentFragment();
        const patterns = [];
        (0, _patternTypesJsDefault.default).forEach((PatternType)=>{
            const patternLink = document.createElement('a');
            const renderer = new (0, _canvasRendererJsDefault.default)(patternLink);
            patternLink.style.width = patternLink.style.height = THUMBNAIL_WIDTH_PX;
            const pattern = new PatternType(renderer);
            pattern.config = Object.assign({
                margin: 1,
                enableBackground: false,
                nailRadius: 0.5
            }, PatternType.thumbnailConfig);
            patterns.push(pattern);
            const li = document.createElement('li');
            thumbnailsFragment.appendChild(li);
            patternLink.href = `?pattern=${pattern.id}`;
            patternLink.setAttribute('data-pattern', pattern.id);
            patternLink.title = pattern.name;
            li.appendChild(patternLink);
        });
        this.elements.thumbnails.appendChild(thumbnailsFragment);
        patterns.forEach((pattern)=>pattern.draw());
        this.elements.thumbnails.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            const link = e.target.closest('[data-pattern]');
            if (!link) return false;
            this.elements.root.dispatchEvent(new CustomEvent('change', {
                detail: {
                    pattern: link.dataset.pattern
                }
            }));
            this.toggle();
        });
    }
    addOnChangeListener(listener) {
        this.elements.root.addEventListener('change', listener);
    }
    removeOnChangeListener(listener) {
        this.elements.root.removeEventListener('change', listener);
    }
}

},{"../pattern_types.js":"5FyJ3","../renderers/CanvasRenderer.js":"15b2W","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"15b2W":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _rendererJs = require("./Renderer.js");
var _rendererJsDefault = parcelHelpers.interopDefault(_rendererJs);
var _mathUtilsJs = require("../helpers/math_utils.js");
class CanvasRenderer extends (0, _rendererJsDefault.default) {
    constructor(parentElement){
        super(parentElement);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const bsr = this.ctx.webkitBackingStorePixelRatio || this.ctx.mozBackingStorePixelRatio || this.ctx.msBackingStorePixelRatio || this.ctx.oBackingStorePixelRatio || this.ctx.backingStorePixelRatio || 1;
        this.pixelRatio = dpr / bsr;
        this.ctx.globalCompositeOperation = 'source-over';
        parentElement.appendChild(this.canvas);
    }
    get element() {
        return this.canvas;
    }
    reset() {
        this.ctx.clearRect(0, 0, ...this.getSize());
        this.canvas.removeAttribute('width');
        this.canvas.removeAttribute('height');
        const [width, height] = this.getSize();
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
    }
    setColor(color) {
        this.ctx.strokeStyle = color;
    }
    setLineWidth(width) {
        this.ctx.lineWidth = width;
    }
    setBackground(color) {
        this.ctx.globalCompositeOperation = 'destination-over';
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, ...this.getSize());
        this.ctx.globalCompositeOperation = 'source-over';
    }
    getSize() {
        return [
            this.canvas.clientWidth * this.pixelRatio,
            this.canvas.clientHeight * this.pixelRatio
        ];
    }
    renderLines(startPosition, ...positions) {
        this.ctx.beginPath();
        this.ctx.moveTo(...startPosition);
        for (const position of positions)this.ctx.lineTo(...position);
        this.ctx.stroke();
    }
    renderNails(nails, { color, fontSize, radius, renderNumbers, margin = 0 }) {
        const centerX = this.canvas.width / 2;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${fontSize}px sans-serif`;
        const nailNumberOffset = radius + margin;
        nails.forEach(({ point: [x, y], number })=>{
            this.ctx.moveTo(x + radius, y);
            this.ctx.arc(x, y, radius, 0, (0, _mathUtilsJs.PI2));
            if (renderNumbers && number != null) {
                const isRightAlign = x < centerX;
                const numberPosition = [
                    isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
                    y
                ];
                this.ctx.textAlign = isRightAlign ? 'right' : 'left';
                this.ctx.fillText(String(number), ...numberPosition);
            }
        });
        this.ctx.fill();
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    toDataURL() {
        return this.canvas.toDataURL();
    }
}
exports.default = CanvasRenderer;

},{"./Renderer.js":"8LGOS","../helpers/math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"5NOwb":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "serializeConfig", ()=>serializeConfig);
parcelHelpers.export(exports, "deserializeConfig", ()=>deserializeConfig);
const MAX_FLOAT_DECIMALS = 6;
function serializeConfig(pattern) {
    const { defaultConfig, config } = pattern;
    const nonDefaultConfigValues = Object.entries(config).map(([key, value])=>{
        if (value === defaultConfig[key]) return null;
        if (typeof value === 'boolean') return `!${value ? 1 : 0}`;
        if (typeof value === 'number') return parseFloat(value.toFixed(MAX_FLOAT_DECIMALS));
        return value;
    });
    while(nonDefaultConfigValues[nonDefaultConfigValues.length - 1] === null)nonDefaultConfigValues.pop();
    if (!nonDefaultConfigValues.length) return '';
    const serializedConfigValues = nonDefaultConfigValues.join('_').replace(/\_{2,}/g, (match)=>'~' + match.length + '_');
    return serializedConfigValues;
}
const numberRegExp = /^\-?\d+(\.\d+)?$/;
const booleanRegExp = /^(?:!)([01])$/;
function deserializeConfig(pattern, serializedCofig) {
    const serializedConfigValues = serializedCofig.replace(/(?:~)(\d+)(?:_)/g, (_, commaCount)=>new Array(+commaCount).fill('_').join('')).split('_').map((v)=>{
        if (v === '') return null;
        if (numberRegExp.test(v)) return parseFloat(v);
        const booleanMatch = v.match(booleanRegExp);
        if (booleanMatch) return booleanMatch[1] === '1';
        return v;
    });
    const configKeys = Object.keys(pattern.defaultConfig);
    return serializedConfigValues.reduce((config, serializedValue, i)=>{
        if (serializedValue !== null) {
            const key = configKeys[i];
            return {
                ...config,
                [key]: serializedValue
            };
        }
        return config;
    }, {});
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"d51ZT":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "share", ()=>share);
parcelHelpers.export(exports, "isShareSupported", ()=>isShareSupported);
async function share(input) {
    try {
        navigator.share(await getShareData(input));
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
async function isShareSupported(input) {
    if (!navigator.share) return false;
    const shareData = await getShareData(input);
    return navigator.canShare(shareData);
}
async function getShareData({ renderer, pattern }) {
    const dataUrl = renderer.toDataURL();
    const blob = await (await fetch(dataUrl)).blob();
    const files = [
        new File([
            blob
        ], pattern.name + '.jpg', {
            type: blob.type,
            lastModified: new Date().getTime()
        })
    ];
    return {
        url: window.location.href,
        files,
        title: document.title,
        text: 'String Art Studio - ' + pattern.name
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"eaRyg":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initServiceWorker", ()=>initServiceWorker);
const swFilename = 'service-worker.js';
async function initServiceWorker() {
    if (!navigator.serviceWorker || document.location.hostname === '127.0.0.1') return;
    try {
        const registration = await navigator.serviceWorker.register(swFilename);
        registration.onupdatefound = ()=>{
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = ()=>{
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) console.log("New content is available and will be used when all tabs for this page are closed. See https://bit.ly/CRA-PWA.");
                    else console.log('Content is cached for offline use.');
                }
            };
        };
    } catch (error) {
        console.error('Error during service worker registration:', error);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"6LXVK":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _rendererJs = require("./Renderer.js");
var _rendererJsDefault = parcelHelpers.interopDefault(_rendererJs);
var _mathUtilsJs = require("../helpers/math_utils.js");
const SVG_NS = 'http://www.w3.org/2000/svg';
class SVGRenderer extends (0, _rendererJsDefault.default) {
    constructor(parentElement){
        super(parentElement);
        this.svg = document.createElementNS(SVG_NS, 'svg');
        this.svg.style.setProperty('display', 'block');
        this.backgroundGroup = document.createElementNS(SVG_NS, 'g');
        this.backgroundGroup.setAttribute('data-id', 'background');
        this.linesGroup = document.createElementNS(SVG_NS, 'g');
        this.linesGroup.setAttribute('data-id', 'lines');
        this.nailsGroup = document.createElementNS(SVG_NS, 'g');
        this.nailsGroup.setAttribute('data-id', 'nails');
        this.nailsCirclesGroup = document.createElementNS(SVG_NS, 'g');
        this.nailsCirclesGroup.setAttribute('data-id', 'nailsCircles');
        this.nailsTextGroup = document.createElementNS(SVG_NS, 'g');
        this.nailsTextGroup.setAttribute('data-id', 'nailsText');
        this.nailsGroup.appendChild(this.nailsCirclesGroup);
        this.nailsGroup.appendChild(this.nailsTextGroup);
        this.svg.appendChild(this.backgroundGroup);
        this.svg.appendChild(this.linesGroup);
        this.svg.appendChild(this.nailsGroup);
        this.svg.setAttribute('xmlns', SVG_NS);
        parentElement.appendChild(this.svg);
    }
    get element() {
        return this.svg;
    }
    reset() {
        this.linesGroup.innerHTML = '';
        this.nailsCirclesGroup.innerHTML = '';
        this.nailsTextGroup.innerHTML = '';
        const [width, height] = this.getSize().map(Math.trunc);
        this.svg.setAttributeNS(SVG_NS, 'viewBox', `0 0 ${width} ${height}`);
        this.svg.setAttributeNS(SVG_NS, 'width', width);
        this.svg.setAttributeNS(SVG_NS, 'height', height);
        this.svg.style.width = width + 'px';
        this.svg.style.height = height + 'px';
        this.currentColor = null;
        this.lineWidth = null;
    }
    setColor(color) {
        if (color !== this.currentColor) {
            this.currentLineGroup = document.createElementNS(SVG_NS, 'g');
            this.currentLineGroup.setAttribute('stroke', color);
            this.currentLineGroup.setAttribute('stroke-width', this.lineWidth);
            this.linesGroup.appendChild(this.currentLineGroup);
            this.currentColor = color;
        }
    }
    setLineWidth(width) {
        this.lineWidth = width ?? '1';
        this.linesGroup.setAttributeNS(SVG_NS, 'stroke-width', width ?? '1');
        this.linesGroup.childNodes.forEach((group)=>group.setAttributeNS(SVG_NS, 'stroke-width', width ?? '1'));
    }
    setBackground(color) {
        if (color) {
            if (!this.background) {
                this.background = document.createElementNS(SVG_NS, 'rect');
                this.background.setAttribute('width', '100%');
                this.background.setAttribute('height', '100%');
                this.backgroundGroup.appendChild(this.background);
            }
            this.background.setAttribute('fill', color);
        } else {
            this.background = null;
            this.backgroundGroup.innerHTML = '';
        }
    }
    setSize(size) {
        super.setSize(size);
        const [width, height] = size.map(Math.trunc);
        this.svg.setAttributeNS(SVG_NS, 'viewBox', `0 0 ${width} ${height}`);
        this.svg.setAttributeNS(SVG_NS, 'width', width);
        this.svg.setAttributeNS(SVG_NS, 'height', height);
    }
    renderLines(startPosition, ...positions) {
        let previousPoint = startPosition;
        const fragment = document.createDocumentFragment();
        for (const position of positions){
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', Math.trunc(previousPoint[0]));
            line.setAttribute('y1', Math.trunc(previousPoint[1]));
            line.setAttribute('x2', Math.trunc(position[0]));
            line.setAttribute('y2', Math.trunc(position[1]));
            previousPoint = position;
            fragment.appendChild(line);
        }
        this.currentLineGroup.appendChild(fragment);
    }
    renderNails(nails, { color, fontSize, radius, renderNumbers, margin = 0 }) {
        const centerX = this.getSize()[0] / 2;
        this.nailsCirclesGroup.innerHTML = this.nailsTextGroup.innerHTML = '';
        const circlesFragment = document.createDocumentFragment();
        const textFragment = document.createDocumentFragment();
        this.nailsGroup.setAttribute('fill', color);
        const nailNumberOffset = radius + margin;
        this.nailsTextGroup.style.fontSize = fontSize;
        nails.forEach(({ point: [x, y], number })=>{
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', radius);
            circlesFragment.appendChild(circle);
            if (renderNumbers && number != null) {
                const isRightAlign = x < centerX;
                const numberPosition = [
                    isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
                    y
                ];
                const textEl = document.createElementNS(SVG_NS, 'text');
                textEl.innerHTML = String(number);
                textEl.setAttribute('x', numberPosition[0]);
                textEl.setAttribute('y', numberPosition[1]);
                if (isRightAlign) textEl.setAttribute('text-anchor', 'end');
                textFragment.appendChild(textEl);
            }
        });
        this.nailsCirclesGroup.appendChild(circlesFragment);
        this.nailsTextGroup.appendChild(textFragment);
    }
    clear() {
        this.linesGroup.innerHTML = '';
        this.nailsGroup.innerHTML = '';
    }
    toDataURL() {
        return '';
    }
}
exports.default = SVGRenderer;

},{"./Renderer.js":"8LGOS","../helpers/math_utils.js":"iaiaj","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"1ser6":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "downloadPatternAsSVG", ()=>downloadPatternAsSVG);
var _svgrendererJs = require("../renderers/SVGRenderer.js");
var _svgrendererJsDefault = parcelHelpers.interopDefault(_svgrendererJs);
var _downloadJs = require("./Download.js");
function downloadPatternAsSVG(pattern, size) {
    const parentEl = document.createElement('article');
    parentEl.style.width = size[0] + 'px';
    parentEl.style.height = size[1] + 'px';
    document.body.appendChild(parentEl);
    const svgRenderer = new (0, _svgrendererJsDefault.default)(parentEl);
    const PatternConstructor = pattern.constructor;
    const svgPattern = new PatternConstructor(svgRenderer);
    svgPattern.setConfig(pattern.config);
    svgPattern.draw();
    var svgData = svgPattern.renderer.svg.outerHTML;
    var svgBlob = new Blob([
        svgData
    ], {
        type: 'image/svg+xml;charset=utf-8'
    });
    var svgUrl = URL.createObjectURL(svgBlob);
    (0, _downloadJs.downloadFile)(svgUrl, pattern.name + '.svg');
    document.body.removeChild(parentEl);
}

},{"../renderers/SVGRenderer.js":"6LXVK","./Download.js":"9qPiA","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"9qPiA":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "downloadFile", ()=>downloadFile);
function downloadFile(dataUrl, fileName) {
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["huHYX","3Aj1C"], "3Aj1C", "parcelRequiref61d", {})

//# sourceMappingURL=string_art.4841ef46.js.map
