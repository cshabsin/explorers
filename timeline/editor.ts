// Timeline editor: units (past party, future party, NPCs) placed in deck-plan
// zones at discrete timeline points, animated along hallway routes between
// points, with warnings where past and future selves could meet.
// timeline.ts decides which timeline to open and whether it's editable.
import { makeSVG } from '../util.js';
import planUrl from './deck-plan.png';
import { PLAN_SIZE, ZONES, ZONES_BY_ID, Point, route } from './zones.js';
import {
    TimelinePoint, Unit, Placement, ResolvedPosition, Encounter,
    sortPoints, orderForInsert, resolvePositions, encountersAt, encountersDuringMove, placementId,
} from './timeline-model.js';
import { TimelineStore } from './store.js';

const MOVE_MS = 1500;
const TOKEN_R = 14;
const SLOT_SPACING = 31;

let store: TimelineStore;

// ---- State ----

let points: TimelinePoint[] = [];     // sorted
let units: Unit[] = [];
let placements = new Map<string, Placement>();
let positions = new Map<string, Map<string, ResolvedPosition>>();  // pointId -> unitId -> position
let currentPointId: string | null = null;
let selectedUnitId: string | null = null;
let canEdit = false;
let animating = false;
let playing = false;

const el = (id: string) => document.getElementById(id)!;

// ---- SVG scaffold ----

const svg = makeSVG("svg", {
    width: PLAN_SIZE.width,
    height: PLAN_SIZE.height,
    viewBox: `0 0 ${PLAN_SIZE.width} ${PLAN_SIZE.height}`,
});
svg.append(makeSVG("image", { href: planUrl, x: 0, y: 0, width: PLAN_SIZE.width, height: PLAN_SIZE.height }));
const zoneLayer = makeSVG("g", {});
const moveLayer = makeSVG("g", {});
const tokenLayer = makeSVG("g", {});
svg.append(zoneLayer, moveLayer, tokenLayer);
el("plan-container").append(svg);

// "Fit" scales the plan to the container width; "100%" shows it at image size.
function applyZoom() {
    const fit = (el("zoom") as HTMLSelectElement).value === "fit";
    svg.setAttribute("width", fit ? "100%" : String(PLAN_SIZE.width));
    svg.setAttribute("height", fit ? "100%" : String(PLAN_SIZE.height));
    el("plan-container").classList.toggle("fit", fit);
}
el("zoom").addEventListener("change", applyZoom);
applyZoom();

const zoneElems = new Map<string, SVGElement>();
for (const zone of ZONES) {
    const poly = makeSVG("polygon", {
        points: zone.points.map(p => p.join(",")).join(" "),
        "class": `zone zone-${zone.kind}`,
    });
    poly.addEventListener("mouseenter", () => { el("zone-readout").textContent = zone.name; });
    poly.addEventListener("mouseleave", () => { el("zone-readout").textContent = ""; });
    poly.addEventListener("click", () => onZoneClick(zone.id));
    zoneLayer.append(poly);
    zoneElems.set(zone.id, poly);
}

const tokens = new Map<string, SVGGElement>();

function makeToken(u: Unit): SVGGElement {
    const g = makeSVG("g", { "class": "token" }) as SVGGElement;
    if (u.group === 'other') {
        g.append(makeSVG("rect", {
            x: -TOKEN_R, y: -TOKEN_R, width: 2 * TOKEN_R, height: 2 * TOKEN_R, rx: 3,
            fill: u.color, stroke: "white", "stroke-width": 1.5,
        }));
    } else if (u.group === 'past') {
        // Past selves: hollow ring.
        g.append(makeSVG("circle", { r: TOKEN_R, fill: "white", stroke: u.color, "stroke-width": 4 }));
    } else {
        // Future selves: solid.
        g.append(makeSVG("circle", { r: TOKEN_R, fill: u.color, stroke: "white", "stroke-width": 1.5 }));
    }
    const text = makeSVG("text", { fill: u.group === 'past' ? u.color : "white" });
    text.textContent = u.short;
    g.append(text);
    const title = makeSVG("title", {});
    title.textContent = u.name;
    g.append(title);
    return g;
}

