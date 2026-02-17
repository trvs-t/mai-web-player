class MockContainer {
  children: any[] = [];
  x = 0;
  y = 0;
  scale = { x: 1, y: 1 };
  rotation = 0;
  alpha = 1;
  visible = true;
  addChild = (child: any) => this.children.push(child);
  removeChild = (child: any) => {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
  };
  removeChildren = () => {
    this.children = [];
  };
}

class MockSprite {
  x = 0;
  y = 0;
  scale = { x: 1, y: 1 };
  rotation = 0;
  alpha = 1;
  visible = true;
  anchor = { x: 0, y: 0 };
  static from = () => new MockSprite();
}

class MockGraphics {
  x = 0;
  y = 0;
  scale = { x: 1, y: 1 };
  rotation = 0;
  alpha = 1;
  visible = true;
  beginFill() {
    return this;
  }
  endFill() {
    return this;
  }
  drawCircle() {
    return this;
  }
  drawRect() {
    return this;
  }
  drawRoundedRect() {
    return this;
  }
  drawEllipse() {
    return this;
  }
  drawPolygon() {
    return this;
  }
  lineStyle() {
    return this;
  }
  moveTo() {
    return this;
  }
  lineTo() {
    return this;
  }
  clear() {
    return this;
  }
  arc() {
    return this;
  }
  quadraticCurveTo() {
    return this;
  }
  bezierCurveTo() {
    return this;
  }
  closePath() {
    return this;
  }
}

class MockText {
  text = "";
  style = {};
  x = 0;
  y = 0;
  scale = { x: 1, y: 1 };
  rotation = 0;
  alpha = 1;
  visible = true;
  anchor = { x: 0, y: 0 };
  constructor(text: string, style?: any) {
    this.text = text;
    if (style) this.style = style;
  }
}

class MockTexture {
  static WHITE = new MockTexture();
  static from = () => new MockTexture();
}

class MockBaseTexture {
  static from = () => new MockBaseTexture();
}

class MockRectangle {
  constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
}

class MockCircle {
  constructor(public x = 0, public y = 0, public radius = 0) {}
}

class MockPoint {
  constructor(public x = 0, public y = 0) {}
  set = (x: number, y: number) => {
    this.x = x;
    this.y = y;
  };
  copyFrom = (p: any) => {
    this.x = p.x;
    this.y = p.y;
  };
}

class MockObservablePoint {
  constructor(public cb: () => void, public scope: any, public _x = 0, public _y = 0) {}
  get x() {
    return this._x;
  }
  set x(value: number) {
    this._x = value;
    this.cb.call(this.scope);
  }
  get y() {
    return this._y;
  }
  set y(value: number) {
    this._y = value;
    this.cb.call(this.scope);
  }
  set = (x: number, y?: number) => {
    this._x = x;
    this._y = y ?? x;
    this.cb.call(this.scope);
  };
}

class MockMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  tx = 0;
  ty = 0;
  identity = () => this;
  scale = () => this;
  rotate = () => this;
  translate = () => this;
  invert = () => this;
}

class MockTransform {
  position = new MockObservablePoint(() => {}, this, 0, 0);
  scale = new MockObservablePoint(() => {}, this, 1, 1);
  pivot = new MockObservablePoint(() => {}, this, 0, 0);
  skew = new MockObservablePoint(() => {}, this, 0, 0);
  rotation = 0;
}

class MockApplication {
  stage = new MockContainer();
  renderer = { render: () => {} };
  view = {};
  ticker = { add: () => {}, remove: () => {} };
  init = () => Promise.resolve();
}

class MockEventEmitter {
  events: Record<string, any[]> = {};
  on = (event: string, fn: any) => {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(fn);
  };
  off = (event: string, fn: any) => {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(fn);
    if (index >= 0) this.events[event].splice(index, 1);
  };
  emit = (event: string, ...args: any[]) => {
    if (!this.events[event]) return;
    this.events[event].forEach((fn) => fn(...args));
  };
  once = (event: string, fn: any) => {
    const wrapped = (...args: any[]) => {
      fn(...args);
      this.off(event, wrapped);
    };
    this.on(event, wrapped);
  };
}

const MockBLEND_MODES = {
  NORMAL: 0,
  ADD: 1,
  MULTIPLY: 2,
  SCREEN: 3,
};

const MockTicker = {
  shared: {
    add: () => {},
    remove: () => {},
    start: () => {},
    stop: () => {},
    update: () => {},
  },
};

const MockAssets = {
  load: () => Promise.resolve({}),
  add: () => {},
  backgroundLoad: () => Promise.resolve(),
  init: () => Promise.resolve(),
};

const MockUtils = {
  EventEmitter: MockEventEmitter,
  uid: () => Math.random().toString(36).substr(2, 9),
  rgb2hex: (rgb: number[]) => (rgb[0] << 16) | (rgb[1] << 8) | rgb[2],
  hex2rgb: (hex: number) => [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff],
};

const mockPixi = {
  Application: MockApplication,
  Container: MockContainer,
  Sprite: MockSprite,
  Graphics: MockGraphics,
  Text: MockText,
  Texture: MockTexture,
  BaseTexture: MockBaseTexture,
  Rectangle: MockRectangle,
  Circle: MockCircle,
  Point: MockPoint,
  ObservablePoint: MockObservablePoint,
  Matrix: MockMatrix,
  Transform: MockTransform,
  BLEND_MODES: MockBLEND_MODES,
  Ticker: MockTicker,
  Assets: MockAssets,
  utils: MockUtils,
};

const mockPixiReact = {
  Stage: function Stage() {
    return null;
  },
  Container: function Container() {
    return null;
  },
  Sprite: function Sprite() {
    return null;
  },
  Graphics: function Graphics() {
    return null;
  },
  Text: function Text() {
    return null;
  },
  useApp: () => ({
    stage: new MockContainer(),
    renderer: {},
    view: {},
    ticker: MockTicker.shared,
  }),
  useTick: () => {},
  usePixiApp: () => ({
    stage: new MockContainer(),
    renderer: {},
  }),
  PixiComponent: (name: string, component: any) => component,
  withFilters: (Component: any, filters: any) => Component,
  withPixiApp: (Component: any) => Component,
};

const Module = require("module");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options?: any) {
  if (request === "pixi.js") {
    return "pixi.js";
  }
  if (request === "@pixi/react") {
    return "@pixi/react";
  }
  if (request.startsWith("@/")) {
    const relativePath = request.slice(2);
    return originalResolveFilename.call(this, relativePath, parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const originalLoad = Module._load;
Module._load = function (request: string, parent: any, isMain: boolean) {
  if (request === "pixi.js") {
    return mockPixi;
  }
  if (request === "@pixi/react") {
    return mockPixiReact;
  }
  return originalLoad.call(this, request, parent, isMain);
};

console.log("✓ Test setup complete - PixiJS mocked and path aliases configured");
