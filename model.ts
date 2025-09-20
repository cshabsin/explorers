import { marked } from 'marked';
export class Entity {
    _description: string;
    _href: string;
    _hiliteCallback?: (val: boolean) => void;
    _updateCallback?: () => void;
    id: string = "";

    constructor() {
        this._description = "";
        this._href = "";
    }

    getId(): string {
        return this.id;
    }

	getDescription(): string {
		return this._description;
	}

	setDescription(desc: string) {
		this._description = desc;
		return this;
	}

	getHref(): string {
		return this._href;
	}

	setHref(href: string) {
		this._href = href;
		return this;
	}

	// Override to generate the appropriate verbose descriptive
	// text for the entity.
	makeDescription(): string {
		return "Unimplemented.";
	}

	setHiliteCallback(cb: (val: boolean) => void) {
		this._hiliteCallback = cb;
	}

	setUpdateCallback(cb: () => void) {
		this._updateCallback = cb;
	}

	hilite(val: boolean) {
		if (this._hiliteCallback) {
			this._hiliteCallback(val);
		}
	}

	toJson(): any {
		return null;
	}
}

export class Hex extends Entity {
	_name: string;
	_suppressPlanet: boolean;
	first_c: number;
	first_r: number;

	constructor(public c: number,
		public r: number,
		first_c?: number,
		first_r?: number) {
		super();
		this._name = "";
		this._suppressPlanet = false;
		if (first_c == null) {
			first_c = 0;
		}
		if (first_r == null) {
			first_r = 0;
		}
		this.first_c = first_c;
		this.first_r = first_r;
	}

	getCol(): number {
		return this.c;
	}

	getRow(): number {
		return this.r;
	}

	getName(): string {
		return this._name;
	}

	setName(n: string): Hex {
		this._name = n;
		return this;
	}

	update(data: any) {
		this.setName(data.name);
		this.setDescription(data.description);
		this.setHref(data.href);
		if (this._updateCallback) {
			this._updateCallback();
		}
	}

	hasSystem(): boolean {
		return !this._suppressPlanet && this._name != "";
	}

	getDisplayCoord(): string {
		// TODO: generalize
		function dig(n: number): string {
			if (n > 10) {
				return String(n);
			} else {
				return "0" + String(n);
			}
		}
		return dig(this.c + this.first_c) + dig(this.r + this.first_r);
	}

	makeDescription(): string {
		var rc = `<div><span class=\"edit-icon\" data-id=\"${this.getId()}\">&#9998;</span></div>`;
		rc += this.getDisplayCoord() + " - "
		if (this.getHref()) {
			rc += "<a href='" + this.getHref() + "'>" + this.getName() + "</a>";
		} else {
			if (this.getName()) {
				rc += this.getName();
			} else {
				rc += "No system";
			}
		}
		var desc = this.getDescription();
		if (desc) {
			rc += marked(desc);
		}
		return rc;
	}

	toJson(): any {
		if (!this.getName()) {
			return null;
		}
		return {
			col: this.getCol(),
			row: this.getRow(),
			name: this.getName(),
			href: this.getHref(),
			description: this.getDescription(),
			hasSystem: this.hasSystem(),
		};
	}
}

export class PathSegment extends Entity {
	constructor(public sourceHex: Hex, public sourceOffset: [number, number],
		public destinationHex: Hex, public destinationOffset: [number, number],
		public startDate?: { day: number, year: number },
		public endDate?: { day: number, year: number }) {
		super();
	}

	makeDescription(): string {
		var desc = `<div><span class=\"edit-icon\" data-id=\"${this.getId()}\">&#9998;</span></div>`;
		desc += (this.sourceHex.getName() + " -> " +
			this.destinationHex.getName());
		if (this.startDate) {
			desc += `<br>${this.startDate.day}-${this.startDate.year}`;
		}
		if (this.endDate) {
			desc += ` to ${this.endDate.day}-${this.endDate.year}`;
		}
        if (this.getDescription()) {
            desc += marked(this.getDescription());
        }
        return desc;
    }

    update(data: any) {
        this.sourceHex = data.sourceHex;
        this.sourceOffset = data.sourceOffset;
        this.destinationHex = data.destinationHex;
        this.destinationOffset = data.destinationOffset;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        if (this._updateCallback) {
            this._updateCallback();
        }
    }

	toJson(): any {
		return {
			sourceHex: [this.sourceHex.getCol(), this.sourceHex.getRow()],
			sourceOffset: this.sourceOffset,
			destinationHex: [this.destinationHex.getCol(),
			this.destinationHex.getRow()],
			destinationOffset: this.destinationOffset,
			href: this.getHref(),
			description: this.getDescription(),
		};
	}
}