// ---- Geometry ----

// Token positions at a point: units sharing a zone are laid out in a small grid around its anchor.
function slotsAt(pointId: string): Map<string, Point | null> {
    const pos = positions.get(pointId);
    const byZone = new Map<string, Unit[]>();
    const out = new Map<string, Point | null>();
    for (const u of units) {
        const zone = pos?.get(u.id)?.zone ?? null;
        out.set(u.id, null);
        if (!zone || !ZONES_BY_ID.has(zone)) continue;
        if (!byZone.has(zone)) byZone.set(zone, []);
        byZone.get(zone)!.push(u);
    }
    for (const [zoneId, occupants] of byZone) {
        const [ax, ay] = ZONES_BY_ID.get(zoneId)!.anchor;
        const perRow = Math.min(occupants.length, 4);
        const rows = Math.ceil(occupants.length / 4);
        occupants.forEach((u, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            out.set(u.id, [
                ax + (col - (perRow - 1) / 2) * SLOT_SPACING,
                ay + (row - (rows - 1) / 2) * SLOT_SPACING,
            ]);
        });
    }
    return out;
}

// Polyline a unit follows between two points: its slot, the anchors of the
// zones it passes through, then its new slot.
function movePath(fromZone: string, toZone: string, from: Point, to: Point): Point[] {
    if (fromZone === toZone) return [from, to];
    const path = route(fromZone, toZone);
    const middle = path ? path.slice(1, -1).map(z => z.anchor) : [];
    return [from, ...middle, to];
}

function pointAlong(path: Point[], t: number): Point {
    const lens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
    const total = lens.reduce((a, b) => a + b, 0);
    if (total === 0) return path[path.length - 1];
    let d = t * total;
    for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i] || i === lens.length - 1) {
            const f = lens[i] === 0 ? 1 : Math.min(d / lens[i], 1);
            return [path[i][0] + f * (path[i + 1][0] - path[i][0]), path[i][1] + f * (path[i + 1][1] - path[i][1])];
        }
        d -= lens[i];
    }
    return path[path.length - 1];
}

function setToken(unitId: string, p: Point | null, opacity = 1) {
    const g = tokens.get(unitId);
    if (!g) return;
    if (!p) {
        g.setAttribute("display", "none");
        return;
    }
    g.removeAttribute("display");
    g.setAttribute("transform", `translate(${p[0]},${p[1]})`);
    g.setAttribute("opacity", String(opacity));
}

// ---- Rendering ----

function currentIndex(): number {
    return points.findIndex(p => p.id === currentPointId);
}

function encountersFor(index: number): { here: Encounter[], moving: Encounter[] } {
    const p = points[index];
    if (!p) return { here: [], moving: [] };
    const here = encountersAt(positions.get(p.id)!, units);
    // Skip crossings in zones already flagged as a same-zone conflict at this point.
    const hereZones = new Set(here.map(e => e.zone));
    const moving = index > 0
        ? encountersDuringMove(positions.get(points[index - 1].id)!, positions.get(p.id)!, units)
            .filter(e => !hereZones.has(e.zone))
        : [];
    return { here, moving };
}

function render() {
    renderStrip();
    renderPointPanel();
    renderUnits();
    renderZones();
    if (!animating) {
        placeTokensAt(currentPointId);
        renderMoves();
    }
}

