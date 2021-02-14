"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathSegment = exports.Hex = void 0;
var Entity = /** @class */ (function () {
    function Entity() {
    }
    // description() -> return the description.
    // description(desc) -> set the description, return the Entity.
    // TODO: split set vs. get functionality.
    Entity.prototype.description = function (desc) {
        if (desc) {
            this._description = desc;
            return this;
        }
        return this._description;
    };
    // href() -> return the href.
    // href(desc) -> set the href, return the Entity.
    // TODO: split set vs. get functionality.
    Entity.prototype.href = function (href) {
        if (href) {
            this._href = href;
            return this;
        }
        return this._href;
    };
    // Override to generate the appropriate verbose descriptive
    // text for the entity.
    Entity.prototype.makeDescription = function () {
        return "Unimplemented.";
    };
    Entity.prototype.setHiliteCallback = function (cb) {
        this._hiliteCallback = cb;
    };
    Entity.prototype.hilite = function (val) {
        if (this._hiliteCallback) {
            this._hiliteCallback(val);
        }
    };
    Entity.prototype.toJson = function () {
        return null;
    };
    return Entity;
}());
var Hex = /** @class */ (function (_super) {
    __extends(Hex, _super);
    function Hex(c, r, first_c, first_r) {
        var _this = _super.call(this) || this;
        _this.c = c;
        _this.r = r;
        _this.first_c = first_c;
        _this.first_r = first_r;
        if (first_c == null) {
            first_c = 0;
        }
        if (first_r == null) {
            first_r = 0;
        }
        return _this;
    }
    Hex.prototype.col = function (c) {
        if (c != null) {
            this.c = c;
            return this;
        }
        return this.c;
    };
    Hex.prototype.row = function (r) {
        if (r != null) {
            this.r = r;
            return this;
        }
        return this.r;
    };
    Hex.prototype.name = function (n) {
        if (n != null) {
            this._name = n;
            return this;
        }
        return this._name;
    };
    Hex.prototype.hasSystem = function () {
        return !this._suppressPlanet && this._name != "";
    };
    Hex.prototype.getDisplayCoord = function () {
        // TODO: generalize
        function dig(n) {
            if (n > 10) {
                return String(n);
            }
            else {
                return "0" + String(n);
            }
        }
        return dig(this.c + this.first_c) + dig(this.r + this.first_r);
    };
    Hex.prototype.makeDescription = function () {
        var rc = this.getDisplayCoord() + " - ";
        if (this.href()) {
            rc += "<a href='" + this.href() + "'>" + this.name() + "</a>";
        }
        else {
            if (this.name()) {
                rc += this.name();
            }
            else {
                rc += "No system";
            }
        }
        var desc = this.description();
        if (desc) {
            rc += "<p>" + desc;
        }
        return rc;
    };
    Hex.prototype.toJson = function () {
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
    };
    return Hex;
}(Entity));
exports.Hex = Hex;
var PathSegment = /** @class */ (function (_super) {
    __extends(PathSegment, _super);
    function PathSegment(sourceHex, sourceOffset, destinationHex, destinationOffset) {
        var _this = _super.call(this) || this;
        _this.sourceHex = sourceHex;
        _this.sourceOffset = sourceOffset;
        _this.destinationHex = destinationHex;
        _this.destinationOffset = destinationOffset;
        return _this;
    }
    PathSegment.prototype.makeDescription = function () {
        var desc = (this.sourceHex.name() + " -> " +
            this.destinationHex.name());
        if (this.description()) {
            desc += "<p>" + this.description();
        }
        return desc;
    };
    PathSegment.prototype.toJson = function () {
        return {
            sourceHex: [this.sourceHex.col(), this.sourceHex.row()],
            sourceOffset: this.sourceOffset,
            destinationHex: [this.destinationHex.col(),
                this.destinationHex.row()],
            destinationOffset: this.destinationOffset,
            href: this.href(),
            description: this.description(),
        };
    };
    return PathSegment;
}(Entity));
exports.PathSegment = PathSegment;
