// Пример использования библиотеки poly-math-2d
try {
    console.log('🚀 Загружаем библиотеку poly-math-2d...');
    const { Point, Polygon, PolygonMap, pointInPolygon, segmentsIntersect } = require('./dist/index.js');
    console.log('✅ Библиотека загружена успешно\n');

    // 1. Создание полигонов
    console.log('📐 1. Создание полигонов');
    const triangle = new Polygon([
        new Point(0, 0),
        new Point(4, 0),
        new Point(2, 3)
    ]);
    console.log(`   Треугольник создан: ${triangle.points.length} точек`);

    const square = new Polygon([
        new Point(1, 1),
        new Point(5, 1),
        new Point(5, 5),
        new Point(1, 5)
    ]);

    console.log(`   Квадрат создан: ${square.points.length} точек\n`);

    // 2. Триангуляция
    console.log('🔺 2. Триангуляция');
    console.log(`   Треугольник: ${triangle.tpolygons.length} треугольников`);
    console.log(`   Квадрат: ${square.tpolygons.length} треугольников\n`);

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
    console.log(`   Полигон с дырой: ${tPoligons.length} треугольников`);

    function printPolygonMap(pmap, label) {
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
    printPolygonMap(nonConvexPolygonWithHole, 'Полигон с дырой');

    // 3. Булевы операции
    console.log('🔄 3. Булевы операции');
    try {
        const union = triangle.unionPolygon(square);
        console.log(`   Объединение: ${union.polygons.length} полигонов`);

        const difference = square.differencePolygon(triangle);
        console.log(`   Разность: ${difference.polygons.length} полигонов\n`);
    } catch (err) {
        console.log('   ❌ Ошибка в булевых операциях:', err.message);
    }

    // 4. Базовые функции
    console.log('🎯 4. Геометрические функции');
    const testPoint = new Point(2, 2);
    const testPolygon = [
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4)
    ];

    const isInside = pointInPolygon(testPoint, testPolygon);
    console.log(`   Точка (2,2) внутри квадрата: ${isInside}`);

    const intersect = segmentsIntersect(
        new Point(0, 0), new Point(4, 4),
        new Point(0, 4), new Point(4, 0)
    );
    console.log(`   Отрезки пересекаются: ${intersect}\n`);

    console.log('✅ Все тесты пройдены успешно!');

} catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error(error.stack);
} 