function renderStrip() {
    const strip = el("strip");
    strip.replaceChildren();
    const insertButton = (afterIndex: number) => {
        const b = document.createElement("button");
        b.className = "insert-button";
        b.textContent = "+";
        b.title = "Insert a point here";
        b.addEventListener("click", () => insertPoint(afterIndex));
        return b;
    };
    if (canEdit) strip.append(insertButton(-1));
    points.forEach((p, i) => {
        const chip = document.createElement("button");
        chip.className = "point-chip";
        chip.textContent = p.label;
        chip.title = p.name;
        if (p.id === currentPointId) chip.classList.add("current");
        const { here, moving } = encountersFor(i);
        if (here.length) chip.classList.add("conflict");
        else if (moving.length) chip.classList.add("warn");
        chip.addEventListener("click", () => { stopPlaying(); goTo(i, false); });
        strip.append(chip);
        if (canEdit) strip.append(insertButton(i));
    });
}

function unitName(id: string): string {
    return units.find(u => u.id === id)?.name ?? id;
}

function zoneName(id: string | null): string {
    if (!id) return "off map";
    return ZONES_BY_ID.get(id)?.name ?? id;
}

function renderPointPanel() {
    const i = currentIndex();
    const p = points[i];
    if (!p) return;
    el("point-title").textContent = `${p.label} — ${p.name}`;
    el("point-editor").style.display = canEdit ? "flex" : "none";
    const label = el("point-label") as HTMLInputElement;
    const name = el("point-name") as HTMLInputElement;
    if (document.activeElement !== label) label.value = p.label;
    if (document.activeElement !== name) name.value = p.name;

    el("placement-help").style.display = canEdit ? "block" : "none";
    (el("off-map-button") as HTMLButtonElement).disabled = !selectedUnitId;
    (el("inherit-button") as HTMLButtonElement).disabled =
        !selectedUnitId || !placements.has(placementId(selectedUnitId, p.id));

    const box = el("encounters");
    box.replaceChildren();
    const { here, moving } = encountersFor(i);
    const describe = (e: Encounter) =>
        `${e.past.map(unitName).join(", ")} / ${e.future.map(unitName).join(", ")}`;
    for (const e of here) {
        const div = document.createElement("div");
        div.className = "encounter same-zone";
        div.textContent = `⚠ Same zone — ${zoneName(e.zone)}: ${describe(e)}`;
        box.append(div);
    }
    for (const e of moving) {
        const div = document.createElement("div");
        div.className = "encounter crossing";
        div.textContent = `Possible crossing on the way here — ${zoneName(e.zone)}: ${describe(e)}`;
        box.append(div);
    }
}

function renderUnits() {
    const box = el("units");
    box.replaceChildren();
    const p = points[currentIndex()];
    const pos = p ? positions.get(p.id) : undefined;
    const groups: Array<[Unit['group'], string]> = [["past", "Past party"], ["future", "Future party"], ["other", "Others"]];
    for (const [group, title] of groups) {
        const members = units.filter(u => u.group === group);
        if (!members.length) continue;
        const section = document.createElement("div");
        section.className = "unit-group";
        const h = document.createElement("h3");
        h.textContent = title;
        section.append(h);
        for (const u of members) {
            const row = document.createElement("div");
            row.className = "unit-row";
            if (u.id === selectedUnitId) row.classList.add("selected");
            const swatch = document.createElement("span");
            swatch.className = "unit-swatch";
            if (u.group === 'past') {
                swatch.style.border = `3px solid ${u.color}`;
                swatch.style.background = "white";
            } else {
                swatch.style.background = u.color;
                if (u.group === 'other') swatch.style.borderRadius = "3px";
            }
            const name = document.createElement("span");
            name.className = "unit-name";
            name.textContent = u.name;
            const zone = document.createElement("span");
            const rp = pos?.get(u.id);
            zone.className = "unit-zone" + (rp?.explicit ? "" : " carried");
            zone.textContent = zoneName(rp?.zone ?? null);
            if (rp && !rp.explicit) zone.title = "Carried over from an earlier point";
            row.append(swatch, name, zone);
            row.addEventListener("click", () => {
                selectedUnitId = selectedUnitId === u.id ? null : u.id;
                render();
            });
            section.append(row);
        }
        box.append(section);
    }
}

