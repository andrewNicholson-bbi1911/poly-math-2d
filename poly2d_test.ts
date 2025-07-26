import { Point, Triangle, pointInTriangle, segmentsIntersect, trianglesIntersect, trianglesConvexUnion, trianglesDifference } from './poly2d.js';

const a: Point = { x: 0, y: 0 };
const b: Point = { x: 5, y: 0 };
const c: Point = { x: 2.5, y: 5 };
const tri1: Triangle = [a, b, c];

const d: Point = { x: 2, y: 1 };
const e: Point = { x: 7, y: 1 };
const f: Point = { x: 4.5, y: -6 };
const tri2: Triangle = [d, e, f];

// 1. Проверка точки внутри треугольника
const testPoint1: Point = { x: 2.5, y: 2 };
const testPoint2: Point = { x: 6, y: 2 };
console.log('pointInTriangle (внутри):', pointInTriangle(testPoint1, tri1)); // true
console.log('pointInTriangle (снаружи):', pointInTriangle(testPoint2, tri1)); // false

// 2. Проверка пересечения отрезков
console.log('segmentsIntersect (пересекаются):', segmentsIntersect(a, b, d, f)); // true
console.log('segmentsIntersect (не пересекаются):', segmentsIntersect(a, b, { x: 6, y: 6 }, { x: 7, y: 7 })); // false

// 3. Проверка пересечения треугольников
console.log('trianglesIntersect (пересекаются):', trianglesIntersect(tri1, tri2)); // true
const tri3: Triangle = [{ x: 10, y: 10 }, { x: 12, y: 10 }, { x: 11, y: 12 }];
console.log('trianglesIntersect (не пересекаются):', trianglesIntersect(tri1, tri3)); // false

// 4. Объединение двух треугольников (convex hull)
const union = trianglesConvexUnion(tri1, tri2);
console.log('trianglesConvexUnion (hull):', union);

// 5. Разность треугольников
console.log('trianglesDifference (пересекаются):', trianglesDifference(tri1, tri2)); // []
console.log('trianglesDifference (не пересекаются):', trianglesDifference(tri1, tri3)); // [tri1] 