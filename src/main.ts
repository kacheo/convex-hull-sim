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
import { Quickhull } from './algorithms/Quickhull';
import { DivideAndConquer } from './algorithms/DivideAndConquer';
import { ChansAlgorithm } from './algorithms/ChansAlgorithm';
import { KirkpatrickSeidel } from './algorithms/KirkpatrickSeidel';
import { IncrementalInsertion } from './algorithms/IncrementalInsertion';

/* ── Algorithm Metadata ────────────────────────────── */
interface AlgorithmMeta {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  wikipediaUrl: string;
}

const ALGO_META: Record<string, AlgorithmMeta> = {
  jarvis: {
    name: 'Jarvis March',
    timeComplexity: 'O(nh)',
    spaceComplexity: 'O(n)',
    description: 'Gift-wrapping algorithm that iteratively selects the most counter-clockwise point.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Gift_wrapping_algorithm',
  },
  graham: {
    name: 'Graham Scan',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Sorts points by polar angle, then processes them with a stack to build the hull.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Graham_scan',
  },
  monotone: {
    name: 'Monotone Chain',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: "Andrew's algorithm that builds upper and lower hulls separately by sorting on x-coordinate.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Convex_hull_algorithms',
  },
  sweep: {
    name: 'Sweep Hull',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Sweep-line approach that incrementally adds points sorted by one coordinate.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Convex_hull_algorithms',
  },
  brute: {
    name: 'Brute Force',
    timeComplexity: 'O(n\u00B3)',
    spaceComplexity: 'O(n)',
    description: 'Tests every triplet of points, keeping edges where all other points lie on one side.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Convex_hull_algorithms',
  },
  random: {
    name: 'Random Incremental',
    timeComplexity: 'O(n log n) expected',
    spaceComplexity: 'O(n)',
    description: 'Inserts points in random order and maintains the hull incrementally.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Convex_hull_algorithms',
  },
  quickhull: {
    name: 'Quickhull',
    timeComplexity: 'O(n log n) avg',
    spaceComplexity: 'O(n)',
    description: 'Divide-and-conquer approach inspired by quicksort, recursively splitting by farthest point.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Quickhull',
  },
  divconq: {
    name: 'Divide & Conquer',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Splits points in half, solves recursively, then merges sub-hulls via upper/lower tangents.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Convex_hull_algorithms',
  },
  chans: {
    name: "Chan's Algorithm",
    timeComplexity: 'O(n log h)',
    spaceComplexity: 'O(n)',
    description: 'Output-sensitive algorithm combining Graham scan on groups with Jarvis-style wrapping.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Chan%27s_algorithm',
  },
  kirkpatrick: {
    name: 'Kirkpatrick-Seidel',
    timeComplexity: 'O(n log h)',
    spaceComplexity: 'O(n)',
    description: 'Output-sensitive "ultimate" algorithm using marriage-before-conquest technique.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Kirkpatrick%E2%80%93Seidel_algorithm',
  },
  incremental: {
    name: 'Incremental Insertion',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Adds points one at a time, updating the hull by finding and replacing visible edges.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Convex_hull_algorithms',
  },
};

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
      algo.getCurrentStepPoints(),
      algo.isDone()
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
    case 'quickhull':
      return new Quickhull(points);
    case 'divconq':
      return new DivideAndConquer(points);
    case 'chans':
      return new ChansAlgorithm(points);
    case 'kirkpatrick':
      return new KirkpatrickSeidel(points);
    case 'incremental':
      return new IncrementalInsertion(points);
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

// ── Algorithm Info Tooltip ──────────────────────────
const btnAlgoInfo = document.getElementById('btn-algo-info') as HTMLButtonElement;
const algoTooltip = document.getElementById('algo-info-tooltip') as HTMLDivElement;
const tooltipName = algoTooltip.querySelector('.algo-tooltip-name') as HTMLDivElement;
const tooltipComplexity = algoTooltip.querySelector('.algo-tooltip-complexity') as HTMLDivElement;
const tooltipDesc = algoTooltip.querySelector('.algo-tooltip-desc') as HTMLDivElement;
const tooltipLink = algoTooltip.querySelector('.algo-tooltip-link') as HTMLAnchorElement;

function updateTooltipContent(): void {
  const meta = ALGO_META[algoSelect.value];
  if (!meta) return;
  tooltipName.textContent = meta.name;
  tooltipComplexity.textContent = `Time: ${meta.timeComplexity}  ·  Space: ${meta.spaceComplexity}`;
  tooltipDesc.textContent = meta.description;
  tooltipLink.href = meta.wikipediaUrl;
}

btnAlgoInfo.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = algoTooltip.hidden;
  algoTooltip.hidden = !isHidden;
  if (isHidden) updateTooltipContent();
});

algoSelect.addEventListener('change', () => {
  if (!algoTooltip.hidden) updateTooltipContent();
});

document.addEventListener('click', (e) => {
  if (!algoTooltip.hidden && !algoTooltip.contains(e.target as Node) && e.target !== btnAlgoInfo) {
    algoTooltip.hidden = true;
  }
});

// Initial render
render();
