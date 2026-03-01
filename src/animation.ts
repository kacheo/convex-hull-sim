import type { ConvexHullAlgo } from './algorithms/ConvexHullAlgo';

export class AnimationController {
  private algo: ConvexHullAlgo | null = null;
  private running = false;
  private delay = 5; // ms between steps
  private lastStepTime = 0;
  private rafId = 0;
  private onStep: (() => void) | null = null;

  setOnStep(cb: () => void): void {
    this.onStep = cb;
  }

  start(algo: ConvexHullAlgo): void {
    this.algo = algo;
    this.running = true;
    this.lastStepTime = 0;
    this.loop(0);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  resume(): void {
    if (!this.algo) return;
    this.running = true;
    this.lastStepTime = 0;
    this.loop(0);
  }

  reset(): void {
    this.stop();
    this.algo = null;
  }

  isRunning(): boolean {
    return this.running;
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }

  getAlgo(): ConvexHullAlgo | null {
    return this.algo;
  }

  private loop(timestamp: number): void {
    if (!this.running || !this.algo) return;

    if (this.algo.isDone()) {
      this.running = false;
      this.onStep?.();
      return;
    }

    if (timestamp - this.lastStepTime >= this.delay) {
      this.algo.step();
      this.lastStepTime = timestamp;
      this.onStep?.();
    }

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }
}
