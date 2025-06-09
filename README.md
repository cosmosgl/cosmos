
<p align="center" style="color: #444">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://assets.cosmograph.app/cosmos-dark-theme.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://assets.cosmograph.app/cosmos-light-theme.svg">
    <img align="center" width="225px" alt="cosmos.gl logo" src="https://assets.cosmograph.app/cosmos-light-theme.svg">
  </picture>
</p>
<p align="center" style="font-size: 1.2rem;">GPU-accelerated Force Graph</p>

**cosmos.gl** is a high-performance WebGL Force Graph algorithm and rendering engine. All the computations and drawing occur on the GPU in fragment and vertex shaders, avoiding expensive memory operations. It enables the real-time simulation of network graphs consisting of hundreds of thousands of points and links on modern hardware.

This engine powers 🪐 [Cosmograph](https://cosmograph.app) — a toolset for exploring complex networks and AI embeddings.

<video src="https://user-images.githubusercontent.com/755708/173392407-9b05cbb6-d39e-4c2c-ab41-50900cfda823.mp4" autoplay controls alt="Demo of cosmos.gl GPU-accelerated Force Graph">
</video>

[📺 Comparison with other libraries](https://www.youtube.com/watch?v=HWk78hP8aEE)

[🎮 Check out our storybook for examples](https://cosmosgl.github.io/graph/)

---

### Quick Start

Install the package:

```bash
npm install @cosmos.gl/graph
```

Get the data, [configure](https://cosmosgl.github.io/graph/?path=/docs/configuration--docs) the graph and run the simulation:

```javascript
import { Graph } from '@cosmos.gl/graph'

const div = document.querySelector('div')
const config = {
  spaceSize: 4096,
  simulationFriction: 0.1, // keeps the graph inert
  simulationGravity: 0, // disables the gravity force
  simulationRepulsion: 0.5, // increases repulsion between points
  curvedLinks: true, // curved links
  fitViewOnInit: true, // fit the view to the graph after initialization
  fitViewDelay: 1000, // wait 1 second before fitting the view
  fitViewPadding: 0.3, // centers the graph with a padding of ~30% of screen
  rescalePositions: false, // rescale positions, useful when coordinates are too small
  enableDrag: true, // enable dragging points
  onClick: (pointIndex) => { console.log('Clicked point index: ', pointIndex) },
  /* ... */
}

const graph = new Graph(div, config)

// Points: [x1, y1, x2, y2, x3, y3]
const pointPositions = new Float32Array([
  0.0, 0.0,    // Point 1 at (0,0)
  1.0, 0.0,    // Point 2 at (1,0)
  0.5, 1.0,    // Point 3 at (0.5,1)
]);

graph.setPointPositions(pointPositions)

// Links: [sourceIndex1, targetIndex1, sourceIndex2, targetIndex2]
const links = new Float32Array([
  0, 1,    // Link from point 0 to point 1
  1, 2,    // Link from point 1 to point 2
  2, 0,    // Link from point 2 to point 0
]);

graph.setLinks(links)

graph.render()
```

---

### What's New in v2.0?

cosmos.gl v2.0 introduces significant improvements in performance and data handling:

- Enhanced data structures with WebGL-compatible formats.
- Methods like `setPointPositions` and `setLinks` replace `setData` for improved efficiency.
- Direct control over point and link attributes via Float32Array (e.g., colors, sizes, widths).
- Updated event handling based on indices instead of objects.
- New Point Clustering force (`setPointClusters`, `setClusterPositions` and `setPointClusterStrength`).
- Ability to drag points.

Check the [Migration Guide](./cosmos-2-0-migration-notes.md) for details.

---

### Examples

- [Basic Set-Up](https://cosmosgl.github.io/graph/?path=/story/examples-beginners--basic-set-up)

---

### Showcase (via [cosmograph.app](https://cosmograph.app))

- [Silk Road Case: Bitcoin Transactions](https://cosmograph.app/run/?data=https://cosmograph.app/data/184R7cFG-4lv.csv) ([📄 Read more](https://medium.com/@cosmograph.app/visualizing-darknet-6846dec7f1d7))
- [ABACUS Shell](https://cosmograph.app/run/?data=https://cosmograph.app/data/ABACUS_shell_hd.csv) ([source](http://sparse.tamu.edu/Puri/ABACUS_shell_hd))
- [The MathWorks, Inc: symmetric positive definite matrix](https://cosmograph.app/run/?data=https://cosmograph.app/data/Kuu.csv) ([source](https://sparse.tamu.edu/MathWorks/Kuu))

---

### Known Issues

- ~~Starting from version 15.4, iOS has stopped supporting the key WebGL extension powering our Many-Body force implementation (`EXT_float_blend`). We're investigating this issue and exploring solutions.~~ The latest iOS works again!
- cosmos.gl doesn't work on Android devices that don't support the `OES_texture_float` WebGL extension.


---

### Documentation
- 🧑‍💻 [Quick Start](https://cosmosgl.github.io/graph/?path=/docs/welcome-to-cosmos--docs)
- 🛠 [Configuration](https://cosmosgl.github.io/graph/?path=/docs/configuration--docs)
- ⚙️ [API Reference](https://cosmosgl.github.io/graph/?path=/docs/api-reference--docs)
- 🚀 [Migration Guide](https://github.com/cosmosgl/graph/blob/main/cosmos-2-0-migration-notes.md)

---

### License

**MIT**

---

### Contact

[GitHub Discussions](https://github.com/orgs/cosmosgl/discussions)
