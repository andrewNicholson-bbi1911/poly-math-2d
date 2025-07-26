import { Point, Polygon, TPolygon, TPolygonConnection } from './polygon_graph.js';

// Пример невыпуклого многоугольника ("стрелка")
const points: Point[] = [
    new Point(0, 0),
    new Point(4, 0),
    new Point(4, 2),
    new Point(2, 4),
    new Point(0, 2)
];

const poly = new Polygon(points);

console.log('Исходные точки:', poly.points);
console.log('Количество триангулированных TPolygon:', poly.tpolygons.length);

poly.tpolygons.forEach((tp, i) => {
    console.log(`TPolygon #${i}:`, tp.mainTriangle.map(p => `(${p.x},${p.y})`).join(' - '));
    console.log(`  Центр: (${tp.centerPoint.x}, ${tp.centerPoint.y})`);
    console.log(`  Связи:`, tp.connections.map(c => `к центру (${c.neighbor.centerPoint.x},${c.neighbor.centerPoint.y}), dist=${c.distance.toFixed(2)}`));
});

function printTPolygons(poly: Polygon, label: string) {
    console.log(`\n${label}:`);
    poly.tpolygons.forEach((tp, i) => {
        console.log(`  TPolygon #${i}:`, tp.mainTriangle.map(p => `(${p.x},${p.y})`).join(' - '));
        console.log(`    Центр: (${tp.centerPoint.x}, ${tp.centerPoint.y})`);
        const conn = tp.connections.map(c => {
            const idx = poly.tpolygons.indexOf(c.neighbor);
            return `#${idx} (dist=${c.distance.toFixed(2)})`;
        });
        console.log(`    Связи:`, conn.join(', '));
    });
}

// Тесты для unionPolygon и differencePolygon
const polyA = new Polygon([
    new Point(0, 0),
    new Point(4, 0),
    new Point(2, 3)
]);
const polyB = new Polygon([
    new Point(2, 1),
    new Point(6, 1),
    new Point(4, 4)
]);

const union = polyA.unionPolygon(polyB);
console.log('\nunionPolygon (A ∪ B):', union.points.map((p: Point) => `(${p.x},${p.y})`).join(' '));
printTPolygons(union, 'TPolygons unionPolygon (A ∪ B)');

const diff = polyA.differencePolygon(polyB);
console.log('differencePolygon (A \\ B):', diff.points.map((p: Point) => `(${p.x},${p.y})`).join(' '));
printTPolygons(diff, 'TPolygons differencePolygon (A \\ B)');

// Тесты для unionPolygon и differencePolygon с невыпуклыми многоугольниками
const polyC = new Polygon([
    new Point(0, 0),
    new Point(4, 0),
    new Point(4, 2),
    new Point(2, 4),
    new Point(0, 2)
]);
const polyD = new Polygon([
    new Point(2, 1),
    new Point(6, 1),
    new Point(4, 4),
    new Point(3, 3),
    new Point(2, 2)
]);

const unionCD = polyC.unionPolygon(polyD);
console.log('\nunionPolygon (C ∪ D):', unionCD.points.map((p: Point) => `(${p.x},${p.y})`).join(' '));
printTPolygons(unionCD, 'TPolygons unionPolygon (C ∪ D)');

const diffCD = polyC.differencePolygon(polyD);
console.log('differencePolygon (C \\ D):', diffCD.points.map((p: Point) => `(${p.x},${p.y})`).join(' '));
printTPolygons(diffCD, 'TPolygons differencePolygon (C \\ D)'); 