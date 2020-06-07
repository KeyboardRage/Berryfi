const Collection = require("./Collection");
const Berryfi = require("../Berryfi");
const BaseType = require("./BaseType");
const Type = require("./Type");

/**
 * Represents a user-created App
 * @extends {BaseType}
 * @prop {Collection<Type>} types A Collection of Types this App has
 * @prop {string} name The Fibery name of this type. 'some/name'
 * @prop {object} meta The Fibery meta of this type
 * @prop {string} id The ID of this tupe. If App, ID is the app's label.
 * @prop {Berryfi} berryfi The Berryfi client instance
 * @prop {number} flag The flag value for this type
 * @prop {string} label A readable name, often the one shown in Fibery's UI
 * @prop {string} [type] The Fibery type. Only present in Fields.
 * @prop {Array<object>} [fields] The Fibery Fields array if this is a non-primitive Type.
 */
class App extends BaseType {
	/**
	 * Creates a new App
	 * @param {Berryfi} berryfi The Berryfi client instance
	 * @param {string} name The name of this App. Will also be its ID.
	 */
	constructor(berryfi, name) {
		super(berryfi, name);

		// App's ID's are their names.
		this.name = name;
		this.id = name;
		this.types = new Collection();
	}

	/**
	 * Register the Type as a child of this App, and this App as the parent of the Type.
	 * @param {Type} type The Type this App has
	 * @returns {App}
	 */
	append(type) {
		if (type.constructor.name !== "Type") throw new TypeError(`Invalid input; must be Type, got '${type.constructor.name}'`)

		type.parentApp = this;
		if (!type.berryfi) type.berryfi = this.berryfi;
		this.types.set(type.id, type);
		return this;
	}
};
module.exports = App;