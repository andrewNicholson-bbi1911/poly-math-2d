# poly-math-2d

Library for working with 2D polygons: boolean operations (union, difference), triangulation (with holes support), adjacency graphs, support for convex and non-convex shapes.

## Features
- ✅ Boolean operations on polygons (union, difference) with holes support
- ✅ Triangulation with holes support (earcut)
- ✅ Building triangle adjacency graph (TPolygon)
- ✅ PolygonMap support (set of polygons)
- ✅ Basic geometric operations (intersections, convex hulls)
- ✅ TypeScript support

## Installation
```bash
npm install poly-math-2d
```

## API

### Main Classes

#### `Point`
Enhanced 2D point class with distance calculation methods.
```ts
class Point {
    constructor(public x: number, public y: number);

    // Static distance methods
    static getDistance(a: Point, b: Point): number;
    // Calculates exact Euclidean distance between two points

    static getDistanceQuick(a: Point, b: Point): number;
    // Fast approximate distance using alpha-max + beta-min algorithm
    // ~0.8% error but much faster for performance-critical applications

    static getManhattanDistance(a: Point, b: Point): number;
    // Manhattan distance (|x1-x2| + |y1-y2|) - very fast

    static getDistanceSquared(a: Point, b: Point): number;
    // Squared distance (fastest when you don't need the actual distance)

    // Instance methods (same as static but called on point instance)
    getDistance(to: Point): number;
    getDistanceQuick(to: Point): number;
    getManhattanDistance(to: Point): number;
    getDistanceSquared(to: Point): number;
}
```

#### `Polygon`
Main class for polygon operations. Supports holes, triangulation, and boolean operations.
```ts
class Polygon {
    // Properties
    points: Point[];           // Polygon vertices
    tpolygons: TPolygon[];    // Triangulation result
    holes: Polygon[];         // Internal holes

    // Constructor
    constructor(points: Point[], holes?: Polygon[]);

    // Static Methods
    static createWithHoles(points: Point[], holes?: Polygon[]): Polygon;
    // Creates a polygon with holes using earcut triangulation
    // Recommended for polygons with holes as it handles them correctly

    // Instance Methods
    isConvex(): boolean;
    // Checks if the polygon is convex

    unionPolygon(other: Polygon): PolygonMap;
    // Performs union operation with another polygon
    // Returns a PolygonMap as the result might contain multiple polygons

    differencePolygon(other: Polygon): PolygonMap;
    // Subtracts another polygon from this one
    // Returns a PolygonMap as the result might contain multiple polygons
}
```

#### `PolygonMap`
Container for multiple polygons. Useful for complex boolean operations results.
```ts
class PolygonMap {
    // Properties
    polygons: Polygon[];      // Array of polygons

    // Constructor
    constructor(polygons?: Polygon[]);

    // Methods
    unionPolygon(other: PolygonMap): PolygonMap;
    // Performs union operation with another polygon map
    // Combines all polygons from both maps

    differencePolygon(other: PolygonMap): PolygonMap;
    // Subtracts another polygon map from this one
    // Useful for complex shape subtraction
}
```

#### `TPolygon`
Represents a triangulated polygon part with adjacency information.
```ts
class TPolygon {
    // Properties
    points: Point[];         // Triangle vertices
    neighbors: TPolygon[];   // Adjacent triangles

    // Methods
    isNeighbor(other: TPolygon): boolean;
    // Checks if another TPolygon is adjacent to this one
    // Two triangles are neighbors if they share an edge

    getCommonEdge(other: TPolygon): [Point, Point] | null;
    // Returns shared edge between two adjacent triangles
    // Returns null if triangles are not adjacent
}
```

### Utility Functions

The library also provides several utility functions for geometric operations:

```ts
// Point in polygon test
pointInPolygon(point: Point, polygon: Point[]): boolean;

// Segment intersection test
segmentsIntersect(a1: Point, a2: Point, b1: Point, b2: Point): boolean;

// Polygon intersection test
polygonIntersectsPolygon(poly1: Point[], poly2: Point[]): boolean;

// Convex hull operations
convexUnion(poly1: Point[], poly2: Point[]): Point[];
convexDifference(subject: Point[], clip: Point[]): Point[][];
```

## Build

```bash
npm run build
```

## Project Structure

```
poly-math-2d/
├── src/
│   ├── index.ts          # Main entry point
│   ├── point.ts          # Point class with distance methods
│   ├── polygon.ts        # Main classes (Polygon, PolygonMap, TPolygon)
│   └── poly2d.ts         # Basic geometric functions
├── dist/                 # Compiled files
├── package.json
├── tsconfig.json
└── README.md
```

## License
MIT 
