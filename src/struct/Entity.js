const { CMDS } = require("./constants");
const Collection = require("./Collection");
const Berryfi = require("../Berryfi");
const BaseType = require("./BaseType");
const Field = require("./Field");
const App = require("./App");
const Type = require("./Type");
const uuid = require("uuid").v1;

/**
 * Represents an Entity / a collection of pieces of data, like a row in a table view, a person, or a card with information.
 * @prop {Berryfi} berryfi The Berryfi client instance. Circular reference.
 * @prop {Type} parentType The Type this Entity is a child of
 * @prop {object} data The data on this Entity. Object is identical to the API query result.
 * @prop {number} flag The flag value for this type
 * @prop {string} field A proxy to get/set data in the current Entity. E.g. "entity.field['user email']" or "entity.field.Name = 'Hello!'". Setter throws error if field does not exist.
 * @prop {Berryfi} berryfi The Berryfi client instance
 */
class Entity {
	/**
	 * Creates a new entity
	 * @param {Berryfi} berryfi The Berryfi client instance
	 * @param {Type} parentType The Type this Entity is a child of
	 * @param {object} data The data to populate this entity
	 */
	constructor(berryfi, parentType, data) {
		if (!data) throw new Error("Missing data");
		if (!berryfi) throw new Error("Missing berryfi");
		if (!berryfi.constructor.name === "Berryfi") throw new TypeError("'berryfi' parameter must be of the instance of Berryfi");
		if (!parentType) throw new Error("Missing parentType");
		if (!parentType.constructor.name === "Type") throw new TypeError("'parentType' parameter must be of the instance of Type");

		this.berryfi = berryfi;
		this.parentType = parentType;

		this._data = data;

		if (!this._data["fibery/id"]) this._data["fibery/id"] = uuid();

		/**
		 * The flags value for this thing. Is set when loaded by Berryfi.pull()
		 * @type {number}
		 * @public
		 * @abstract
		 */
		this.flag = undefined;
		this.field = this._makeProxy();

		this.validate();
	}

	_makeProxy() {
		return new Proxy(this, {
			get: (target, property) => {
				let r = this.findFieldName(property);
				return r && this._data[r] ? this._data[r] : this._data[property] ? this._data[property] : this._data[this.berryfi.stentenceCase(property)] ? this._data[this.berryfi.stentenceCase(property)] : undefined;
			},
			set: (target, property, value) => {
				let r = this.findFieldName(property);
				if (!r) throw new Error(`Invalid property '${this.property}'. Valid ones are ${Object.keys(this.toObject()).join(", ")}`);
				if (this.parentType.readOnly.has(r)) throw new Error(`The field '${r}' is read only`);
				this._data[r] = value;
			},
			deleteProperty: (target, property) => {
				let r = this.findFieldName(property);
				delete this._data[r];
				return true;
			}
		});
	}

	/**
	 * Checks the Fields associated with this Entity's parent Type to resolve the Fibery name of a field
	 * @param {string} name The field to get Fibery name of
	 * @returns {string}
	 */
	findFieldName(name) {
		if (!name) return undefined;

		if (this.parentType.fieldNames.has(name)) return name;
		for (let n of this.parentType.fieldNames.values()) if (n.toLowerCase().split("/")[1] === name.toLowerCase()) return n;

		return undefined;
	}

