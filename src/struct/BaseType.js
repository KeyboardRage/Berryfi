const path = require("path");
const Berryfi = require("../Berryfi");

/**
 * Represents a native or primitive field in Fibery
 * @prop {Berryfi} berryfi The Berryfi client instance. Circular reference.
 * @prop {string} name The Fibery name of this type. 'some/name'
 * @prop {object} meta The Fibery meta of this type
 * @prop {string} id The ID of this tupe. If App, ID is the app's label.
 * @prop {number} flag The flag value for this type
 * @prop {string} label A readable name, often the one shown in Fibery's UI
 * @prop {string} [type] The Fibery type. Only present in Fields.
 * @prop {Array<object>} [fields] The Fibery Fields array if this is a non-primitive Type.
 */
class BaseType {
	/**
	 * Creates a new primitive field
	 * @param {Berryfi} berryfi The Berryfi client
	 * @param {object} data The data directfly from Fibery
	 */
	constructor(berryfi, data) {
		if (!berryfi) throw new Error("Missing berryfi");
		if (!berryfi.constructor.name === "Berryfi") throw new TypeError("Parameter must be of the instance of Berryfi");
		this.berryfi = berryfi;
		this.name = data["fibery/name"] ? data["fibery/name"] : data["fibery/Name"] ? data["fibery/Name"] : data[`${Object.keys(data)[0].split("/")[0]}/Name`] ? data[`${Object.keys(data)[0].split("/")[0]}/Name`] : data;
		this.meta = data && data["fibery/meta"] ? data["fibery/meta"] : undefined;
		this.type = data && data["fibery/type"] ? data["fibery/type"] : undefined;
		this.fields = data && data["fibery/fields"] ? data["fibery/fields"] : undefined;
		this.id = data && (data["fibery/id"]||data["fibery/name"]) ? data["fibery/id"]||data["fibery/name"] : undefined;
		this.label = !this.name ? "undefined" : this.name.includes("/") ? path.basename(this.name) : this.name;
		
		/**
		 * The flags value for this thing. Is set when loaded by Berryfi.pull()
		 * @type {number}
		 * @public
		 * @abstract
		 */
		this.flag = undefined;
	}