function renderZones() {
    for (const poly of zoneElems.values()) poly.classList.remove("conflict", "crossing");
    const { here, moving } = encountersFor(currentIndex());
    for (const e of moving) zoneElems.get(e.zone)?.classList.add("crossing");
    for (const e of here) zoneElems.get(e.zone)?.classList.add("conflict");
}

function syncTokens() {
    const ids = new Set(units.map(u => u.id));
    for (const [id, g] of tokens) {
        if (!ids.has(id)) { g.remove(); tokens.delete(id); }
    }
    for (const u of units) {
        tokens.get(u.id)?.remove();
        const g = makeToken(u);
        tokens.set(u.id, g);
        tokenLayer.append(g);
    }
}

function placeTokensAt(pointId: string | null) {
    const slots = pointId ? slotsAt(pointId) : new Map<string, Point | null>();
    for (const u of units) {
        setToken(u.id, slots.get(u.id) ?? null);
        tokens.get(u.id)?.classList.toggle("selected", u.id === selectedUnitId);
    }
}

// Dashed lines showing how each unit got to the current point from the previous one.
function renderMoves() {
    moveLayer.replaceChildren();
    const i = currentIndex();
    if (i <= 0 || !(el("show-moves") as HTMLInputElement).checked) return;
    const before = positions.get(points[i - 1].id)!;
    const after = positions.get(points[i].id)!;
    const fromSlots = slotsAt(points[i - 1].id);
    const toSlots = slotsAt(points[i].id);
    for (const u of units) {
        const fz = before.get(u.id)?.zone, tz = after.get(u.id)?.zone;
        const from = fromSlots.get(u.id), to = toSlots.get(u.id);
        if (!fz || !tz || fz === tz || !from || !to) continue;
        moveLayer.append(makeSVG("polyline", {
            points: movePath(fz, tz, from, to).map(p => p.join(",")).join(" "),
            "class": "move-line",
            stroke: u.color,
            "stroke-dasharray": u.group === 'past' ? "8 5" : u.group === 'future' ? "none" : "2 4",
        }));
    }
}

// ---- Navigation and animation ----

async function goTo(index: number, animate: boolean) {
    if (index < 0 || index >= points.length || animating) return;
    const fromIndex = currentIndex();
    currentPointId = points[index].id;
    if (animate && fromIndex >= 0 && index === fromIndex + 1) {
        moveLayer.replaceChildren();
        await animateMove(points[fromIndex].id, points[index].id);
    }
    render();
}

function animateMove(fromPointId: string, toPointId: string): Promise<void> {
    const before = positions.get(fromPointId)!;
    const after = positions.get(toPointId)!;
    const fromSlots = slotsAt(fromPointId);
    const toSlots = slotsAt(toPointId);
    const plans = units.map(u => {
        const fz = before.get(u.id)?.zone ?? null, tz = after.get(u.id)?.zone ?? null;
        const from = fromSlots.get(u.id) ?? null, to = toSlots.get(u.id) ?? null;
        if (from && to && fz && tz) return { id: u.id, path: movePath(fz, tz, from, to), fade: 0 };
        if (to) return { id: u.id, path: [to], fade: 1 };     // appears
        if (from) return { id: u.id, path: [from], fade: -1 }; // disappears
        return { id: u.id, path: null, fade: 0 };
    });
    animating = true;
    return new Promise(resolve => {
        const start = performance.now();
        const frame = (now: number) => {
            const t = Math.min((now - start) / MOVE_MS, 1);
            const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            for (const plan of plans) {
                if (!plan.path) { setToken(plan.id, null); continue; }
                const opacity = plan.fade === 1 ? t : plan.fade === -1 ? 1 - t : 1;
                setToken(plan.id, pointAlong(plan.path, eased), opacity);
            }
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                animating = false;
                resolve();
            }
        };
        requestAnimationFrame(frame);
    });
}

