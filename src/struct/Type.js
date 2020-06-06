const BaseType = require("./BaseType");

/**
 * Represents a Type inside an App
 * @extends {BaseType}
 */
class Type extends BaseType {
	constructor(name, data) {
		super(name, data);
	}
};
module.exports = Type;