const Field = require("./Field");
const Collection = require("./Collection");

/**
 * Represents a Type inside an App
 * @prop {string} name A simple readable name for the type. Same name as shown in App View
 * @prop {string} fiberyName The Type Fibery API identifier name
 * @prop {string} id The id of this Type
 * @prop {Array<TypeMeta>} [meta={}] Contains metadata for this Type that describes it characteristics
 * @prop {Array<Type>} [fields=[]] An array of sub-Types this Type has, usually present if a user-made type.
 * @prop {Collection<Field>} fields
 */
class Type {
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

		this.meta = data["fibery/meta"] || {};
		this._fields = data["fibery/meta"] || [];
		this.fields = new Collection();
		this.Field = Field;

		// Automatically create fields based on passed meta if any
		if (this._fields.length) {
			this._fields.forEach(field => {
				// Only supported field types in Berryfi:
				if (["fibery/text", "fibery/decimal", "fibery/int", "fibery/date", "fibery/date-range", "fibery/date-time", "fibery/date-time-range", "fibery/bool", "fibery/url", "fibery/email"].includes(field["fibery/name"])) {
					const field = new this.Field(field);
					this.fields.set(field.id, field);
				}
			});
		}
	}
};
module.exports = Type;