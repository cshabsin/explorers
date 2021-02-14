class Entity {
	_description: string;
	_href: string;
	_hiliteCallback: any; // TODO: proper type

	constructor() {
		this._description = "";
		this._href = "";
	}

	// description() -> return the description.
	// description(desc) -> set the description, return the Entity.
	// TODO: split set vs. get functionality.
	description(desc?: string): string | Entity {
		if (desc) {
			this._description = desc;
			return this;
		}
		return this._description;
	}

	// href() -> return the href.
	// href(desc) -> set the href, return the Entity.
	// TODO: split set vs. get functionality.
	href(href?: string): string | Entity {
		if (href) {
			this._href = href;
			return this;
		}
		return this._href;
	}

	// Override to generate the appropriate verbose descriptive
	// text for the entity.
	makeDescription(): string {
		return "Unimplemented.";
	}

	setHiliteCallback(cb: any) {
		this._hiliteCallback = cb;
	}

	hilite(val: any) {
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

	col(c?: number): number | Hex {
		if (c != null) {
			this.c = c;
			return this;
		}
		return this.c;
	}

	row(r?: number): number | Hex {
		if (r != null) {
			this.r = r;
			return this;
		}
		return this.r;
	}

	name(n?: string): string | Hex {
		if (n != null) {
			this._name = n;
			return this;
		}
		return this._name;
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
		if (this.href()) {
			rc += "<a href='" + this.href() + "'>" + this.name() + "</a>";
		} else {
			if (this.name()) {
				rc += this.name();
			} else {
				rc += "No system";
			}
		}
		var desc = this.description();
		if (desc) {
			rc += "<p>" + desc;
		}
		return rc;
	}

	toJson(): any {
		if (!this.name()) {
			return null;
		}
		return {
			col: this.col(),
			row: this.row(),
			name: this.name(),
			href: this.href(),
			description: this.description(),
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
		var desc = (this.sourceHex.name() + " -> " +
			this.destinationHex.name());
		if (this.description()) {
			desc += "<p>" + this.description();
		}
		return desc;
	}

	toJson(): any {
		return {
			sourceHex: [this.sourceHex.col(), this.sourceHex.row()],
			sourceOffset: this.sourceOffset,
			destinationHex: [this.destinationHex.col(),
			this.destinationHex.row()],
			destinationOffset: this.destinationOffset,
			href: this.href(),
			description: this.description(),
		};
	}
}
