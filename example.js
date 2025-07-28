// Example of using poly-math-2d library
try {
    console.log('🚀 Loading poly-math-2d library...');
    const { Point, Polygon, PolygonMap, pointInPolygon, segmentsIntersect } = require('./dist/index.js');
    console.log('✅ Library loaded successfully\n');

    // 1. Creating polygons
    console.log('📐 1. Creating polygons');
    const triangle = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(2, 3)
    ]);
    console.log(`   Triangle created: ${triangle.points.length} points`);

    const square = new Polygon([
        new Point(1, 1),
        new Point(5, 1),
        new Point(5, 5),
        new Point(1, 5)
    ]);

    console.log(`   Square created: ${square.points.length} points\n`);

    // 2. Triangulation
    console.log('🔺 2. Triangulation');
    console.log(`   Triangle: ${triangle.tpolygons.length} triangles`);
    console.log(`   Square: ${square.tpolygons.length} triangles\n`);

    const nonConvexPolygon = new Polygon([
        new Point(3, 2),
        new Point(4, -1),
        new Point(8, 3),
        new Point(8, -2),
        new Point(10, 2),
        new Point(13, 3),
        new Point(12, 7),
        new Point(7, 10),
        new Point(2, 7),
        new Point(4, 5),
    ]);

    const holePolygon = new Polygon([
        new Point(5, 5),
        new Point(7, 5),
        new Point(8, 7),
        new Point(10, 3),
    ]);

    const nonConvexPolygonWithHole = nonConvexPolygon.differencePolygon(holePolygon);
    var tPoligons = nonConvexPolygonWithHole.polygons[0].tpolygons;
    console.log(`   Polygon with hole: ${tPoligons.length} triangles`);

    function printPolygonMap(pmap, label) {
        console.log(`\n${label}:`);

        pmap.polygons.forEach((poly, idx) => {
            console.log(` Polygon #${idx}:`, poly.points.map(p => `(${p.x},${p.y})`).join(' '));
            poly.tpolygons.forEach((tp, i) => {
                console.log(`   TPolygon #${i}:`, tp.mainTriangle.map(p => `(${p.x},${p.y})`).join(' - '));
                console.log(`     Center: (${tp.centerPoint.x}, ${tp.centerPoint.y})`);
                const conn = tp.connections.map(c => {
                    const tIdx = poly.tpolygons.indexOf(c.neighbor);
                    return `#${tIdx} (dist=${c.distance.toFixed(2)})`;
                });
                console.log(`     Connections:`, conn.join(', '));
            });
        });
    }
    printPolygonMap(nonConvexPolygonWithHole, 'Polygon with hole');

    // 3. Boolean operations
    console.log('🔄 3. Boolean operations');
    try {
        const union = triangle.unionPolygon(square);
        console.log(`   Union: ${union.polygons.length} polygons`);

        const difference = square.differencePolygon(triangle);
        console.log(`   Difference: ${difference.polygons.length} polygons\n`);
    } catch (err) {
        console.log('   ❌ Error in boolean operations:', err.message);
    }

    // 4. Basic functions
    console.log('🎯 4. Geometric functions');
    const testPointIn = new Point(2, 2);
    const testPointOut = new Point(5, 5);
    const testPolygon = new Polygon(
        [
            new Point(0, 0),
            new Point(4, 0),
            new Point(4, 4),
            new Point(0, 4)
        ]
    );

    const testPolygonWithHole = new Polygon(
        [
            new Point(0, 0),
            new Point(4, 0),
            new Point(4, 4),
            new Point(0, 4)
        ],
        [
            new Polygon(
                [
                    new Point(1, 1),
                    new Point(3, 1),
                    new Point(3, 3),
                    new Point(1, 3)
                ]
            )
        ]
    );

    const isInsideIn = testPolygon.isPointInPolygon(testPointIn);
    console.log(`   Point (2,2) inside square: ${isInsideIn}`);
    const isInsideOut = testPolygon.isPointInPolygon(testPointOut);
    console.log(`   Point (5,5) inside square: ${isInsideOut}`);

    const isInsideInWithHole = testPolygonWithHole.isPointInPolygon(testPointIn);
    console.log(`   Point (2,2) inside square with hole: ${isInsideInWithHole}`);
    const isInsideOutWithHole = testPolygonWithHole.isPointInPolygon(testPointOut);
    console.log(`   Point (5,5) inside square with hole: ${isInsideOutWithHole}`);


    const isInsideInWithHoleTriangulated = testPolygonWithHole.isPointInPolygonTriangulated(testPointIn);
    console.log(`   Point (2,2) inside square with hole triangulated: ${isInsideInWithHoleTriangulated}`);
    const isInsideOutWithHoleTriangulated = testPolygonWithHole.isPointInPolygonTriangulated(testPointOut);
    console.log(`   Point (5,5) inside square with hole triangulated: ${isInsideOutWithHoleTriangulated}`);

    const intersect = segmentsIntersect(
        new Point(0, 0), new Point(4, 4),
        new Point(0, 4), new Point(4, 0)
    );
    console.log(`   Segments intersect: ${intersect}\n`);

    console.log('✅ All tests completed successfully!');
} catch (err) {
    console.log('❌ Error:', err.message);
} 