// Timeline page: deck plan divided into zones (rooms and hallway segments).
// For now this renders the zones and lets you hover/click them; clicking one
// zone and then another shows the hallway route between them. Characters and
// waypoints come next.
import '../firebase.js';
import { makeSVG } from '../util.js';
import planUrl from './deck-plan.png';
import { PLAN_SIZE, ZONES, ZONES_BY_ID, Zone, route } from './zones.js';

const container = document.getElementById("plan-container")!;
const readout = document.getElementById("zone-readout")!;

const svg = makeSVG("svg", {
    width: PLAN_SIZE.width,
    height: PLAN_SIZE.height,
    viewBox: `0 0 ${PLAN_SIZE.width} ${PLAN_SIZE.height}`,
});
svg.append(makeSVG("image", { href: planUrl, x: 0, y: 0, width: PLAN_SIZE.width, height: PLAN_SIZE.height }));

const zoneLayer = makeSVG("g", { "class": "zones" });
const routeLayer = makeSVG("g", { "class": "routes" });
svg.append(zoneLayer, routeLayer);
container.append(svg);

const zoneElems = new Map<string, SVGElement>();
for (const zone of ZONES) {
    const poly = makeSVG("polygon", {
        points: zone.points.map(p => p.join(",")).join(" "),
        "class": `zone zone-${zone.kind}`,
        "data-id": zone.id,
    });
    poly.addEventListener("mouseenter", () => { readout.textContent = zone.name; });
    poly.addEventListener("mouseleave", () => { readout.textContent = describeSelection(); });
    poly.addEventListener("click", () => select(zone));
    zoneLayer.append(poly);
    zoneElems.set(zone.id, poly);
}

let selected: Zone | null = null;

function describeSelection(): string {
    return selected ? `Selected: ${selected.name} (click another zone to see the route)` : "Click a zone";
}

function select(zone: Zone) {
    routeLayer.replaceChildren();
    if (selected && selected !== zone) {
        drawRoute(selected.id, zone.id);
    }
    if (selected) zoneElems.get(selected.id)!.classList.remove("selected");
    selected = selected === zone ? null : zone;
    if (selected) zoneElems.get(selected.id)!.classList.add("selected");
    readout.textContent = describeSelection();
}

function drawRoute(fromId: string, toId: string) {
    const path = route(fromId, toId);
    if (!path) return;
    routeLayer.append(makeSVG("polyline", {
        points: path.map(z => z.anchor.join(",")).join(" "),
        "class": "route",
    }));
    readout.textContent = path.map(z => z.name).join(" → ");
}

// Exposed for debugging in the console.
(window as any).zones = ZONES_BY_ID;
