# poly-math-2d

Библиотека для работы с 2D-многоугольниками: булевы операции (union, difference), триангуляция (с поддержкой дырок), графы смежности, поддержка выпуклых и невыпуклых фигур.

## Возможности
- ✅ Булевы операции над многоугольниками (union, difference) с поддержкой дырок
- ✅ Триангуляция с учётом дырок (earcut)
- ✅ Построение графа смежности треугольников (TPolygon)
- ✅ Поддержка PolygonMap (множество полигонов)
- ✅ Базовые геометрические операции (пересечения, выпуклые оболочки)
- ✅ TypeScript поддержка

## Установка
```bash
npm install poly-math-2d
```

## API

### Основные классы

#### `Point`
```ts
class Point {
    constructor(public x: number, public y: number) {}
}
```

#### `Polygon`
```ts
class Polygon {
    points: Point[];
    tpolygons: TPolygon[];  // Триангуляция
    holes: Polygon[];       // Внутренние дырки
    
    constructor(points: Point[], holes: Polygon[] = []);
    static createWithHoles(points: Point[], holes: Polygon[] = []): Polygon; // Поддержка дырок через earcut
    isConvex(): boolean;
    unionPolygon(other: Polygon): PolygonMap;
    differencePolygon(other: Polygon): PolygonMap;
}
```

#### `PolygonMap`
```ts
class PolygonMap {
    polygons: Polygon[];
    
    constructor(polygons: Polygon[] = []);
    unionPolygon(other: PolygonMap): PolygonMap;
    differencePolygon(other: PolygonMap): PolygonMap;
}
```

#### `TPolygon` (Треугольный полигон)
```ts
class TPolygon {
    mainTriangle: Triangle;
    centerPoint: Point;
    connections: TPolygonConnection[];  // Связи с соседними треугольниками
}
```

### Базовые геометрические функции

```ts
// Из модуля poly2d
export function pointInPolygon(point: Point, polygon: Point[]): boolean;
export function segmentsIntersect(a1: Point, a2: Point, b1: Point, b2: Point): boolean;
export function polygonIntersectsPolygon(poly1: Point[], poly2: Point[]): boolean;
export function convexUnion(poly1: Point[], poly2: Point[]): Point[];
export function convexDifference(subject: Point[], clip: Point[]): Point[][];
```

## Примеры использования

### Простые булевы операции
```ts
import { Point, Polygon, PolygonMap } from 'poly-math-2d';

// Создание многоугольников
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

// Объединение
const union = polyA.unionPolygon(polyB);
console.log('Union result:', union.polygons.length, 'polygons');

// Разность
const difference = polyA.differencePolygon(polyB);
console.log('Difference result:', difference.polygons.length, 'polygons');
```

### Работа с дырками
```ts
// Создание полигона с дыркой
const outer = [
  new Point(0, 0),
  new Point(10, 0),
  new Point(10, 10),
  new Point(0, 10)
];

const hole = new Polygon([
  new Point(3, 3),
  new Point(7, 3),
  new Point(7, 7),
  new Point(3, 7)
]);

// Использование earcut для правильной триангуляции с дырками
const polygonWithHole = Polygon.createWithHoles(outer, [hole]);
console.log('Triangles:', polygonWithHole.tpolygons.length); // 8 треугольников

// Обычный конструктор использует простую триангуляцию (без поддержки дырок)
const simplePolygon = new Polygon(outer, [hole]);
console.log('Triangles:', simplePolygon.tpolygons.length); // 2 треугольника (игнорирует дырки)
```

### Работа с PolygonMap
```ts
const mapA = new PolygonMap([polyA]);
const mapB = new PolygonMap([polyB]);

// Объединение карт полигонов
const unionMap = mapA.unionPolygon(mapB);

// Разность карт полигонов
const diffMap = mapA.differencePolygon(mapB);

// Перебор всех полигонов в результате
unionMap.polygons.forEach((poly, i) => {
    console.log(`Polygon ${i}:`, poly.points.length, 'points');
    console.log(`Triangles:`, poly.tpolygons.length);
});
```

### Триангуляция и граф смежности
```ts
const polygon = new Polygon([
  new Point(0, 0),
  new Point(5, 0),
  new Point(5, 3),
  new Point(2, 3),
  new Point(2, 5),
  new Point(0, 5)
]);

// Автоматическая триангуляция
console.log('Triangles count:', polygon.tpolygons.length);

// Граф смежности треугольников
polygon.tpolygons.forEach((tpoly, i) => {
    console.log(`Triangle ${i} center:`, tpoly.centerPoint);
    console.log(`Neighbors:`, tpoly.connections.length);
    
    tpoly.connections.forEach(conn => {
        console.log(`  -> distance: ${conn.distance}`);
    });
});
```

### Базовые геометрические операции
```ts
import { pointInPolygon, segmentsIntersect, convexUnion } from 'poly-math-2d';

const point = new Point(2, 2);
const polygon = [
  new Point(0, 0),
  new Point(4, 0),
  new Point(4, 4),
  new Point(0, 4)
];

// Проверка точки в полигоне
if (pointInPolygon(point, polygon)) {
    console.log('Point is inside polygon');
}

// Пересечение отрезков
const seg1Start = new Point(0, 0);
const seg1End = new Point(4, 4);
const seg2Start = new Point(0, 4);
const seg2End = new Point(4, 0);

if (segmentsIntersect(seg1Start, seg1End, seg2Start, seg2End)) {
    console.log('Segments intersect');
}

// Выпуклая оболочка (для выпуклых полигонов)
const poly1 = [new Point(0, 0), new Point(2, 0), new Point(1, 2)];
const poly2 = [new Point(1, 1), new Point(3, 1), new Point(2, 3)];
const hull = convexUnion(poly1, poly2);
console.log('Convex hull:', hull);
```

## Сборка

```bash
npm run build
```

## Структура проекта

```
poly-math-2d/
├── src/
│   ├── index.ts          # Главная точка входа
│   ├── polygon.ts        # Основные классы (Polygon, PolygonMap, TPolygon)
│   └── poly2d.ts         # Базовые геометрические функции
├── dist/                 # Скомпилированные файлы
├── package.json
├── tsconfig.json
└── README.md
```

## Лицензия
MIT 