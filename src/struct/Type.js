const Collection = require("./Collection");
const Berryfi = require("../Berryfi");
const BaseType = require("./BaseType");
const Field = require("./Field");
const Entity = require("./Entity");
const App = require("./App");

/**
 * Represents a user-created Type
 * @extends {BaseType}
 * @prop {Berryfi} berryfi The Berryfi client instance. Circular reference.
 * @prop {Collection<UIUID, Entity>} entities A Collection of Entities that are derived from this Type
 * @prop {Collection<UUID, Field>} fields A Collection of Fields that belong to this Type
 * @prop {App} parentApp The App this Type is a child of
 * @prop {string} name The Fibery name of this type. 'some/name'
 * @prop {object} meta The Fibery meta of this type
 * @prop {string} id The ID of this tupe. If App, ID is the app's label.
 * @prop {number} flag The flag value for this type
 * @prop {string} label A readable name, often the one shown in Fibery's UI
 * @prop {Set} fieldNames A set of Fibery field names this type has
 * @prop {Set} readOnly A set of Fibery field names that are 'read only' and cannot be modified
 * @prop {string} [type] The Fibery type. Only present in Fields.
 * @prop {Array<object>} [fields] The Fibery Fields array if this is a non-primitive Type.
 */
class Type extends BaseType {
	/**
	 * Creates a new Type
	 * @param {Berryfi} berryfi The Berryfi client instance
	 * @param {object} data The data to populate this type
	 */
	constructor(berryfi, data) {
		if (!data) throw new Error("Missing data");
		super(berryfi, data);

		this.fieldNames = new Set();
		this.readOnly = new Set();
		
		/**
		 * A Collection of Entities that are derived from this Type
		 * @type {Collection<UIUID, Entity>}
		 */
		this.entities = new Collection();
		//TODO: This conflict with top data
		/**
		 * A Collection of Fields that belong to this Type
		 * @type {Collection<UUID, Field>}
		 */
		this.fields = new Collection();
	}

	/**
	 * Registers a Field or Entity as a child of this Type, and this Type as their parent.
	 * @param {Field|Entity} input A Field or Entity to register in to this Type
	 * @returns {Type}
	 */
	append(input) {
		if (!input.berryfi) input.berryfi = this.berryfi;
		input.parentType = this;
		// console.log(input)
		if (input instanceof Field) {
			// Update field names
			this.fieldNames.add(input.name);
			if (input.isReadOnly) this.readOnly.add(input.name);

			this.fields.set(input.id, input);
		} else if (input instanceof Entity) {
			// Update field names
			if (Object.keys(input.data).length) Object.keys(input.data).forEach(e => this.fieldNames.add(e));

			if (input.isReadOnly) this.readOnly.add(input.name);
			this.entities.set(input.id, input);
		} else throw new TypeError(`Invalid type passed. Must be either a Field or an Entitiy, got '${input.constructor.name}'`);
		
		return this;
	}

	/**
	 * Direct insertion of data, useful if you know the scheme and how to do it.  
	 * Performs a single or batch insert based on if you pass an array of entities or a single object.  
	 * The entities returned from the API are also converted to Entities and stored in Type.entities collection behind the scenes, so you can access the resulted Entities from there as well.
	 * @param {Array<object>|object} data The raw data to pass in to a `fibery.entity/create`. If multiple, will be wrapped around by a batch.
	 * @param {boolean} [returnEntities=false] If set to true, will return an array of created Entities (even if only 1) instead of array of API request results.
	 * @async
	 * @returns {Array<object>} Raw API response
	 * @example let res = await contactType.insert([{
	 * 	"My App/Name": "John Doe",
	 * 	"My App/User email": "john@doe.com"
	 * }, {
	 * 	"My App/Name": "Ola Normann",
	 * 	"My App/User email": "ola@normann.no"
	 * }]);
	 * console.log(res) // [{success:true, result: [Object]}, {success:true, result: [Object]}]
	 * 
	 * // Return array of entity references instead of API result
	 * let rob = await contactType.insert({
	 * 	"My App/Name": "Rob Robinson",
	 * 	"My App/User email": "rob@robinson.net"
	 * }, true);
	 * console.log(rob[0].constructor.name, rob[0].field["User email"]) // "Entity" "rob@robinson.net"
	 */
	async insert(data, returnEntities=false) {
		let r;
		if (Array.isArray(data)) {
			r = await this.berryfi.exec([{
				command: "fibery.command/batch",
				args: {
					commands: data.map(e => {
						return {
							command: "fibery.entity/create",
							args: {
								type: this.name,
								entity: e
							}
						}
					})
				}
			}])
		} else {
			r = await this.berryfi.exec([{
				command: "fibery.entity/create",
				args: {
					type: this.name,
					entity: data
				}
			}]);
		}

		let ents = Array();

		r.forEach(res => {
			const ent = new Entity(this.berryfi, this, res);
			ent.flag = ent.flag | this.berryfi.flags.userCreated | this.berryfi.flags.entity;

			if (returnEntities) ents.push(ent);

			this.entities.set(ent.id, ent);
		});

		return returnEntities ? ents : r;
	}

	/**
	 * Creates a new entity and adds it to cache. By later passing `entity.validate()` you can check if you are using invalid fields.
	 * @param {object} data The data that makes up this new entity
	 * @returns {Entity}
	 */
	makeEntity(data) {
		var ent = new Entity(this.berryfi, this, data);
		ent.flag = ent.flag|this.berryfi.flags.userCreated|this.berryfi.flags.entity;
		this.entities.set(ent.id, ent);
		return ent;
	}
};
module.exports = Type;