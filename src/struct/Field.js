const Collection = require("./Collection");
const Berryfi = require("../Berryfi");
const BaseType = require("./BaseType");
const App = require("./App");
const Type = require("./Type");

/**
 * Represents a Field in a Type
 * @extends {BaseType}
 * @prop {Type} parentType The Type this Field is a child of
 * @prop {string} name The Fibery name of this type. 'some/name'
 * @prop {object} meta The Fibery meta of this type
 * @prop {string} id The ID of this tupe. If App, ID is the app's label.
 * @prop {Berryfi} berryfi The Berryfi client instance
 * @prop {number} flag The flag value for this type
 * @prop {string} label A readable name, often the one shown in Fibery's UI
 * @prop {string} [type] The Fibery type. Only present in Fields.
 * @prop {Array<object>} [fields] The Fibery Fields array if this is a non-primitive Type.
 */
class Field extends BaseType {
	/**
	 * Creates a new field
	 * @param {Berryfi} berryfi The Berryfi client instance
	 * @param {object} data The data to populate this field
	 */
	constructor(berryfi, data) {
		if (!data) throw new Error("Missing data");
		super(berryfi, data);
	}
};
module.exports = Field;