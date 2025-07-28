import { Polygon } from './polygon.js';
import polygonClipping from 'polygon-clipping';
import { Point } from './point.js';

export function toPolygonClippingFormat(pts: Point[]): number[][][] {
    // polygon-clipping expects Polygon: [ [ [x, y], ... ] ]
    if (pts.length === 0) return [];
    const ring = pts.map(p => [p.x, p.y]);
    // Close the contour if not closed
    if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push([ring[0][0], ring[0][1]]);
    }
    return [ring]; // Polygon: array of rings
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