	/**
	 * Return the object data reference for this Entity
	 * @public
	 * @type {object}
	 * @returns {object}
	 */
	get fields() {
		return this._data;
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
		return !!(this.berryfi.flags.auxiliaryField | this.berryfi.flags.auxiliaryType & this.flag);
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
	 * Number - Returns the Entity["fibery/rank"] value
	 * @public
	 * @type {number}
	 * @returns {number}
	 */
	get rank() {
		return this._data["fibery/rank"];
	}
	/**
	 * String - Returns the Entity["fibery/public-id"] value
	 * @public
	 * @type {string}
	 * @returns {string}
	 */
	get publicId() {
		return this._data["fibery/public-id"];
	}
	/**
	 * Date - Returns the date the entity was modified
	 * @returns {Date}
	 * @type {Date}
	 */
	get modified() {
		return this._data["fiber/modification-date"] ? new Date(this._data["fiber/modification-date"]) : null;
	}
	/**
	 * Returns the UUID of this Entitiy if it has one
	 * @type {string}
	 * @returns {string}
	 */
	get id() {
		return this._data["fibery/id"];
	}
	/**
	 * Returns the creation date of this Entitiy if it has an UUID
	 * @type {Date}
	 * @returns {Date}
	 */
	get created() {
		return this.berryfi.toDate(this.id);
	}
	/**
	 * Returns the name of the App this Entity is a child of. The name and label is the same for apps.
	 * @type {string}
	 * @returns {string}
	 */
	get appName() {
		return this.parentType.parentApp.label;
	}
	/**
	 * Returns the name of the Type this Entity is a child of. The Fibery API name, not UI readable name.
	 * @type {string}
	 * @returns {string}
	 */
	get typeName() {
		return this.parentType.name;
	}
	/**
	 * Returns the label of the Type this Entity is a child of. The UI readable name instead of the Fibery name.
	 * @type {string}
	 * @returns {string}
	 */
	get typeLabel() {
		return this.parentType.label;
	}

	/**
	 * Returns a pure object of the entity and its fields. Basically strips out `Appname/, fibery/, ui/, app/, etc..` to "clean up" the keys.
	 * @param {object} [input] Default: the current entity's data. The data to convert from fibery notion to normal. Max 2 levels deep.
	 * @returns {object}
	 * @example console.log(personEntity); // {"fibery/id": "123", "fibery/name": "John Doe", "Person/age": 24, "Person/workplaces": [{"Companies/name": "Fibery"}], "fibery/public-id": "1"};
	 * console.log(personEntity.toObject()); // {id: "123", name: "John Doe", age: 24, workplaces: [{name: "Fibery"}], "public-id": "1"};
	 */
	toObject(input) {
		if (!input) input = this._data;
		let o = Object();
		for (let k in input) {
			let nk = k.includes("/") ? k.split("/")[1] : k;
			if (Array.isArray(input[k])) {
				o[nk] = Array();
				input[k].forEach(i =>
					i.constructor.name === "Object" ?
						Object.keys(i).forEach(sk => o[nk].push({ [sk.includes("/") ? sk.split("/")[1] : sk]: i[sk] }))
						: o[nk].push(i));
			} else if (input[k].constructor.name === "Object") {
				o[nk] = {};
				for (let sk in input[k]) o[nk][sk.includes("/") ? sk.split("/")[1] : sk] = input[k][sk];
			} else o[nk] = input[k];
		}
		return o;
	}

	/**
	 * Inserts this entity in to Fibery.
	 * @async
	 * @example const mike = people.makeEntity({
	 * 	name: "Mike",
	 * 	age: 24
	 * });
	 * await mike.insert(); // Create new
	 * mike.field.email = "mike@email.com";
	 * await mike.push(); // Update state
	 */
	async insert() {
		// Dummy to avoid mutating reference
		let holder = this.validate();

		// Remove 'undefined' fields
		for (let key in holder) {
			if (key === "fibery/id") continue;
			if (this.parentType.readOnly.has(key)) delete holder[key];
			if (holder[key] === undefined) delete holder[key];
		}

		let r = await this.berryfi.exec([{
			command: CMDS.newEntity,
			args: {
				type: this.parentType.name,
				entity: holder
			}
		}]);

		this._data = r[0];
		this.field = this._makeProxy();

		// Each must be set due to proxy
		// for (let key in r[0]) {
		// 	console.log(`Setting ${key} as ${r[0][key]}`)
		// 	this.field[key] = r[0][key];
		// }
	}
	

	/**
	 * Pulls the current state of this Entity from Fibery and update itself
	 * @async
	 */
	async pull() {
		let r = await this.berryfi.exec([{
			command: CMDS.getEntity,
			args: {
				query: {
					"q/from": this.parentType.name,
					"q/where": ["==", ["fibery/id"], this.id],
					"q/limit": 1,
					"q/select": Object.keys(this.meta)
				}
			}
		}]);

		this._data = r.result[0];
		this.validate();
	}

	/**
	 * Push the current state of the entity to Fibery.
	 * Undefined/omitted fields will be left out of the update, so they will remain as-is in Fibery.
	 * Nulled values in this Entity will erase the values in Fibery.
	 * @async
	 * @return {Array<object>} The result API response of the update query
	 * @example 
	 * mike.field.email = "mike@email.com";
	 * await mike.push(); // Update state
	 * 
	 * mike.field.age = 25;
	 * await mike.push() // … another update
	 */
	async push() {
		// Dummy to avoid mutating reference
		let holder = this.validate();

		// Remove 'undefined' fields
		for (let key in holder) {
			if (key==="fibery/id") continue;
			if (this.parentType.readOnly.has(key)) delete holder[key];			
			if (holder[key] === undefined) delete holder[key];
		}

		let r = await this.berryfi.exec([{
			command: CMDS.updateEntity,
			args: {
				type: this.parentType.name,
				entity: holder
			}
		}]);

		return r;
	}

	/**
	 * Corrects and checks if the schema is valid based on the field schema in cache. 
	 * Updates its own state, but also return a de-referenced object of the object.
	 * Throws on if invalid, with an error stating what is invalid. 
	 * You can use this method in a try...catch before sending to capture errors early. 
	 * When sending, this method will be used automatically as well.
	 * @throws {Error} If invalid, with an error stating what is invalid.
	 * @returns {object}
	 */
	validate() {
		if (!this._data || !Object.keys(this._data).length) return;
		let holder = Object();

		for (let key in this._data) {
			var k = this.findFieldName(key);
			if (!k) throw new Error(`Unable to find field name for the key '${key}'.`);
			holder[k] = this._data[key];
		}
		this._data = holder;
		return JSON.parse(JSON.stringify(holder));
	}
};
module.exports = Entity;