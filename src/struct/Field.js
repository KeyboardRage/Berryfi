const uuid = require("uuid").v1;

/**
 * The properties of a field
 * @typedef {object} FieldProperties
 * @prop {boolean} [range] For dates: if the date should be a range
 * @prop {boolean} [time] For dates: if the date should include hours:minutes
 * @prop {"integer"|"decimal"} [format] For numbers: what number format to use
 * @prop {number} [precision] For decimal numbers: the level of precision to use. Range from 1 to 8. Default: 1
 * @prop {string} [unit] For numbers: a unit to display numbers as. Up to 3 characters allowed.
 * @prop {boolean} [checked] For checkboxes: default state to set newly created entities as. Fibery does not have default checked state natively.
 */
/**
 * Represents a Field in a Type
 * @extends {BaseType}
 * @prop {string} name The name of this field
 * @prop {string} id The UUIDv1 ID of this field
 * @prop {string} type The type this field is
 * @prop {FieldProperties} prop The properties of this field 
 */
class Field {
	/**
	 * Currently only a subset of all types is supported in Berryfi.
	 * All types: "json-value"|"uuid"|"emoji"|"text"|"richText"|"number"|"singleSelect"|"multiSelect"|"date"|"checkbox"|"url"|"email"|"relation"|"lookup"|"formula"|"button"|"assignments"|"avatar"|"comments"|"files"|"workflow"
	 */
	/**
	 * the data required to create a field
	 * @typedef {object} fieldData
	 * @prop {string} name The label to give this field
	 * @prop {string} [id] The UUIDv1 to give this new field
	 * @prop {"text"|"number"|"date"|"dateRange"|"checkbox"|"url"|"email"} type The type of field
	 * @prop {"integer"|"decimal"} [format] For numbers: what number format to use
	 * @prop {number} [precision] For decimal numbers: the level of precision to use. Range from 1 to 8. Default: 1
	 * @prop {string} [unit] For numbers: a unit to display numbers as. Up to 3 characters allowed.
	 * @prop {boolean} [range] For dates: if the date should be a range
	 * @prop {boolean} [time] For dates: if the date should include hours:minutes
	 * @prop {boolean} [checked] For checkboxes: the default state to create new Entities with. Note: Fibery does not have default check state. This is only useful when creating entities through this Field class. Default: false.
	 */
	/**
	 * Ceates a new Field
	 * @param {fieldData|Field} data The data required to create the field. If a field is passed, it will create a duplicate.
	 * @throws {RangeError|TypeError} Validates the input and properties to ensure they are corect, supported, and valid.
	 */
	constructor(data) {
		// If a field was passed, make a copy
		if (data instanceof Field) data = Field.toObject();

		if (!data.type) throw new Error("Missing field type");
		if (!data.name) throw new Error("Missing field name");
		if (["text", "number", "date", "checkbox", "url", "email"].includes(data.type)) throw new RangeError(`'${data.type}' is not a valid/supported type for a field`);

		this.name = data
		this.meta = data.meta || {};
		this.fields = data.fields || [];
		this.prop = Object();
		
		if (!data.id) this.id = uuid();
		
		this._convertTypes(data.meta);

		// Populate properties passed in to constructing the field
		if (data.range) this.prop.range = !!data.range;
		if (data.time) this.prop.time = !!data.time;
		if (data.format) this.prop.format = data.format;
		if (data.precision) this.prop.precision = data.precision;
		if (data.unit) this.prop.unit = data.unit;
		if (data.checked) this.prop.checked = !!data.checked;
		if (data.rich) this.prop.rich = !!data.rich; // For rich text. Not supported by Berryfi for now.

		// Validate the properties
		this.typeValidation();
	}

	/**
	 * Reads Fibery's types and set this class' properties accordingly
	 * @param {object} meta The meta returned from the Fibery API
	 * @private
	 */
	_convertTypes(meta) {
		if (!meta || !meta["fibery/type"]) return;

		switch (meta["fibery/type"]) {
			case "fibery/text": {
				this.prop.rich = false;
				this.type = "text";
				break;
			};
			case "fibery/rich-text": {
				this.prop.rich = true;
				this.type = "text";
				break;
			};
			case "fibery/date": {
				this.type = "date";
				this.prop.range = false;
				this.prop.time = false;
				break;
			};
			case "fibery/date-range": {
				this.type = "date";
				this.prop.range = true;
				this.prop.time = false;
				break;
			};
			case "fibery/date-time": {
				this.type = "date";
				this.prop.range = false;
				this.prop.time = true;
				break;
			};
			case "fibery/date-time-range": {
				this.type = "date";
				this.prop.range = true;
				this.prop.time = true;
				break;
			};
			case "fibery/int": {
				this.type = "number";
				this.prop.precision = 1;
				this.prop.format = "integer";
				break;
			};
			case "fibery/decimal": {
				this.type = "number";
				this.prop.precision = 1;
				this.prop.format = "decimal";
				break;
			};
			case "fibery/bool": {
				this.type = "checkbox";
				this.prop.checked = false;
				break;
			};
			case "fibery/email": {
				this.type = "email";
				break;
			};
			case "fibery/url": {
				this.type = "url";
				break;
			};
		}
	}

