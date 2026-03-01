# Convex Hull Simulator

An interactive web app for visualizing convex hull algorithms step by step. Built with TypeScript and HTML5 Canvas.

## Algorithms

- **Jarvis March** — Gift wrapping via orientation checks
- **Graham Scan** — Polar angle sort with stack-based turn evaluation
- **Monotone Chain** — X-sorted upper/lower hull merge
- **Sweep Hull** — Vertical sweep line with tangent finding
- **Brute Force** — Tests all point pairs for hull edges
- **Random Incremental** — Shuffled incremental insertion with tangent updates

## Usage

- Click the canvas to add points
- Click **Random Points** to generate 50 random points
- Select an algorithm from the dropdown and click **Compute**
- Use the speed slider to control animation speed (0–500ms between steps)
- **Run/Stop** pauses and resumes the animation
- **Clear** resets everything

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static output is written to `dist/`.

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included GitHub Actions workflow.
