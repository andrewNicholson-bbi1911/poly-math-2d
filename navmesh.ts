import polygonClipping from 'polygon-clipping';

export function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export class Point {
    constructor(public x: number, public y: number) { }
}

function pointInPolygon(point: Point, polygon: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-12) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function dist(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function centroid(polygon: Point[]): Point {
    let x = 0, y = 0, n = polygon.length;
    for (const p of polygon) { x += p.x; y += p.y; }
    return new Point(x / n, y / n);
}

function bbox(poly: Point[]): [number, number, number, number] {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of poly) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }
    return [minX, minY, maxX, maxY];
}
function bboxOverlap(a: [number, number, number, number], b: [number, number, number, number]): boolean {
    return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

function polygonsTouch(a: Point[], b: Point[]): boolean {
    for (const pa of a) for (const pb of b) if (Math.abs(pa.x - pb.x) < 1e-6 && Math.abs(pa.y - pb.y) < 1e-6) return true;
    return false;
}

function pointsToPolygon(points: Point[]): number[][] {
    return points.map(p => [p.x, p.y]);
}
function polygonToPoints(polygon: number[][]): Point[] {
    return polygon.map(([x, y]) => new Point(x, y));
}
function polygonsToPointsArray(polygons: number[][][]): Point[][] {
    return polygons.map(polygonToPoints);
}
function pointsArrayToPolygons(arr: Point[][]): number[][][] {
    return arr.map(pointsToPolygon);
}

export class NavMeshLayer {
    id: number;
    polygons: Point[][] = [];
    obstacles: Record<string, { mesh: Point[]; type: 'obstacle' | 'bridge' }> = {};
    originalPolygons: Point[][] = [];
    adjacency: number[][] = [];
    centroids: Point[] = [];

    constructor(id: number) {
        this.id = id;
    }
    setInitialPolygons(polygons: Point[][]) {
        this.originalPolygons = polygons.map(poly => poly.map(p => new Point(p.x, p.y)));
        this.polygons = polygons.map(poly => poly.map(p => new Point(p.x, p.y)));
    }
    addObstacle(mesh: Point[]): string {
        const id = uuidv4();
        this.obstacles[id] = { mesh, type: 'obstacle' };
        // MultiPolygon: Polygon[] (array of rings)
        const meshPoly = [pointsToPolygon(mesh)];
        const basePolys = pointsArrayToPolygons(this.polygons);
        if (this.polygons.length === 0) return id;
        const result = polygonClipping.difference(basePolys, meshPoly) as number[][][];
        this.polygons = polygonsToPointsArray(result);
        return id;
    }
    removeObstacle(obstacleID: string): void {
        delete this.obstacles[obstacleID];
        this._rebuildPolygons();
    }
    addBridge(mesh: Point[]): string {
        const id = uuidv4();
        this.obstacles[id] = { mesh, type: 'bridge' };
        const meshPoly = [pointsToPolygon(mesh)];
        const basePolys = pointsArrayToPolygons(this.polygons);
        const result = polygonClipping.union(basePolys, meshPoly) as number[][][];
        this.polygons = polygonsToPointsArray(result);
        return id;
    }
    removeBridge(bridgeID: string): void {
        delete this.obstacles[bridgeID];
        this._rebuildPolygons();
    }
    private _rebuildPolygons() {
        let result: number[][][] = pointsArrayToPolygons(this.originalPolygons);
        for (const obs of Object.values(this.obstacles)) {
            if (obs.type === 'obstacle') {
                const meshPoly = [pointsToPolygon(obs.mesh)];
                result = polygonClipping.difference(result, meshPoly) as number[][][];
            }
        }
        for (const obs of Object.values(this.obstacles)) {
            if (obs.type === 'bridge') {
                const meshPoly = [pointsToPolygon(obs.mesh)];
                result = polygonClipping.union(result, meshPoly) as number[][][];
            }
        }
        this.polygons = polygonsToPointsArray(result);
    }
    buildAdjacencyGraph() {
        const n = this.polygons.length;
        this.adjacency = Array.from({ length: n }, () => []);
        this.centroids = this.polygons.map(centroid);
        const bboxes = this.polygons.map(bbox);
        for (let i = 0; i < n; ++i) {
            for (let j = i + 1; j < n; ++j) {
                if (bboxOverlap(bboxes[i], bboxes[j]) && polygonsTouch(this.polygons[i], this.polygons[j])) {
                    this.adjacency[i].push(j);
                    this.adjacency[j].push(i);
                }
            }
        }
    }
    findPolygonIndexForPoint(pt: Point): number {
        for (let i = 0; i < this.polygons.length; ++i) {
            if (pointInPolygon(pt, this.polygons[i])) return i;
        }
        return -1;
    }
    findPath(startIdx: number, endIdx: number): number[] {
        const n = this.polygons.length;
        const open = new Set([startIdx]);
        const cameFrom: Record<number, number | null> = {};
        const gScore: number[] = Array(n).fill(Infinity);
        const fScore: number[] = Array(n).fill(Infinity);
        gScore[startIdx] = 0;
        fScore[startIdx] = dist(this.centroids[startIdx], this.centroids[endIdx]);
        while (open.size > 0) {
            let current = -1, minF = Infinity;
            for (const idx of open) {
                if (fScore[idx] < minF) { minF = fScore[idx]; current = idx; }
            }
            if (current === endIdx) {
                const path = [current];
                while (cameFrom[current] !== undefined && cameFrom[current] !== null) {
                    current = cameFrom[current]!;
                    path.push(current);
                }
                return path.reverse();
            }
            open.delete(current);
            for (const neighbor of this.adjacency[current]) {
                const tentativeG = gScore[current] + dist(this.centroids[current], this.centroids[neighbor]);
                if (tentativeG < gScore[neighbor]) {
                    cameFrom[neighbor] = current;
                    gScore[neighbor] = tentativeG;
                    fScore[neighbor] = tentativeG + dist(this.centroids[neighbor], this.centroids[endIdx]);
                    open.add(neighbor);
                }
            }
        }
        return [];
    }
    getPath(start: Point, end: Point): Point[] {
        this.buildAdjacencyGraph();
        const startIdx = this.findPolygonIndexForPoint(start);
        const endIdx = this.findPolygonIndexForPoint(end);
        if (startIdx === -1 || endIdx === -1) return [];
        if (startIdx === endIdx) return [start, end];
        const pathIdx = this.findPath(startIdx, endIdx);
        if (pathIdx.length === 0) return [];
        const result: Point[] = [start];
        for (let i = 1; i < pathIdx.length - 1; ++i) {
            result.push(this.centroids[pathIdx[i]]);
        }
        result.push(end);
        return result;
    }
} 