	/**
	 * Ensures the Field does not have invalid properties, or properties not meant for its current type.
	 * @prop {string} type The target type
	 * @prop {object} data The data passed in to creation
	 * @throws {TypeError|RangeError} An error message stating what went wrong and why.
	 * @public
	 */
	validateProperties() {
		let invalid = Array();

		switch(this.type) {

			case "date": {
				invalid = Object.keys(this.prop).filter(e => !["range", "time"].includes(e));
				break;
			}

			case "number": {
				invalid = Object.keys(this.prop).filter(e => !["precision", "unit", "format"].includes(e));
				if (this.prop.unit) {
					if (typeof(this.prop.unit) !== "string") throw new TypeError(`Unit must be a string, got '${this.prop.unit.constructor.name}'`);
					if (this.prop.unit.length < 3) throw new RangeError("Units in number fields cannot exceed 3 characters");
				}

				if (this.prop.precision) {
					if (Number.isInteger(this.prop.precision)) throw new TypeError(`Precision must be an integer, got '${this.prop.precision.constructor.name}'`);
					if (this.prop.precision < 0 || this.prop.precision > 8) throw new RangeError(`Minimum precision is 1 and maximum is 8. Got '${this.prop.precision}'`);
				} else this.prop.precision = 1;

				if (this.prop.format) {
					if (typeof (this.prop.format) !== "string") throw new TypeError(`Format must be a string, got '${this.prop.unit.constructor.name}'`);
					if (this.prop.format!=="integer" && this.prop.format!=="decimal") throw new RangeError(`Format must either be 'integer' or 'decimal', got '${this.prop.format}'`);
				}

				break;
			}

			case "checked": {
				invalid = Object.keys(this.prop).filter(e => !["checked"].includes(e));
				if (this.prop.checked) {
					if (typeof(this.prop.checked) !== "boolean") throw new TypeError(`Checked property must be a boolean, got '${this.prop.checked.constructor.name}'`);
				} else this.prop.checked = false;

				break;
			}

			case "text": {
				invalid = Object.keys(this.prop).filter(e => !["rich"].includes(e));
				if (this.prop.rich) {
					if (typeof(this.prop.rich) !== "boolean") throw new TypeError(`Text field property must be a boolean, got '${this.prop.rich.constructor.name}'`);
				} else this.prop.rich = false;

				break;
			}

			default: invalid = Object.keys(this.prop);
		}

		if (invalid.length) throw new Error(`Field '${this.name}' contains invalid properties for its type '${this.type}': ${invalid}`);
	}

	/**
	 * Returns the Fibery type definition
	 * @returns {string}
	 */
	get fiberyType() {
		if (!this.meta) throw new Error("Unable to read field Meta");
		switch(this.type) {
			case "text": {
				if (this.prop.rich) return "fibery/rich-text";
				return "fibery/text";
			}
			case "number": {
				if (this.prop.format==="decimal") return "fibery/decimal";
				else return "fibery/int";
			}
			case "date": {
				// Normal date
				if (!this.prop.range && !this.prop.time) return "fibery/date";
				// Date range
				if (!this.prop.time) return "fibery/date-range";
				// Date time specific
				if (!this.prop.range) return "fibery/date-time";
				// Date time specific + range
				return "fibery/date-time-range";
			}
			case "checkbox": return "fibery/bool";
			case "email": return "fibery/email";
			case "url": return "fibery/url";
			default: return `fibery/${this.type}`;
		}
	}

	/**
	 * Returns a Berryify readable Field object
	 * @returns {object}
	 */
	toObject() {
		return {
			name: this.name,
			type: this.type,
			range: this.prop.range,
			format: this.prop.format,
			unit: this.prop.unit,
			precision: this.prop.precision,
			time: this.prop.time,
			checked: this.prop.checked,
			rich: this.prop.rich,
			meta: this.meta,
			fields: this.fields,
			id: this.id,
			fiberyName: this.fiberyType,
		};
	}
};

module.exports = Field;

const x = new Field()