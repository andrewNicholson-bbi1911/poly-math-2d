// poly2d.ts
// Optimized functions for working with triangles (3 vertices, always convex)

export type Point = { x: number, y: number };
export type Triangle = [Point, Point, Point];

// 1. Check if a point lies inside a triangle (barycentric method)
export function pointInTriangle(p: Point, tri: Triangle): boolean {
    const [a, b, c] = tri;
    const area = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const s1 = area(p, a, b);
    const s2 = area(p, b, c);
    const s3 = area(p, c, a);
    return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
}

// 2. Check if two segments intersect (leaving as is)
export function segmentsIntersect(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
    function ccw(p1: Point, p2: Point, p3: Point) {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (ccw(a1, b1, b2) !== ccw(a2, b1, b2)) && (ccw(a1, a2, b1) !== ccw(a1, a2, b2));
}

// 3. Check if two triangles intersect
export function trianglesIntersect(t1: Triangle, t2: Triangle): boolean {
    // Check for edge intersections
    for (let i = 0; i < 3; i++) {
        const a1 = t1[i], a2 = t1[(i + 1) % 3];
        for (let j = 0; j < 3; j++) {
            const b1 = t2[j], b2 = t2[(j + 1) % 3];
            if (segmentsIntersect(a1, a2, b1, b2)) return true;
        }
    }
    // One triangle inside another
    if (pointInTriangle(t1[0], t2) || pointInTriangle(t2[0], t1)) return true;
    return false;
}

// 4. Union of two triangles (convex hull for 6 points)
export function trianglesConvexUnion(t1: Triangle, t2: Triangle): Point[] {
    const points = [...t1, ...t2];
    // Convex hull (Graham's algorithm for <= 6 points)
    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const lower: Point[] = [];
    for (const p of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    const upper: Point[] = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    upper.pop(); lower.pop();
    return lower.concat(upper);
}

// Universal cross
export function cross(o: Point, a: Point, b: Point) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// 5. Simple triangle subtraction from triangle (stub)
// Plan:
// 1. Check if triangles intersect. If not - return subject.
// 2. Implement Sutherland-Hodgman algorithm for clipping subject by clip.
// 3. Return array of triangles (or polygons) obtained after clipping.

export function trianglesDifference(subject: Triangle, clip: Triangle): Triangle[] {
    // If they don't intersect - return the original triangle
    if (!trianglesIntersect(subject, clip)) return [subject];

    // Convert triangles to point arrays
    let output: Point[] = [...subject];

    // Sutherland–Hodgman: clip by each edge of clip
    for (let i = 0; i < 3; i++) {
        const cp1 = clip[i];
        const cp2 = clip[(i + 1) % 3];
        const input = output;
        output = [];
        for (let j = 0; j < input.length; j++) {
            const s = input[j];
            const e = input[(j + 1) % input.length];

            // Check if point is on the left side of the clip edge
            const inside = (p: Point) => {
                // Left side of clip edge — inside
                return ((cp2.x - cp1.x) * (p.y - cp1.y) - (cp2.y - cp1.y) * (p.x - cp1.x)) < 0;
            };

            const s_in = inside(s);
            const e_in = inside(e);

            if (s_in && e_in) {
                // Both inside — add the end point
                output.push(e);
            } else if (s_in && !e_in) {
                // s inside, e outside — add intersection point
                const inter = segmentIntersection(s, e, cp1, cp2);
                if (inter) output.push(inter);
            } else if (!s_in && e_in) {
                // s outside, e inside — add intersection and end point
                const inter = segmentIntersection(s, e, cp1, cp2);
                if (inter) output.push(inter);
                output.push(e);
            }
            // both outside — add nothing
        }
        // If nothing remains after clipping — return []
        if (output.length === 0) return [];
    }

    // If after clipping less than 3 points remain — invalid polygon
    if (output.length < 3) return [];

    // Triangulate the result (for a triangle, it's either the triangle itself or a convex polygon)
    // For simplicity: return as an array of triangles (fan triangulation)
    const triangles: Triangle[] = [];
    for (let i = 1; i < output.length - 1; i++) {
        triangles.push([output[0], output[i], output[i + 1]]);
    }
    return triangles;
}

// Helper function: intersection of two segments, returns point or null
function segmentIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
    const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
    if (d === 0) return null; // parallel
    const ua = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / d;
    if (ua < 0 || ua > 1) return null;
    const ub = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / d;
    if (ub < 0 || ub > 1) return null;
    return {
        x: a1.x + ua * (a2.x - a1.x),
        y: a1.y + ua * (a2.y - a1.y)
    };
}

// 1. Check if a point lies inside a polygon (ray algorithm)
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
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

export function polygonIntersectsPolygon(poly1: Point[], poly2: Point[]): boolean {
    for (let i = 0; i < poly1.length - 1; i++) {
        for (let j = 0; j < poly2.length - 1; j++) {
            if (segmentsIntersect(poly1[i], poly1[i + 1], poly2[j], poly2[j + 1])) {
                return true;
            }
        }
    }
    // One inside another
    if (pointInPolygon(poly1[0], poly2) || pointInPolygon(poly2[0], poly1)) return true;
    return false;
}

// Convex hull (Convex Hull, Graham's algorithm)
export function convexUnion(poly1: Point[], poly2: Point[]): Point[] {
    const points = [...poly1, ...poly2];
    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const lower: Point[] = [];
    for (const p of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    const upper: Point[] = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    upper.pop(); lower.pop();
    return lower.concat(upper);
}

// Simple difference of convex: if they don't intersect - return subject, otherwise empty
export function convexDifference(subject: Point[], clip: Point[]): Point[][] {
    // Use polygonIntersectsPolygon from poly2d
    if (!polygonIntersectsPolygon(subject, clip)) return [subject];
    // For complex cases, Sutherland–Hodgman implementation is needed
    return [];
}