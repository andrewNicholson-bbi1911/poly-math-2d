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
```ts
class Point {
    constructor(public x: number, public y: number) {}
}
```

#### `Polygon`
```ts
class Polygon {
    points: Point[];
    tpolygons: TPolygon[];  // Triangulation
    holes: Polygon[];       // Internal holes
    
    constructor(points: Point[], holes: Polygon[] = []);
    static createWithHoles(points: Point[], holes: Polygon[] = []): Polygon; // Holes support via earcut
    isConvex(): boolean;
    unionPolygon(other: Polygon): PolygonMap;
    differencePolygon(other: Polygon): PolygonMap;
}
```

#### `PolygonMap`
```ts
class PolygonMap {
    polygons: Polygon[];
    
    constructor(polygons: Polygon[] = []);
    unionPolygon(other: PolygonMap): PolygonMap;
    differencePolygon(other: PolygonMap): PolygonMap;
}
```

#### `TPolygon` (Triangle polygon)
```ts
class TPolygon {
    points: Point[];
    neighbors: TPolygon[];  // Adjacent triangles
    
    constructor(points: Point[]);
    isNeighbor(other: TPolygon): boolean;
    getCommonEdge(other: TPolygon): [Point, Point] | null;
}
```

## Examples

```ts
// Basic polygon operations
const points = [new Point(0, 0), new Point(2, 0), new Point(1, 2)];
const polygon = new Polygon(points);

// Check if polygon is convex
console.log('Is convex:', polygon.isConvex());

// Create polygon with holes
const outerPoints = [new Point(0, 0), new Point(4, 0), new Point(4, 4), new Point(0, 4)];
const holePoints = [new Point(1, 1), new Point(3, 1), new Point(3, 3), new Point(1, 3)];
const hole = new Polygon(holePoints);
const polygonWithHole = Polygon.createWithHoles(outerPoints, [hole]);

// Boolean operations
const poly1 = new Polygon([new Point(0, 0), new Point(2, 0), new Point(1, 2)]);
const poly2 = new Polygon([new Point(1, 1), new Point(3, 1), new Point(2, 3)]);

const union = poly1.unionPolygon(poly2);
const difference = poly1.differencePolygon(poly2);

// Segment intersection
const seg1Start = new Point(0, 0);
const seg1End = new Point(4, 4);
const seg2Start = new Point(0, 4);
const seg2End = new Point(4, 0);

if (segmentsIntersect(seg1Start, seg1End, seg2Start, seg2End)) {
    console.log('Segments intersect');
}

// Convex hull
const points1 = [new Point(0, 0), new Point(2, 0), new Point(1, 2)];
const points2 = [new Point(1, 1), new Point(3, 1), new Point(2, 3)];
const hull = convexUnion(points1, points2);
console.log('Convex hull:', hull);
```

## Project Structure

```
poly-math-2d/
├── src/
│   ├── index.ts          # Main entry point
│   ├── polygon.ts        # Main classes (Polygon, PolygonMap, TPolygon)
│   └── poly2d.ts         # Basic geometric functions
├── dist/                 # Compiled files
├── package.json
├── tsconfig.json
└── README.md
```

## License
MIT 
