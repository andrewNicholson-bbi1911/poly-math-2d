// Тест для проверки earcut с дырками
const { Point, Polygon } = require('./dist/index.js');

function testHoles() {
    console.log('🔍 Тестирование earcut с дырками...\n');

    // Создаем внешний контур (квадрат)
    const outerPoints = [
        new Point(0, 0),
        new Point(10, 0),
        new Point(10, 10),
        new Point(0, 10)
    ];

    // Создаем дырку (маленький квадрат внутри)
    const holePoints = [
        new Point(3, 4),
        new Point(7, 3),
        new Point(7, 8),
        new Point(3, 7)
    ];
    const hole = new Polygon(holePoints);

    console.log('📐 Создаем полигон с дыркой через Polygon.createWithHoles...');

    try {
        // Используем синхронный API для создания полигона с дырками
        const polygonWithHole = Polygon.createWithHoles(outerPoints, [hole]);

        console.log(`✅ Полигон с дыркой создан успешно!`);
        console.log(`   Внешний контур: ${polygonWithHole.points.length} точек`);
        console.log(`   Дырок: ${polygonWithHole.holes.length}`);
        console.log(`   Треугольников: ${polygonWithHole.tpolygons.length}`);

        // Выводим информацию о треугольниках
        console.log('\n🔺 Треугольники:');
        polygonWithHole.tpolygons.forEach((tpoly, i) => {
            const triangle = tpoly.mainTriangle;
            console.log(`   #${i}: (${triangle[0].x},${triangle[0].y}) - (${triangle[1].x},${triangle[1].y}) - (${triangle[2].x},${triangle[2].y})`);
        });

        console.log('\n✅ Тест завершен успешно!');

    } catch (error) {
        console.error('❌ Ошибка при создании полигона с дыркой:', error.message);
        console.error(error.stack);
    }
}

// Запускаем тест
testHoles(); 