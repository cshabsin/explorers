// Pure timeline logic (no Firestore / DOM): ordering of points, resolving
// where each unit is at a point, and detecting past/future encounters.
import { route } from './zones.js';

export interface TimelinePoint {
    id: string;
    label: string;   // short code shown on the strip, e.g. "A", "0", "R"
    name: string;    // e.g. "arrival"
    order: number;   // sort key; inserted points get the midpoint of their neighbors
}

export type UnitGroup = 'past' | 'future' | 'other';

export interface Unit {
    id: string;
    name: string;
    short: string;   // token label
    group: UnitGroup;
    color: string;
    order: number;
}

// An explicit placement of a unit at a point. zone === null means "off map".
export interface Placement {
    unit: string;
    point: string;
    zone: string | null;
}

export interface ResolvedPosition {
    zone: string | null;   // null = off map / not yet present
    explicit: boolean;     // set at this point (vs. carried forward)
}

export function placementId(unitId: string, pointId: string): string {
    return `${unitId}__${pointId}`;
}

export function sortPoints(points: TimelinePoint[]): TimelinePoint[] {
    return [...points].sort((a, b) => a.order - b.order);
}

// Sort key for a point inserted after `index` in the sorted list (-1 = at the start).
export function orderForInsert(sorted: TimelinePoint[], index: number): number {
    const before = index >= 0 ? sorted[index]?.order : undefined;
    const after = sorted[index + 1]?.order;
    if (before === undefined && after === undefined) return 1;
    if (before === undefined) return after! - 1;
    if (after === undefined) return before + 1;
    return (before + after) / 2;
}

// Position of every unit at each point. A unit with no placement at a point
// stays where it was at the previous point; before its first placement it is off map.
export function resolvePositions(
    sortedPoints: TimelinePoint[],
    units: Unit[],
    placements: Map<string, Placement>,
): Map<string, Map<string, ResolvedPosition>> {
    const byPoint = new Map<string, Map<string, ResolvedPosition>>();
    const last = new Map<string, string | null>();
    for (const p of sortedPoints) {
        const here = new Map<string, ResolvedPosition>();
        for (const u of units) {
            const pl = placements.get(placementId(u.id, p.id));
            if (pl) {
                last.set(u.id, pl.zone);
                here.set(u.id, { zone: pl.zone, explicit: true });
            } else {
                here.set(u.id, { zone: last.get(u.id) ?? null, explicit: false });
            }
        }
        byPoint.set(p.id, here);
    }
    return byPoint;
}

export interface Encounter {
    kind: 'same-zone' | 'crossing';
    zone: string;
    past: string[];    // unit ids
    future: string[];  // unit ids
}

// Past and future units in the same zone at a point.
export function encountersAt(positions: Map<string, ResolvedPosition>, units: Unit[]): Encounter[] {
    const byZone = new Map<string, { past: string[], future: string[] }>();
    for (const u of units) {
        if (u.group === 'other') continue;
        const zone = positions.get(u.id)?.zone;
        if (!zone) continue;
        if (!byZone.has(zone)) byZone.set(zone, { past: [], future: [] });
        byZone.get(zone)![u.group].push(u.id);
    }
    const out: Encounter[] = [];
    for (const [zone, g] of byZone) {
        if (g.past.length && g.future.length) out.push({ kind: 'same-zone', zone, ...g });
    }
    return out;
}

// Zones a unit occupies while moving from one position to the next
// (its whole route, or just its zone if it stays put).
export function zonesDuringMove(from: string | null, to: string | null): string[] {
    if (from && to) return (route(from, to) ?? [{ id: from }, { id: to }]).map(z => z.id);
    if (to) return [to];
    if (from) return [from];
    return [];
}

// Zones a past and a future unit both pass through while moving between two
// consecutive points. Coarse: it ignores where along the route each one is,
// so treat these as "possible" encounters.
export function encountersDuringMove(
    before: Map<string, ResolvedPosition>,
    after: Map<string, ResolvedPosition>,
    units: Unit[],
): Encounter[] {
    const byZone = new Map<string, { past: Set<string>, future: Set<string> }>();
    for (const u of units) {
        if (u.group === 'other') continue;
        for (const zone of zonesDuringMove(before.get(u.id)?.zone ?? null, after.get(u.id)?.zone ?? null)) {
            if (!byZone.has(zone)) byZone.set(zone, { past: new Set(), future: new Set() });
            byZone.get(zone)![u.group].add(u.id);
        }
    }
    const out: Encounter[] = [];
    for (const [zone, g] of byZone) {
        if (g.past.size && g.future.size) {
            out.push({ kind: 'crossing', zone, past: [...g.past], future: [...g.future] });
        }
    }
    return out;
}

// Initial data for a new timeline.
export const DEFAULT_POINTS: Array<[string, string]> = [
    ["A", "arrival"], ["B", "split"], ["C", "tour"], ["D", "quarters"], ["E", "debrief"],
    ["F", "crawl"], ["0", "charges go off"], ["1", "berserk"], ["2", "coordinate"],
    ["3", "clones"], ["4", "biologics"], ["I", "IPM"], ["R", "reactor call"],
    ["K", "catwalk"], ["N", "engines"], ["Z", "blast"],
];

const PARTY: Array<[string, string, string]> = [
    ["stefan", "Stefan", "#e6194b"],
    ["marian", "Marian", "#3cb44b"],
    ["chi", "Chi", "#4363d8"],
    ["zed", "Zed", "#f58231"],
    ["threnody", "Threnody", "#911eb4"],
];

export function defaultUnits(): Unit[] {
    const units: Unit[] = [];
    let order = 0;
    for (const group of ['past', 'future'] as const) {
        for (const [id, name, color] of PARTY) {
            units.push({
                id: `${group}-${id}`,
                name: `${name} (${group})`,
                short: name.slice(0, 2),
                group, color, order: order++,
            });
        }
    }
    units.push({ id: "jim-wren", name: "Jim Wren", short: "JW", group: 'other', color: "#808000", order: order++ });
    units.push({ id: "leonard-vance", name: "Leonard Vance", short: "LV", group: 'other', color: "#008080", order: order++ });
    units.push({ id: "ships-crew", name: "Ship's Crew", short: "SC", group: 'other', color: "#555555", order: order++ });
    return units;
}
