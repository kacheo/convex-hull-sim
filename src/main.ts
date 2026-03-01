import './style.css';
import type { Point } from './types';
import { CanvasRenderer } from './canvas';
import { AnimationController } from './animation';
import type { ConvexHullAlgo } from './algorithms/ConvexHullAlgo';
import { JarvisMarch } from './algorithms/JarvisMarch';
import { GrahamScan } from './algorithms/GrahamScan';
import { MonotoneChain } from './algorithms/MonotoneChain';
import { SweepHull } from './algorithms/SweepHull';
import { BruteForce } from './algorithms/BruteForce';
import { RandomIncremental } from './algorithms/RandomIncremental';

const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const algoSelect = document.getElementById('algo-select') as HTMLSelectElement;
const btnCompute = document.getElementById('btn-compute') as HTMLButtonElement;
const btnRandom = document.getElementById('btn-random') as HTMLButtonElement;
const btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
const btnToggle = document.getElementById('btn-toggle') as HTMLButtonElement;
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
const stepCounter = document.getElementById('step-counter') as HTMLSpanElement;
const stepDescription = document.getElementById('step-description') as HTMLSpanElement;

const renderer = new CanvasRenderer(canvasEl);
const animation = new AnimationController();
let points: Point[] = [];

function render(): void {
  const algo = animation.getAlgo();
  if (algo) {
    renderer.render(
      points,
      algo.getConvexHullList(),
      algo.getCurrentStepLine(),
      algo.getCurrentStepPoints()
    );
    stepCounter.textContent = `Step: ${algo.getCurrentStep()}`;
    stepDescription.textContent = algo.getDescription();
  } else {
    renderer.render(points, [], null, []);
    stepCounter.textContent = 'Step: 0';
  }
}

function createAlgo(): ConvexHullAlgo | null {
  if (points.length < 3) {
    stepDescription.textContent = 'Need at least 3 points.';
    return null;
  }

  const value = algoSelect.value;
  switch (value) {
    case 'jarvis':
      return new JarvisMarch(points);
    case 'graham':
      return new GrahamScan(points);
    case 'monotone':
      return new MonotoneChain(points);
    case 'sweep':
      return new SweepHull(points, renderer.getHeight());
    case 'brute':
      return new BruteForce(points);
    case 'random':
      return new RandomIncremental(points);
    default:
      return new JarvisMarch(points);
  }
}

// Canvas click → add point
renderer.onClick((x, y) => {
  if (animation.isRunning()) return;
  points.push({ x, y });
  animation.reset();
  render();
  stepDescription.textContent = `${points.length} points. Click to add more or press Compute.`;
});

// Compute button
btnCompute.addEventListener('click', () => {
  animation.reset();
  const algo = createAlgo();
  if (!algo) return;
  btnToggle.textContent = 'Stop';
  animation.setOnStep(render);
  animation.start(algo);
});

// Random points
btnRandom.addEventListener('click', () => {
  animation.reset();
  const w = canvasEl.width - 40;
  const h = canvasEl.height - 40;
  for (let i = 0; i < 50; i++) {
    points.push({
      x: Math.floor(Math.random() * w) + 20,
      y: Math.floor(Math.random() * h) + 20,
    });
  }
  render();
  stepDescription.textContent = `${points.length} points. Click to add more or press Compute.`;
});

// Clear
btnClear.addEventListener('click', () => {
  animation.reset();
  points = [];
  btnToggle.textContent = 'Run';
  render();
  stepDescription.textContent = 'Click on canvas to add points.';
});

// Run/Stop toggle
btnToggle.addEventListener('click', () => {
  if (animation.isRunning()) {
    animation.stop();
    btnToggle.textContent = 'Run';
  } else {
    if (animation.getAlgo()) {
      animation.resume();
      btnToggle.textContent = 'Stop';
    } else {
      // Start fresh
      const algo = createAlgo();
      if (!algo) return;
      animation.setOnStep(render);
      animation.start(algo);
      btnToggle.textContent = 'Stop';
    }
  }
});

// Speed slider
speedSlider.addEventListener('input', () => {
  const val = parseInt(speedSlider.value, 10);
  animation.setDelay(val);
  speedValue.textContent = `${val}ms`;
});

// Initial render
render();
