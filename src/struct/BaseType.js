/**
 * Represents a basic Type in Fibery.
 * @prop {string} name A simple readable name for the type. Same name as shown in App View
 * @prop {string} fiberyName The Type Fibery API identifier name 
 * @prop {string} id The id of this Type
 * @prop {Array<TypeMeta>} [meta={}] Contains metadata for this Type that describes it characteristics
 * @prop {Array<Type>} [fields=[]] An array of sub-Types this Type has, usually present if a user-made type.
 * @deprecated
 */
class BaseType {
	/**
	 * Creates a new Type
	 * @param {string} name A simple readable name for the type. Same name as shown in App View
	 * @param {typeSchema} data The data from Fibery
	 */
	constructor(name, data) {
		if (!data) throw new Error("Missing data");
		if (!name) throw new Error(`Missing mandatory name`);

		this.id = data["fibery/id"];
		if (!this.id) throw new Error(`Missing mandatory id field for type ${this.name}`);

		this.name = name;
		this.fiberyName = data["fibery/name"];

		this.meta = data["fibery/meta"] || [];
		this.fields = data["fibery/meta"] || {};
	}
};
module.exports = BaseType;