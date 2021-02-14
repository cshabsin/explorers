class Entity {
	_description: string;
	_href: string;
	_hiliteCallback: (val: boolean) => void; // TODO: proper type

	constructor() {
		this._description = "";
		this._href = "";
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
		var rc = this.getDisplayCoord() + " - "
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
			rc += "<p>" + desc;
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
		public destinationHex: Hex, public destinationOffset: [number, number]) {
		super();
	}

	makeDescription(): string {
		var desc = (this.sourceHex.getName() + " -> " +
			this.destinationHex.getName());
		if (this.getDescription()) {
			desc += "<p>" + this.getDescription();
		}
		return desc;
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
