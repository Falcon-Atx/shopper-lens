'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/search.html'), 'utf8');

function createDOM(html = fixture, { content = false, url = 'https://www.amazon.com/s?k=demo' } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  // jsdom has no layout engine. Give connected elements ordinary nonzero boxes;
  // parser visibility checks must still honor CSS, hidden and aria attributes.
  const rect = { x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 100, width: 200, height: 100 };
  dom.window.Element.prototype.getClientRects = function () { return this.isConnected ? [rect] : []; };
  dom.window.Element.prototype.getBoundingClientRect = function () { return rect; };
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  dom.window.eval(fs.readFileSync(path.join(root, 'extension/parser.js'), 'utf8'));
  if (content) dom.window.eval(fs.readFileSync(path.join(root, 'extension/content.js'), 'utf8'));
  return { dom, window: dom.window, document: dom.window.document, parser: dom.window.ShopperLensParser, errors };
}

async function until(predicate, message = 'Expected the UI to update') {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error(message);
}

function setSelect(window, root, id, value) {
  const select = root.querySelector(`select#${id}`);
  if (!select) throw new Error(`Missing ${id} control`);
  select.value = value;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function button(root, text) {
  const match = [...root.querySelectorAll('button')].find(element => text.test(element.textContent.trim()));
  if (!match) throw new Error(`Missing button matching ${text}`);
  return match;
}

function checkbox(document, id) {
  return document.getElementById(id)?.querySelector('[data-shopper-lens="card"]')?.shadowRoot?.querySelector('input[type="checkbox"]');
}

module.exports = { createDOM, until, setSelect, button, checkbox };