	/**
	 * Boolean - Check if this is a user created App
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isApp() {
		return !!(this.berryfi.flags.app & this.flag);
	}
	/**
	 * Boolean - Check if this is a Type inside an App
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isType() {
		return !!(this.berryfi.flags.type & this.flag);
	}
	/**
	 * Boolean - Check if this is a field inside a Type
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isField() {
		return !!(this.berryfi.flags.field & this.flag);
	}
	/**
	 * Boolean - Check if this is an entity
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isEntity() {
		return !!(this.berryfi.flags.entity & this.flag);
	}
	/**
	 * Boolean - Check if this type is directly created by a user
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isUserCreated() {
		return !!(this.berryfi.flags.userCreated & this.flag);
	}
	/**
	 * Boolean - Check if this is a Fibery helper type
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isAuxiliaryType() {
		return !!(this.berryfi.flags.auxiliaryType & this.flag);
	}
	/**
	 * Boolean - Check if this is a Fibery helper field
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isAuxiliaryField() {
		return !!(this.berryfi.flags.auxiliaryField & this.flag);
	}
	/**
	 * Boolean - Check if this is a Fibery helper type or field
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isAuxiliary() {
		return this.isAuxiliaryField||this.isAuxiliaryType;
	}
	/**
	 * Boolean - Check if this is a primitive Fibery type
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isPrimitive() {
		return !!(this.berryfi.flags.primitive & this.flag);
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/secure?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isSecure() {
		return this.meta["fibery/secure?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/modification-date?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get hasModificationDate() {
		return this.meta["fibery/modification-date?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/id?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isId() {
		return this.meta["fibery/id?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/readonly?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isReadOnly() {
		return this.meta["fibery/readonly?"];
	}
	/**
	 * String|Object - Returns 'fibery/meta' → 'fibery/default-value' value
	 * @public
	 * @type {string}
	 * @returns {string|object}
	 */
	get defaultValue() {
		return this.meta["fibery/default-value"];
	}
	/**
	 * Number - Returns 'fibery/meta' → 'ui/object-editor-order' value
	 * @public
	 * @type {number}
	 * @returns {number}
	 */
	get objectEditorOrder() {
		return this.meta["ui/object-editor-order"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'ui/title?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get title() {
		return this.meta["ui/title?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/required?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get required() {
		return this.meta["fibery/required?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/public-id?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get isPublicId() {
		return this.meta["fibery/public-id?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/collection?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get collection() {
		return this.meta["fibery/collection?"];
	}
	/**
	 * String - Returns 'fibery/meta' → 'fibery/relation' value
	 * @public
	 * @type {string}
	 * @returns {string}
	 */
	get relation() {
		return this.meta["fibery/relation"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/primitive?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get primitive() {
		return this.meta["fibery/primitive?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/domain?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get domain() {
		return this.meta["fibery/domain?"];
	}
	/**
	 * String - Returns 'fibery/meta' → 'ui/number-unit' value
	 * @public
	 * @type {string}
	 * @returns {string}
	 */
	get unit() {
		return this.meta["ui/number-unit"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'ui/precision' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get precision() {
		return this.meta["ui/precision"];
	}
	/**
	 * Object - Returns 'fibery/meta' → 'app/mixins' value
	 * @public
	 * @type {object}
	 * @returns {object}
	 */
	get mixins() {
		return this.meta["app/mixins"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'app/mixin?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get mixin() {
		return this.meta["app/mixin?"];
	}
	/**
	 * String - Returns 'fibery/meta' → 'ui/color' value
	 * @public
	 * @type {string}
	 * @returns {string}
	 */
	get color() {
		return this.meta["ui/color"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'app/mixin-create-relation?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get mixinCreateRelation() {
		return this.meta["app/mixin-create-relation?"];
	}
	/**
	 * String - Returns 'fibery/meta' → 'ui/mixin-icon' value
	 * @public
	 * @type {string}
	 * @returns {string}
	 */
	get icon() {
		return this.meta["ui/mixin-icon"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'ui/show-in-menu?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get showInMenu() {
		return this.meta["ui/show-in-menu?"];
	}
	/**
	 * Boolean - Returns 'fibery/meta' → 'fibery/unique?' value
	 * @public
	 * @type {boolean}
	 * @returns {boolean}
	 */
	get unique() {
		return this.meta["fibery/unique?"];
	}
	/**
	 * Date - Returns the creation date, based on the ID (UUID v1)
	 * @public
	 * @type {Date}
	 * @returns {Date}
	 */
	get created() {
		return this.berryfi.toDate(this.id);
	}

	/**
	 * Returns an object of true/false booleans based on the flag value
	 * @type {object}
	 * @returns {object}
	 */
	get booleans() {
		let e = Object();
		for(let key in this.berryfi.flags) e[key] = !!(this.flag & this.berryfi.flags[key]);
		return e;
	}

	/**
	 * Converts the data of this to a valid Fibery schema
	 * @returns {object}
	 * @public
	 * @example const data = primitive.toFibery();
	 * console.log(data);
	 * /*
	 * {
	 *	"fibery/name": "fibery/modification-date",
	 *	"fibery/type": "fibery/date-time",
	 *	"fibery/meta": {
	 *	    "fibery/modification-date?": true,
	 *	    "fibery/required?": true,
	 *	    "fibery/readonly?": true,
	 *	    "fibery/default-value": "$now",
	 *	    "fibery/secured?": false
	 *	},
	 *	"fibery/id": "de64a8e4-a781-11ea-a8a7-539d334de305"
     * }
	 */
	toFibery() {
		if (this.isApp) throw new Error(`Apps are not eligible for Fibery conversion as they are inheritly just a concept`);
		let o = Object();

		if (this.isEntity) return JSON.parse(JSON.stringify(this.fields));
		
		if (this.isType || this.isAuxiliary) return {
			"fibery/name": this.name,
			"fibery/fields": this.fields || [],
			"fibery/meta": this.meta || {},
			"fibery/id": this.id
		};

		if (this.isField || this.isPrimitive) return {
			"fibery/name": this.name,
			"fibery/type": this.type,
			"fibery/meta": this.meta || {},
			"fibery/id": this.id
		};
	}
};
module.exports = BaseType;