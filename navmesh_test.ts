import { NavMeshLayer, Point } from './navmesh.js';

// Исходный квадрат 10x10
const basePoly: Point[] = [
    new Point(0, 0),
    new Point(10, 0),
    new Point(10, 10),
    new Point(0, 10),
    new Point(0, 0)
];

// Препятствие — маленький квадрат внутри
const obstaclePoly: Point[] = [
    new Point(3, 3),
    new Point(7, 3),
    new Point(7, 7),
    new Point(3, 7),
    new Point(3, 3)
];

// Мост — маленький квадрат, примыкающий к краю
const bridgePoly: Point[] = [
    new Point(8, 8),
    new Point(12, 8),
    new Point(12, 12),
    new Point(8, 12),
    new Point(8, 8)
];

const layer = new NavMeshLayer(1);
layer.setInitialPolygons([basePoly]);

console.log('Исходные полигоны:', JSON.stringify(layer.polygons));

const obsId = layer.addObstacle(obstaclePoly);
console.log('После добавления препятствия:', JSON.stringify(layer.polygons));

const bridgeId = layer.addBridge(bridgePoly);
console.log('После добавления моста:', JSON.stringify(layer.polygons));

layer.removeObstacle(obsId);
console.log('После удаления препятствия:', JSON.stringify(layer.polygons));

layer.removeBridge(bridgeId);
console.log('После удаления моста:', JSON.stringify(layer.polygons));

// --- Тесты поиска пути ---
layer.setInitialPolygons([basePoly]);
layer.addObstacle(obstaclePoly);
layer.addBridge(bridgePoly);

// 1. Путь внутри исходного квадрата (обходит препятствие)
const start1 = new Point(1, 1);
const end1 = new Point(9, 1);
const path1 = layer.getPath(start1, end1);
console.log('Путь внутри исходного полигона:', path1.map((p: Point) => `(${p.x},${p.y})`).join(' -> '));

// 2. Путь через мост (из квадрата в мост)
const start2 = new Point(1, 1);
const end2 = new Point(9, 11);
const path2 = layer.getPath(start2, end2);
console.log('Путь через мост:', path2.map((p: Point) => `(${p.x},${p.y})`).join(' -> '));

// 3. Путь невозможен (точка вне навмеша)
const start3 = new Point(-5, -5);
const end3 = new Point(5, 5);
const path3 = layer.getPath(start3, end3);
console.log('Путь невозможен (start вне):', path3);

const start4 = new Point(5, 5);
const end4 = new Point(20, 20);
const path4 = layer.getPath(start4, end4);
console.log('Путь невозможен (end вне):', path4); 