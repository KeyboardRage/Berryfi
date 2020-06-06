const Type = require("./Type");
const Collection = require("./Collection");
const Field = require("./Field");

/**
 * Represents a Fibery App
 * @prop {string} name The name of this App
 * @prop {string} id Essentially same as the App's name since they don't have their own ID's.
 * @prop {string} fiberyName Essentially same as the App's name since they aren't sub-collections of anything
 * @prop {Class<Type>} Type A class for creating new Types
 * @prop {Class<Field>} Field A class for creating new Fields
 * @prop {Collection} types A collection of Types this App has
 */
class AppType {
	/**
	 * Creates a new App Type
	 * @param {string} name The name of this App
	 */
	constructor(fiberyName) {
		if (!fiberyName) throw new Error("Missing Fibery name");
		this.name = fiberyName;
		this.fiberyName = fiberyName;
		this.id = fiberyName;
		this.types = new Collection();
		this.Type = Type;
		this.Field = Field;
	}
};
module.exports = AppType;