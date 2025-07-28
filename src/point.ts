export class Point {
    constructor(public x: number, public y: number) { }

    // Static method for exact distance calculation between two points
    static getDistance(a: Point, b: Point): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Instance method for exact distance calculation to another point
    getDistance(to: Point): number {
        return Point.getDistance(this, to);
    }

    // Static method for fast approximate distance calculation
    // Uses alpha-max + beta-min algorithm (very fast)
    static getDistanceQuick(a: Point, b: Point): number {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);

        // Alpha-max + beta-min algorithm
        // Coefficients are chosen to minimize maximum error
        const max = Math.max(dx, dy);
        const min = Math.min(dx, dy);

        // Approximation: distance ≈ α×max + β×min
        // Optimal coefficients: α ≈ 0.96, β ≈ 0.4
        return max * 0.96 + min * 0.4;
    }

    // Instance method for fast approximate distance calculation
    getDistanceQuick(to: Point): number {
        return Point.getDistanceQuick(this, to);
    }

    // Static method for Manhattan distance (very fast)
    static getManhattanDistance(a: Point, b: Point): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    // Instance method for Manhattan distance
    getManhattanDistance(to: Point): number {
        return Point.getManhattanDistance(this, to);
    }

    // Static method for squared distance (fastest when square root is not needed)
    static getDistanceSquared(a: Point, b: Point): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    // Instance method for squared distance
    getDistanceSquared(to: Point): number {
        return Point.getDistanceSquared(this, to);
    }
}

// Export type for compatibility
export type PointType = { x: number; y: number }; 