async function play() {
    if (playing) { stopPlaying(); return; }
    if (currentIndex() >= points.length - 1) await goTo(0, false);
    playing = true;
    el("play-button").textContent = "Stop";
    while (playing && currentIndex() < points.length - 1) {
        await goTo(currentIndex() + 1, true);
        if (playing) await new Promise(r => setTimeout(r, 400));
    }
    stopPlaying();
}

function stopPlaying() {
    playing = false;
    el("play-button").textContent = "Play";
}

el("prev-button").addEventListener("click", () => { stopPlaying(); goTo(currentIndex() - 1, false); });
el("next-button").addEventListener("click", () => { stopPlaying(); goTo(currentIndex() + 1, true); });
el("play-button").addEventListener("click", play);
el("show-moves").addEventListener("change", renderMoves);
document.addEventListener("keydown", e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    if (!store) return;
    if (e.key === "ArrowLeft") { stopPlaying(); goTo(currentIndex() - 1, false); }
    if (e.key === "ArrowRight") { stopPlaying(); goTo(currentIndex() + 1, true); }
    if (e.key === "Escape") { selectedUnitId = null; render(); }
});

// ---- Editing ----

async function withErrors(action: () => Promise<void>) {
    try {
        await action();
    } catch (e) {
        alert(`Couldn't save: ${(e as Error).message}`);
    }
}

function onZoneClick(zoneId: string) {
    const p = points[currentIndex()];
    if (!canEdit || !selectedUnitId || !p) return;
    withErrors(() => store.place(selectedUnitId!, p.id, zoneId));
}

el("off-map-button").addEventListener("click", () => {
    const p = points[currentIndex()];
    if (selectedUnitId && p) withErrors(() => store.place(selectedUnitId!, p.id, null));
});

el("inherit-button").addEventListener("click", () => {
    const p = points[currentIndex()];
    if (selectedUnitId && p) withErrors(() => store.clearPlacement(selectedUnitId!, p.id));
});

function insertPoint(afterIndex: number) {
    const label = prompt("Label for the new point (e.g. C2):")?.trim();
    if (!label) return;
    const name = prompt(`Description for ${label}:`)?.trim() ?? "";
    withErrors(() => store.addPoint(label, name, orderForInsert(points, afterIndex)));
}

el("point-save").addEventListener("click", () => {
    const p = points[currentIndex()];
    if (!p) return;
    const label = (el("point-label") as HTMLInputElement).value.trim();
    const name = (el("point-name") as HTMLInputElement).value.trim();
    if (label) withErrors(() => store.updatePoint(p.id, { label, name }));
});

el("point-delete").addEventListener("click", () => {
    const i = currentIndex();
    const p = points[i];
    if (!p || !confirm(`Delete point ${p.label} (${p.name}) and every placement made at it?`)) return;
    currentPointId = points[i - 1]?.id ?? points[i + 1]?.id ?? null;
    withErrors(() => store.deletePoint(p.id));
});

// ---- Entry points ----

// Starts showing (and listening to) one timeline.
export function startEditor(timelineStore: TimelineStore, onError: (e: Error) => void) {
    store = timelineStore;
    store.subscribe(data => {
        const unitsChanged = data.units.map(u => JSON.stringify(u)).join() !== units.map(u => JSON.stringify(u)).join();
        points = sortPoints(data.points);
        units = data.units;
        placements = data.placements;
        positions = resolvePositions(points, units, placements);
        if (!points.some(p => p.id === currentPointId)) currentPointId = points[0]?.id ?? null;
        if (unitsChanged) syncTokens();
        render();
    }, onError);
}

export function setEditable(editable: boolean) {
    if (editable === canEdit) return;
    canEdit = editable;
    if (!canEdit) selectedUnitId = null;
    render();
}
