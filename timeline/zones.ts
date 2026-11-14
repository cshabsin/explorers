// Zone map for the deck plan: rooms and hallway segments as polygons in
// deck-plan.png pixel coordinates, plus an adjacency graph used to route
// characters along hallways when they move between zones.
import data from './zones.json';

export type Point = [number, number];

export interface Zone {
    id: string;
    name: string;
    kind: 'room' | 'hall';
    points: Point[];
    // Where a character stands / routes pass through. Defaults to the vertex average.
    anchor: Point;
}

export const PLAN_SIZE = data.image;

export const ZONES: Zone[] = data.zones.map(z => ({
    id: z.id,
    name: z.name,
    kind: z.kind as Zone['kind'],
    points: z.points as Point[],
    anchor: ('anchor' in z ? z.anchor : average(z.points as Point[])) as Point,
}));

export const ZONES_BY_ID: Map<string, Zone> = new Map(ZONES.map(z => [z.id, z]));

const neighbors: Map<string, string[]> = new Map(ZONES.map(z => [z.id, []]));
for (const [a, b] of data.edges) {
    if (!neighbors.has(a) || !neighbors.has(b)) {
        throw new Error(`zones.json edge references unknown zone: ${a} - ${b}`);
    }
    neighbors.get(a)!.push(b);
    neighbors.get(b)!.push(a);
}

function average(points: Point[]): Point {
    const sx = points.reduce((s, p) => s + p[0], 0);
    const sy = points.reduce((s, p) => s + p[1], 0);
    return [sx / points.length, sy / points.length];
}

// Shortest route (fewest zones) from one zone to another, inclusive of both ends.
// Returns null if unreachable.
export function route(fromId: string, toId: string): Zone[] | null {
    if (!ZONES_BY_ID.has(fromId) || !ZONES_BY_ID.has(toId)) return null;
    const prev = new Map<string, string | null>([[fromId, null]]);
    const queue = [fromId];
    while (queue.length) {
        const cur = queue.shift()!;
        if (cur === toId) break;
        for (const n of neighbors.get(cur)!) {
            if (!prev.has(n)) {
                prev.set(n, cur);
                queue.push(n);
            }
        }
    }
    if (!prev.has(toId)) return null;
    const path: Zone[] = [];
    for (let id: string | null = toId; id !== null; id = prev.get(id)!) {
        path.unshift(ZONES_BY_ID.get(id)!);
    }
    return path;
}
