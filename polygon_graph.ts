// polygon_graph.ts
// Классы для работы с графом триангулированного многоугольника

import { convexUnion, convexDifference, trianglesConvexUnion, trianglesDifference, Point as P2DPoint, Triangle as P2DTriangle } from './poly2d.js';

export class Point {
    constructor(public x: number, public y: number) { }
}

export type Triangle = [Point, Point, Point];

// Треугольный полигон
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

// Связь между треугольными полигонами
export class TPolygonConnection {
    neighbor: TPolygon;
    distance: number;
    constructor(neighbor: TPolygon, distance: number) {
        this.neighbor = neighbor;
        this.distance = distance;
    }
}

// Основной многоугольник
export class Polygon {
    points: Point[];
    tpolygons: TPolygon[] = [];
    constructor(points: Point[]) {
        // Гарантируем CCW порядок точек
        this.points = reverseIfNotCCW(points);
        // Триангуляция ear clipping
        const triangles = earClippingTriangulation(this.points);
        // Создаём TPolygon для каждого треугольника
        this.tpolygons = triangles.map(tri => new TPolygon(tri));
        // Строим связи между TPolygon
        buildTPolygonConnections(this.tpolygons);
    }
    // Проверка выпуклости
    isConvex(): boolean {
        return isConvexPolygon(this.points);
    }
    // Объединение
    unionPolygon(other: Polygon): Polygon {
        if (this.isConvex() && other.isConvex()) {
            // Используем convexUnion из poly2d
            const points = convexUnion(this.points as P2DPoint[], other.points as P2DPoint[]);
            return new Polygon(points.map((p: P2DPoint) => new Point(p.x, p.y)));
        } else {
            // Для невыпуклых: объединяем все треугольники, строим выпуклую оболочку
            const allPoints: Point[] = [];
            for (const t of this.tpolygons) allPoints.push(...t.mainTriangle);
            for (const t of other.tpolygons) allPoints.push(...t.mainTriangle);
            const hull = convexUnion(allPoints as P2DPoint[], []);
            return new Polygon(hull.map((p: P2DPoint) => new Point(p.x, p.y)));
        }
    }
    // Разность
    differencePolygon(other: Polygon): Polygon {
        if (this.isConvex() && other.isConvex()) {
            // Используем convexDifference из poly2d
            const diffs = convexDifference(this.points as P2DPoint[], other.points as P2DPoint[]);
            // Берём только первый результат (упрощённо)
            if (diffs.length > 0) {
                return new Polygon(diffs[0].map((p: P2DPoint) => new Point(p.x, p.y)));
            } else {
                return new Polygon([]);
            }
        } else {
            // Для невыпуклых: вычитаем каждый треугольник other из каждого треугольника this
            let resultTris: Triangle[] = [];
            for (const t1 of this.tpolygons) {
                let tris: Triangle[] = [t1.mainTriangle];
                for (const t2 of other.tpolygons) {
                    const newTris: Triangle[] = [];
                    for (const tri of tris) {
                        const diff = trianglesDifference(tri as P2DTriangle, t2.mainTriangle as P2DTriangle);
                        for (const d of diff) newTris.push(d as Triangle);
                    }
                    tris = newTris;
                }
                resultTris.push(...tris);
            }
            // Собираем все точки результата
            const points: Point[] = [];
            for (const tri of resultTris) points.push(...tri);
            // Строим выпуклую оболочку (упрощённо)
            const hull = convexUnion(points as P2DPoint[], []);
            return new Polygon(hull.map((p: P2DPoint) => new Point(p.x, p.y)));
        }
    }
}

// Проверка CCW порядка точек
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
        // Для CCW: cross < 0 — вогнутый, cross > 0 — выпуклый
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
            // Проверяем, что никакая другая точка не лежит внутри уха
            let hasPointInside = false;
            for (let j = 0; j < verts.length; j++) {
                if (j === (i + verts.length - 1) % verts.length || j === i || j === (i + 1) % verts.length) continue;
                if (pointInTriangle(points[verts[j]], points[i0], points[i1], points[i2])) {
                    hasPointInside = true;
                    break;
                }
            }
            if (hasPointInside) continue;
            // Добавляем треугольник
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

// --- Построение связей между TPolygon ---
function buildTPolygonConnections(tpolys: TPolygon[]) {
    // Считаем, что два TPolygon соседи, если у них совпадают две вершины
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

// Проверка выпуклости многоугольника
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