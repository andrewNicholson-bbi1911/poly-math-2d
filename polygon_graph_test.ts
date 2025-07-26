import { Point, Polygon, PolygonMap } from './polygon_graph.js';

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

function printPolygonMap(pmap: PolygonMap, label: string) {
    console.log(`\n${label}:`);
    pmap.polygons.forEach((poly, idx) => {
        console.log(` Polygon #${idx}:`, poly.points.map(p => `(${p.x},${p.y})`).join(' '));
        poly.tpolygons.forEach((tp, i) => {
            console.log(`   TPolygon #${i}:`, tp.mainTriangle.map(p => `(${p.x},${p.y})`).join(' - '));
            console.log(`     Центр: (${tp.centerPoint.x}, ${tp.centerPoint.y})`);
            const conn = tp.connections.map(c => {
                const tIdx = poly.tpolygons.indexOf(c.neighbor);
                return `#${tIdx} (dist=${c.distance.toFixed(2)})`;
            });
            console.log(`     Связи:`, conn.join(', '));
        });
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

const mapA = new PolygonMap([polyA]);
const mapB = new PolygonMap([polyB]);

const unionMap = mapA.unionPolygon(mapB);
printPolygonMap(unionMap, 'unionPolygon (A ∪ B)');

const diffMap = mapA.differencePolygon(mapB);
printPolygonMap(diffMap, 'differencePolygon (A \\ B)');

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

const mapC = new PolygonMap([polyC]);
const mapD = new PolygonMap([polyD]);

const unionMapCD = mapC.unionPolygon(mapD);
printPolygonMap(unionMapCD, 'unionPolygon (C ∪ D)');

const diffMapCD = mapC.differencePolygon(mapD);
printPolygonMap(diffMapCD, 'differencePolygon (C \\ D)');


// Тесты для unionPolygon и differencePolygon с невыпуклыми многоугольниками изнутри
const polyE = new Polygon([
    new Point(2, 2),
    new Point(5, 3),
    new Point(9, 2),
    new Point(7, 4),
    new Point(8, 6),
    new Point(4, 4),
    new Point(4, 8),
    new Point(1, 5),
]);
const polyF = new Polygon([
    new Point(2, 5),
    new Point(3, 6),
    new Point(3, 4),
]);

const polyG = new Polygon([
    new Point(6, 1),
    new Point(8, 4),
    new Point(6, 7),
]);

const unionEF = polyE.unionPolygon(polyF);
console.log('\nunionPolygon (E ∪ F):', unionEF.polygons.map(poly => poly.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextPoly: '));
console.log('\nunionPolygon (E ∪ F) (holes):',
    unionEF.polygons.map(poly => poly.holes.map((hole: Polygon) => hole.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextHole: '))
        .join(' \nNextPoly: '));

const diffEF = polyE.differencePolygon(polyF);
console.log('differencePolygon (E \\ F):', diffEF.polygons.map(poly => poly.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextPoly: '));
console.log('differencePolygon (E \\ F) (holes):', diffEF.polygons.map(poly => poly.holes.map((hole: Polygon) => hole.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextHole: '))
    .join(' \nNextPoly: '));

printPolygonMap(diffEF, 'differencePolygon (E ∪ F)');


const unionEG = polyE.unionPolygon(polyG);
console.log('\nunionPolygon (E ∪ G):', unionEG.polygons.map(poly => poly.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextPoly: '));
console.log('\nunionPolygon (E ∪ G) (holes):',
    unionEG.polygons.map(poly => poly.holes.map((hole: Polygon) => hole.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextHole: '))
        .join(' \nNextPoly: '));


console.log('\n\n\n');

const diffEG = polyE.differencePolygon(polyG);
console.log('differencePolygon (E \\ G):', diffEG.polygons.map(poly => poly.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextPoly: '));
console.log('differencePolygon (E \\ G) (holes):', diffEG.polygons.map(poly => poly.holes.map((hole: Polygon) => hole.points.map((p: Point) => `(${p.x},${p.y})`).join(' ')).join(' \nNextHole: '))
    .join(' \nNextPoly: '));