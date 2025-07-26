declare module 'polygon-clipping' {
    export function union(...polygons: number[][][][]): number[][][];
    export function difference(subject: number[][][], ...clips: number[][][][]): number[][][];
    export function intersection(...polygons: number[][][][]): number[][][];
    export function xor(...polygons: number[][][][]): number[][][];
} 