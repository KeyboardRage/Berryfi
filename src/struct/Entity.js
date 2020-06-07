const { CMDS } = require("./constants");
const Collection = require("./Collection");
const Berryfi = require("../Berryfi");
const BaseType = require("./BaseType");
const Field = require("./Field");
const App = require("./App");
const Type = require("./Type");

/**
 * Represents an Entity / a collection of pieces of data.
 * @extends {BaseType}
 * @prop {Type} parentType The Type this Entity is a child of
 * @prop {object} data The data on this Entity. Object is identical to the API query result.
 * @prop {string} name The Fibery name of this type. 'some/name'
 * @prop {object} meta The Fibery meta of this type
 * @prop {string} id The ID of this tupe. If App, ID is the app's label.
 * @prop {Berryfi} berryfi The Berryfi client instance
 * @prop {number} flag The flag value for this type
 * @prop {string} label A readable name, often the one shown in Fibery's UI
 * @prop {string} field A proxy to get/set data in the current Entity. E.g. "entity.field['user email']" or "entity.field.Name = 'Hello!'". Setter throws error if field does not exist.
 * @prop {string} [type] The Fibery type. Only present in Fields.
 * @prop {Array<object>} [fields] The Fibery Fields array if this is a non-primitive Type.
 */
class Entity extends BaseType {
	/**
	 * Creates a new entity
	 * @param {Berryfi} berryfi The Berryfi client instance
	 * @param {object} data The data to populate this entity
	 */
	constructor(berryfi, data) {
		if (!data) throw new Error("Missing data");
		super(berryfi, data);
		this.data = data;

		this.field = new Proxy(this, {
			get: (target, property) => {
				let r = this.data[`${this.parentType.app}/${this.berryfi.stentenceCase(property)}`];
				if (r===undefined) r = this.data[`fibery/${this.berryfi.stentenceCase(property)}`];
				if (r===undefined) r = this.data[`fibery/${property}`];
				return r;
			},
			set: (target, property, value) => {
				if (this.data[`${this.parentType.app}/${this.berryfi.stentenceCase(property)}`]!==undefined) {
					this.data[`${this.parentType.app}/${this.berryfi.stentenceCase(property)}`] = value;
				} else if (this.data[`fibery/${this.berryfi.stentenceCase(property)}`]!==undefined) {
					this.data[`fibery/${this.berryfi.stentenceCase(property)}`] = value;
				} else if (this.data[`fibery/${property}`]!==undefined) {
					this.data[`fibery/${property}`] = value;
				} else throw new Error(`Invalid property '${this.property}'. Valid ones are ${Object.keys(this.toObject()).join(", ")}`);
			}
		});
	}

	/**
	 * Number - Returns the Entity["fibery/rank"] value
	 * @public
	 * @type {number}
	 * @returns {number}
	 */
	get rank() {
		return this.data["fibery/rank"];
	}
	/**
	 * String - Returns the Entity["fibery/public-id"] value
	 * @public
	 * @type {string}
	 * @returns {string}
	 */
	get publicId() {
		return this.data["fibery/public-id"];
	}
	/**
	 * Date - Returns the date the entity was modified
	 * @returns {Date}
	 * @type {Date}
	 */
	get modified() {
		return new Date(this.data["fiber/modification-date"]);
	}

	/**
	 * Returns a pure object of the entity and its fields. Basically strips out `Appname/, fibery/, ui/, app/, etc..` to "clean up" the keys.
	 * @param {object} [data] The data to convert from fibery notion to normal. Max 2 levels deep.
	 * @returns {object}
	 * @example console.log(personEntity); // {"fibery/id": "123", "fibery/name": "John Doe", "Person/age": 24, "Person/workplaces": [{"Companies/name": "Fibery"}], "fibery/public-id": "1"};
	 * console.log(personEntity.toObject()); // {id: "123", name: "John Doe", age: 24, workplaces: [{name: "Fibery"}], "public-id": "1"};
	 */
	toObject(input) {
		if (!input) input = this.data;
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
		if (!r.success) throw new Error(`Error pulling entity update from Fibery: ${r.result.name}: ${r.result.message}`);

		this.meta = r.result[0];
	}
};
module.exports = Entity;