/**
 * @typedef {object} Mixin
 * @prop {boolean} rankMixin If the mixin uses a rank
 * @prop {boolean} [avatarMixin] If this mixin has an avatar
 * @prop {boolean} [collaboration_Documents] If this type has reference mixins
 */
/**
 * @typedef {object} FormulaSchema
 * @prop {Array<string>} expression The expressionID to use
 * @prop {object} params Parameters for this formula
 */
/**
 * Contains meta information about a defiend type
 * @typedef {object} TypeMeta
 * @prop {boolean} secured Whether the type is secured or not in any form from other Fibery team members
 * @prop {boolean} [title] if this mixin has a title
 * @prop {boolean} [readonly] If this type has read-only mode
 * @prop {boolean} [hasId] If this type has a private ID or not
 * @prop {string} [id] The ID of this type
 * @prop {boolean} [publicId] If this type have a public ID or not
 * @prop {boolean} [creationDate] If this type have creation-date data
 * @prop {boolean} [collection] If this is a collection
 * @prop {boolean} [required] If this field is required or not
 * @prop {boolean} [lookup] If this type is a lookup
 * @prop {boolean} [domain] If this type is part of a domain
 * @prop {boolean} [hasFormula] If this type has a formula or not
 * @prop {FormulaSchema} [formula] The formula for this type if it has one
 * @prop {string} [relation] This type have a relational connection
 * @prop {string|object} [defaultValue] The default value a new type will use
 * @prop {number} [objectEditorOrder] An editing order for this type
 * @prop {number} [precision] The level of precision this type has
 * @prop {string} [numberUnit] A UI string indicating the unit this type's value represents
 * @prop {string} [color] The #HEX color this type has
 * @prop {string} [mixinIcon] The icon this type use
 * @prop {boolean} [isMixin] Whether this type has a mixin or not
 * @prop {boolean} [primitive] If this type is a primitive type or not
 * @prop {boolean} [enum] If the value is enumerating
 * @prop {TypeMeta} [mixins] The mixins this type has, nested TypeMeta
 * @prop {boolean} [showInMenu] If the type should be shown in menu or not
 * @prop {boolean} [meta] If the type ahs meta
 * @prop {boolean} [rankMixin] If the mixin uses a rank
 * @prop {boolean} [collabDocuments] If thie type is a document collabotation
 * @prop {boolean} [assignmentMixin] If the mixin is a assignment mixin
 * @prop {boolean} [workflow] If the type is a workflow
 * @prop {boolean} [avatarMixin] If this mixin has an avatar
 */
/**
 * Defines a set of basic properties about a schema
 * @typedef {object} typeSchema
 * @prop {string} name The name of this type
 * @prop {string} type The type of this type
 * @prop {TypeMeta} meta Contains additional metdata about the type
 */
/**
 * Many of Fibery's "data structures" are auxiliary types, so they have a schema of their own. This object contains the base types Fibery currently has.
 * @prop {typeSchema} name
 */
const types = {
	name: {
		"fibery/name": "fibery/name",
		"fibery/type": "fibery/text",
		"fibery/meta": {
			"fibery/secured?": false,
			"ui/title?": true
		}
	},
	id: {
		"fibery/name": "fibery/id",
		"fibery/type": "fibery/uuid",
		"fibery/meta": {
			"fibery/secured?": false,
			"fibery/id?": true,
			"fibery/readonly?": true
		}
	},
	publicId: {
		"fibery/name": "fibery/public-id",
		"fibery/type": "fibery/text",
		"fibery/meta": {
			"fibery/secured?": false,
			"fibery/public-id?": true,
			"fibery/readonly?": true
		}
	},
	creationDate: {
		"fibery/name": "fibery/creation-date",
		"fibery/type": "fibery/date-time",
		"fibery/meta": {
			"fibery/secured?": false,
			"fibery/creation-date?": true,
			"fibery/readonly?": true,
			"fibery/default-value": "$now"
		}
	},
	modificationDate: {
		"fibery/name": "fibery/modification-date",
		"fibery/type": "fibery/date-time",
		"fibery/meta": {
			"fibery/modification-date?": true,
			"fibery/required?": true,
			"fibery/readonly?": true,
			"fibery/default-value": "$now",
			"fibery/secured?": false
		}
	}
};
module.exports.types = types;

/**
 * There's 7 names that an App may not have as they are base types by default
 * @prop {Array<string>} RestrictedAppNames A list of lower-case case insensitive app names that are not permitted.
 */
const RestrictedAppNames = ["avatar","files","comments","webhooks","workflow","collaboration~documents","assignments"];
module.exports.RestrictedAppNames = RestrictedAppNames;