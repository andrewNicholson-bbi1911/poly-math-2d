// polygon_graph.ts
// Classes for working with triangulated polygon graph

import { convexUnion, convexDifference, trianglesConvexUnion, trianglesDifference, Point as P2DPoint, Triangle as P2DTriangle } from './poly2d.js';
import polygonClipping from 'polygon-clipping';
import earcut from 'earcut';

export class Point {
    constructor(public x: number, public y: number) { }
}

export type Triangle = [Point, Point, Point];

// Triangular polygon
export class TPolygon {
    mainTriangle: Triangle;
    centerPoint: Point;
    connections: TPolygonConnection[] = [];
    constructor(triangle: Triangle) {
        this.mainTriangle = triangle;
        this.centerPoint = new Point(
            (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
            (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        );
    }
}

// Connection between triangular polygons
export class TPolygonConnection {
    neighbor: TPolygon;
    distance: number;
    constructor(neighbor: TPolygon, distance: number) {
        this.neighbor = neighbor;
        this.distance = distance;
    }
}

function toPolygonClippingFormat(pts: Point[]): number[][][] {
    // polygon-clipping expects Polygon: [ [ [x, y], ... ] ]
    if (pts.length === 0) return [];
    const ring = pts.map(p => [p.x, p.y]);
    // Close the contour if not closed
    if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push([ring[0][0], ring[0][1]]);
    }
    return [ring]; // Polygon: array of rings
}

function parseClippingResult(result: any): Polygon[] {
    if (!result || result.length === 0) return [];
    // If the result is Polygon (number[][][]), wrap it in an array
    if (Array.isArray(result[0][0][0])) {
        // MultiPolygon: number[][][][]
        return result.map((poly: number[][][]) => {
            // Take only the outer contour (poly[0])
            return new Polygon(poly[0].map((pt: number[]) => new Point(pt[0], pt[1])));
        });
    } else {
        // Polygon: number[][][]
        return [new Polygon(result[0].map((pt: number[]) => new Point(pt[0], pt[1])))];
    }
}

function triangulateWithHoles(outer: Point[], holes: Polygon[]): Triangle[] {
    // Form a flat array of coordinates and hole indices
    const vertices: number[] = [];
    const holeIndices: number[] = [];
    let idx = 0;
    // Outer contour
    for (const p of outer) {
        vertices.push(p.x, p.y);
    }
    idx += outer.length;
    // Holes
    for (const hole of holes) {
        holeIndices.push(idx);
        for (const p of hole.points) {
            vertices.push(p.x, p.y);
        }
        idx += hole.points.length;
    }
    // Triangulation
    const triangles: Triangle[] = [];
    const indices = earcut(vertices, holeIndices);
    for (let i = 0; i < indices.length; i += 3) {
        const ia = indices[i] * 2, ib = indices[i + 1] * 2, ic = indices[i + 2] * 2;
        const a: Point = { x: vertices[ia], y: vertices[ia + 1] };
        const b: Point = { x: vertices[ib], y: vertices[ib + 1] };
        const c: Point = { x: vertices[ic], y: vertices[ic + 1] };
        triangles.push([a, b, c]);
    }
    return triangles;
}

// Main polygon
export class Polygon {
    points: Point[];
    tpolygons: TPolygon[] = [];
    holes: Polygon[] = [];
    constructor(points: Point[], holes: Polygon[] = []) {
        this.points = reverseIfNotCCW(points);
        this.holes = holes;
        this._rebuildTriangulation();
    }
    private _rebuildTriangulation() {
        // If there are holes - use earcut
        if (this.holes.length > 0) {
            const triangles = triangulateWithHoles(this.points, this.holes);
            this.tpolygons = triangles.map(tri => new TPolygon(tri));
            buildTPolygonConnections(this.tpolygons);
        } else {
            const triangles = earClippingTriangulation(this.points);
            this.tpolygons = triangles.map(tri => new TPolygon(tri));
            buildTPolygonConnections(this.tpolygons);
        }
        // Rebuild tpolygons and connections for all holes (their own triangulation)
        for (const hole of this.holes) {
            if (hole.holes.length > 0) {
                const trianglesH = triangulateWithHoles(hole.points, hole.holes);
                hole.tpolygons = trianglesH.map(tri => new TPolygon(tri));
                buildTPolygonConnections(hole.tpolygons);
            } else {
                const trianglesH = earClippingTriangulation(hole.points);
                hole.tpolygons = trianglesH.map(tri => new TPolygon(tri));
                buildTPolygonConnections(hole.tpolygons);
            }
        }
    }
    // Check for convexity
    isConvex(): boolean {
        return isConvexPolygon(this.points);
    }
    // Union
    unionPolygon(other: Polygon): PolygonMap {
        const pcA = toPolygonClippingFormat(this.points);
        const pcB = toPolygonClippingFormat(other.points);
        const result = (polygonClipping.union as any)(pcA, pcB);
        return new PolygonMap(Polygon.fromClippingResult(result));
    }
    // Difference
    differencePolygon(other: Polygon): PolygonMap {
        const pcA = toPolygonClippingFormat(this.points);
        const pcB = toPolygonClippingFormat(other.points);
        const result = (polygonClipping.difference as any)(pcA, pcB);
        return new PolygonMap(Polygon.fromClippingResult(result));
    }
    // Get all outer contours as an array of Polygon
    static fromClippingResult(result: any): Polygon[] {
        if (!result || result.length === 0) return [];
        // result: MultiPolygon (array of polygons), polygon: array of rings
        return result.map((poly: number[][][]) => {
            const outer = poly[0].map((pt: number[]) => new Point(pt[0], pt[1]));
            const holes = poly.slice(1).map(
                (hole: number[][]) => new Polygon(hole.map((pt: number[]) => new Point(pt[0], pt[1])))
            );
            return new Polygon(outer, holes);
        });
    }
}

export class PolygonMap {
    polygons: Polygon[];
    constructor(polygons: Polygon[] = []) {
        this.polygons = polygons;
    }
    // Union of two PolygonMap
    unionPolygon(other: PolygonMap): PolygonMap {
        let allPolys: Polygon[] = [...this.polygons, ...other.polygons];
        if (allPolys.length === 0) return new PolygonMap([]);
        // Collect all polygons for polygon-clipping
        const allPolyRings = allPolys.map(p => toPolygonClippingFormat(p.points)); // number[][][]
        const result = (polygonClipping.union as any)(...allPolyRings);
        return new PolygonMap(Polygon.fromClippingResult(result));
    }
    // Difference PolygonMap - PolygonMap
    differencePolygon(other: PolygonMap): PolygonMap {
        if (this.polygons.length === 0) return new PolygonMap([]);
        const otherPolyRings = other.polygons.map(p => toPolygonClippingFormat(p.points));
        let resultPolys: Polygon[] = [];
        for (const p of this.polygons) {
            const poly = toPolygonClippingFormat(p.points);
            const diff = (polygonClipping.difference as any)(poly, ...otherPolyRings);
            resultPolys.push(...Polygon.fromClippingResult(diff));
        }
        return new PolygonMap(resultPolys);
    }
}

// Check CCW order of points
function isCCW(points: Point[]): boolean {
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        sum += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return sum < 0;
}
function reverseIfNotCCW(points: Point[]): Point[] {
    return isCCW(points) ? points : [...points].reverse();
}

// --- Ear Clipping Triangulation ---
function earClippingTriangulation(points: Point[]): Triangle[] {
    const triangles: Triangle[] = [];
    if (points.length < 3) return triangles;
    const verts = points.map((p, i) => i);
    function isConvex(i0: number, i1: number, i2: number): boolean {
        const a = points[i0], b = points[i1], c = points[i2];
        // For CCW: cross < 0 — concave, cross > 0 — convex
        return cross(a, b, c) > 0;
    }
    function cross(a: Point, b: Point, c: Point): number {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }
    function pointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
        const area = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        const s1 = area(p, a, b);
        const s2 = area(p, b, c);
        const s3 = area(p, c, a);
        return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
    }
    let guard = 0;
    while (verts.length > 3 && guard < 1000) {
        let earFound = false;
        for (let i = 0; i < verts.length; i++) {
            const i0 = verts[(i + verts.length - 1) % verts.length];
            const i1 = verts[i];
            const i2 = verts[(i + 1) % verts.length];
            if (!isConvex(i0, i1, i2)) continue;
            // Check if no other point lies inside the ear
            let hasPointInside = false;
            for (let j = 0; j < verts.length; j++) {
                if (j === (i + verts.length - 1) % verts.length || j === i || j === (i + 1) % verts.length) continue;
                if (pointInTriangle(points[verts[j]], points[i0], points[i1], points[i2])) {
                    hasPointInside = true;
                    break;
                }
            }
            if (hasPointInside) continue;
            // Add triangle
            triangles.push([points[i0], points[i1], points[i2]]);
            verts.splice(i, 1);
            earFound = true;
            break;
        }
        if (!earFound) break;
        guard++;
    }
    if (verts.length === 3) {
        triangles.push([points[verts[0]], points[verts[1]], points[verts[2]]]);
    }
    return triangles;
}

