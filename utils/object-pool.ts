import { Graphics, Sprite } from "pixi.js";

type Poolable = Graphics | Sprite;

interface PoolConfig<T extends Poolable> {
  initialSize: number;
  maxSize: number;
  create: () => T;
  reset: (item: T) => void;
}

class ObjectPool<T extends Poolable> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private config: PoolConfig<T>;
  private totalCreated = 0;

  constructor(config: PoolConfig<T>) {
    this.config = config;
    this.prewarm();
  }

  private prewarm(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      const item = this.config.create();
      this.available.push(item);
      this.totalCreated++;
    }
  }

  acquire(): T {
    let item: T | undefined;

    if (this.available.length > 0) {
      item = this.available.pop();
    } else if (this.totalCreated < this.config.maxSize) {
      item = this.config.create();
      this.totalCreated++;
    } else {
      const firstInUse = this.inUse.values().next().value;
      if (firstInUse) {
        this.inUse.delete(firstInUse);
        this.config.reset(firstInUse);
        item = firstInUse;
      }
    }

    if (!item) {
      item = this.config.create();
      this.totalCreated++;
    }

    this.inUse.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.inUse.has(item)) {
      return;
    }

    this.inUse.delete(item);
    this.config.reset(item);
    item.visible = true;

    if (this.available.length < this.config.maxSize) {
      this.available.push(item);
    } else {
      this.destroy(item);
    }
  }

  releaseAll(): void {
    for (const item of this.inUse) {
      this.config.reset(item);
      item.visible = false;
      this.available.push(item);
    }
    this.inUse.clear();
  }

  private destroy(item: T): void {
    if (item instanceof Graphics) {
      item.clear();
      item.destroy({ children: true });
    } else if (item instanceof Sprite) {
      item.destroy({ children: true, texture: false, baseTexture: false });
    }
  }

  getStats(): { available: number; inUse: number; totalCreated: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      totalCreated: this.totalCreated,
    };
  }

  clear(): void {
    for (const item of this.available) {
      this.destroy(item);
    }
    for (const item of this.inUse) {
      this.destroy(item);
    }
    this.available = [];
    this.inUse.clear();
    this.totalCreated = 0;
  }
}

const graphicsPools = new Map<string, ObjectPool<Graphics>>();

export function getGraphicsPool(
  name: string,
  config?: Partial<PoolConfig<Graphics>>,
): ObjectPool<Graphics> {
  if (!graphicsPools.has(name)) {
    graphicsPools.set(
      name,
      new ObjectPool<Graphics>({
        initialSize: 20,
        maxSize: 100,
        create: () => new Graphics(),
        reset: (g) => {
          g.clear();
          g.position.set(0, 0);
          g.scale.set(1);
          g.rotation = 0;
          g.alpha = 1;
          g.visible = true;
        },
        ...config,
      }),
    );
  }
  return graphicsPools.get(name)!;
}

export function acquireGraphics(name: string): Graphics {
  return getGraphicsPool(name).acquire();
}

export function releaseGraphics(name: string, graphics: Graphics): void {
  getGraphicsPool(name).release(graphics);
}

export function getPoolStats(
  name: string,
): { available: number; inUse: number; totalCreated: number } | null {
  const pool = graphicsPools.get(name);
  return pool ? pool.getStats() : null;
}

export function clearAllPools(): void {
  for (const pool of graphicsPools.values()) {
    pool.clear();
  }
  graphicsPools.clear();
}

export function releaseAllFromPool(name: string): void {
  const pool = graphicsPools.get(name);
  if (pool) {
    pool.releaseAll();
  }
}
