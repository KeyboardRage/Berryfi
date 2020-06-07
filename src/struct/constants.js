/**
 * There's 7 names that an App may not have as they are base types by default: 
 * avatar, files, comments, webhooks, workflow, collaboration~documents, assignments
 * @prop {Array<string>} RESTRICTED_APP_NAMES A list of lower-case case insensitive app names that are not permitted.
 */
const RESTRICTED_APP_NAMES = ["avatar","files","comments","webhooks","workflow","collaboration~documents","assignments"];
module.exports.RESTRICTED_APP_NAMES = RESTRICTED_APP_NAMES;


/**
 * An array of types used by primitive Field types: fibery/int, fibery/decimal, fibery/rank, fibery/text, fibery/rich-text, fibery/email, fibery/emoji, fibery/uuid, fibery/date, fibery/date-time, fibery/bool, fibery/json-value, fibery/date-time-range, fibery/date-range
 * @prop {Array<string>} PRIMITIVE_FIELD_TYPES
 */
const PRIMITIVE_FIELD_TYPES = [
	'fibery/int',
	'fibery/decimal',
	'fibery/rank',
	'fibery/text',
	'fibery/rich-text',
	'fibery/email',
	'fibery/emoji',
	'fibery/uuid',
	'fibery/date',
	'fibery/date-time',
	'fibery/bool',
	'fibery/json-value',
	'fibery/date-time-range',
	'fibery/date-range'
];
module.exports.PRIMITIVE_FIELD_TYPES = PRIMITIVE_FIELD_TYPES;

const CMDS = {
	updateEntity: "fibery.entity/update",
	newEntity: "fibery.entity/create",
	getEntity: "fibery.entity/query",
	batch: "fibery.command/batch"
};
module.exports.CMDS = CMDS;