// --- Building connections between TPolygon ---
function buildTPolygonConnections(tpolys: TPolygon[]) {
    // Assume two TPolygons are neighbors if they share two vertices
    for (let i = 0; i < tpolys.length; i++) {
        for (let j = i + 1; j < tpolys.length; j++) {
            const shared = countSharedVertices(tpolys[i].mainTriangle, tpolys[j].mainTriangle);
            if (shared === 2) {
                const dist = distance(tpolys[i].centerPoint, tpolys[j].centerPoint);
                tpolys[i].connections.push(new TPolygonConnection(tpolys[j], dist));
                tpolys[j].connections.push(new TPolygonConnection(tpolys[i], dist));
            }
        }
    }
}
function countSharedVertices(tri1: Triangle, tri2: Triangle): number {
    let count = 0;
    for (const v1 of tri1) {
        for (const v2 of tri2) {
            if (v1.x === v2.x && v1.y === v2.y) count++;
        }
    }
    return count;
}
function distance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Check for convexity of polygon
function isConvexPolygon(points: Point[]): boolean {
    if (points.length < 4) return true;
    let sign = 0;
    for (let i = 0; i < points.length; i++) {
        const dx1 = points[(i + 2) % points.length].x - points[(i + 1) % points.length].x;
        const dy1 = points[(i + 2) % points.length].y - points[(i + 1) % points.length].y;
        const dx2 = points[i].x - points[(i + 1) % points.length].x;
        const dy2 = points[i].y - points[(i + 1) % points.length].y;
        const zcross = dx1 * dy2 - dy1 * dx2;
        if (zcross !== 0) {
            if (sign === 0) sign = Math.sign(zcross);
            else if (sign !== Math.sign(zcross)) return false;
        }
    }
    return true;
} 