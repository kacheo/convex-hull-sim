import type { Point, Line } from './types';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onClickCallback: ((x: number, y: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  getHeight(): number {
    return this.canvas.height;
  }

  onClick(cb: (x: number, y: number) => void): void {
    this.onClickCallback = cb;
  }

  private handleClick(e: MouseEvent): void {
    if (!this.onClickCallback) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.onClickCallback(x, y);
  }

  clear(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPoints(points: Point[]): void {
    this.ctx.fillStyle = '#fff';
    for (const p of points) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawHull(hullPoints: Point[]): void {
    if (hullPoints.length < 2) return;
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(hullPoints[0].x, hullPoints[0].y);
    for (let i = 1; i < hullPoints.length; i++) {
      this.ctx.lineTo(hullPoints[i].x, hullPoints[i].y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.08)';
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawStepLine(line: Line): void {
    this.ctx.strokeStyle = '#ff00ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(line.p1.x, line.p1.y);
    this.ctx.lineTo(line.p2.x, line.p2.y);
    this.ctx.stroke();
  }

  drawStepPoints(points: Point[]): void {
    if (points.length === 0) return;

    // Draw lines between step points
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    if (points.length >= 2) {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
      this.ctx.stroke();
    }

    // Draw circles at step points
    for (const p of points) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  render(
    points: Point[],
    hull: Point[],
    stepLine: Line | null,
    stepPoints: Point[],
    done: boolean = false
  ): void {
    this.clear();
    this.drawPoints(points);
    this.drawHull(hull);
    if (!done) {
      if (stepLine) this.drawStepLine(stepLine);
      this.drawStepPoints(stepPoints);
    }
  }
}
