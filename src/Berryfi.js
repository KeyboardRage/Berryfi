const Type = require("./struct/Type");
const Field = require("./struct/Field");
const Entity = require("./struct/Entity");
const App = require("./struct/App");
const Collection = require("./struct/Collection");
const got = require("got");

/**
 * @typedef {object} Flags
 * @constant
 * @prop {number} primitive=1 1<<0 — Is a pritmitive, like 'boolean', 'email', 'date', 'date-range', etc.
 * @prop {number} userCreated=2 1<<1 — The user created this. Can be a field, an app, an entitiy, and so on.
 * @prop {number} auxiliaryType=4 1<<2 — Is a Fibery helper type like favourites, users, etc.
 * @prop {number} auxiliaryField=8 1<<3 — Is a field that is part of an auxiliaryType. Can be the name field of a dropdown item, etc.
 * @prop {number} app=16 1<<4 — If the type is an App that the user has created
 * @prop {number} type=32 1<<5 — Is a Type that the user created, that is part of an App
 * @prop {number} field=64 1<<6 — Is a main field that the user created in their type. Is part of a Type, which is part of an App
 * @prop {number} entity=128 1<<7 — A piece of data, like a row in a table, a person, a card, etc. Is part of a Type. Is NOT the single value of a Field!
 */
/**
 * The Berryfi client
 * @prop {string} workspace The name of your workspace
 * @prop {boolean} useCache Whether the client is going to try to use cache or not.
 * @prop {object} cache.fibery Last update from Fibery and its state
 * @prop {Collection<App>} cache.apps A collection of apps cached. Key is App name.
 * @prop {Collection<Type>} cache.types A collection of types cached. Key is type ID.
 * @prop {Collection<Field>} cache.fields A collection of fields cached. Key is field ID.
 * @prop {Collection<Entity>} cache.entities A collection of entities cached. Key is entity ID.
 * @prop {Flags} flags An object of flags that can be used to check boolean values of data.
 */
class Berryfi {
	/**
	 * Creates a new Berryfi client
	 * @param {object} config The configuration for the Berryfi client
	 * @param {string} config.workspace The name of your workspace. Can be found in url: https://{workspace name}.fibery.io/
	 * @param {string} config.token Your Fibery token. Check Fibery API documentation on how to get your token.
	 * @see https://api.fibery.io/?shell#authentication
	 * @example const Berryfi = require("Berryfi");
	 * const berryfi = new Berryfi({
	 * 	workspace: "somewhere",
	 * 	token: "a1a1a1a1a1.b2b2b2b2b2b2b2b2b2b2b2b2b2"
	 * });
	 */
	constructor(config) {
		if (!config.workspace) throw new Error("Missing workspace name");
		if (!config.token) throw new Error("Missing Fibery API token");

		this._token = config.token;
		this._version = "0.1.0";
		this._agent = `Berryfi/${this._version} (https://github.com/KeyboardRage/Berryfi)`;
		this.workspace = config.workspace;
		this.req = got.extend({
			method: "POST",
			prefixUrl: `https://${this.workspace}.fibery.io/api`,
			responseType: "json",
			headers: {
				"User-Agent": this._agent,
				"X-Client": "Berryfi",
				"Authorization": `Token ${this._token}`
			},
			https: {
				rejectUnauthorized: true
			}
		});

		this.flags = Object.freeze({
			primitive:		1<<0,
			userCreated:	1<<1,
			auxiliaryType:	1<<2,
			auxiliaryField:	1<<3,
			app:			1<<4,
			type:			1<<5,
			field:			1<<6,
			entity:			1<<7,
		});

		this.cache = {
			fibery: Object(),
			apps: new Collection(),
			types: new Collection(),
			fields: new Collection(),
			entities: new Collection(),
		};
	}

	/**
	 * Executs a HTTP request to Fibery, using your token and workspace as the base.
	 * @param {Array<object>} command The command to execute, which will be used as the body of the HTTP request
	 * @param {string} [endpoint="commands"] The part after `fibery.io/api` you want to connect to
	 * @returns {Promise<Array<object>>}
	 * @example let rawData = await berryfi.exec([{ command: "fibery.schema/query" }]);
	 */
	async exec(command, endpoint="commands") {
		let {body} = await this.req(endpoint, {json: command});

		console.log("Exec: ", body);
		const errors = body.reduce((acc, res, i) => {
			if (!res.success) return acc.concat(`Error while executing command: ${res.result.message}`);
			else return acc;
		}, []);
		if (errors.length) throw new Error(errors.join('\n'));

		if (this._usingInit) {
			this.cache.fibery = {
				version: body[0].result["fibery/version"],
				id: body[0].result["fibery/id"],
				meta: {
					version: body[0].result["fibery/meta"]["fibery/version"],
					release: body[0].result["fibery/meta"]["fibery/rel-version"],
					maintenance: body[0].result["fibery/meta"]["fibery/maintenance?"]
				}
			};
			this._usingInit=false;
		}

		return body.map(res => res.result);
	}

	/**
	 * Checks token validity, hostname, and connects client to Fibery, and will populate overview of your Workspace in to cache.
	 * @async
	 * @example await berryfi.pull();
	 */
	async pull() {
		this._usingInit = true;
		let rawData = await this.exec([{ command: "fibery.schema/query" }]);

		if (!rawData) throw new Error("No data recieved from Fibery");
		rawData[0]["fibery/types"].forEach(type => {
			if (type["fibery/name"]["fibery/primitive?"]) {
				// Primitive type
				this._loadSchemaType(this.flags.primitive, type);
			} else if (type["fibery/meta"]["fibery/domain?"] && !type["fibery/name"].startsWith("fibery/")) {
				// User generated type
				this._loadSchemaType(this.flags.userCreated, type);
			} else {
				// Fibery auxiliary
				this._loadSchemaType(this.flags.auxiliary, type);
			}
		});
	}

	/**
	 * Ingest Fibery schema overview and convert to cache data
	 * @param {number} flag A flag indicating the type of Type
	 * @param {object} data The API data for a single type
	 * @private
	 */
	_loadSchemaType(flag, data) {

		if (flag & this.flags.primitive) {
		//? Primitive Field
			if (!this.cache.fields.has(data["fibery/id"])) {
				const type = new Field(this, data);
				type.flag = this.flags.primitive|this.flags.field;
				this.cache.fields.set(data["fibery/id"], type);
			}
		}

		if (flag & this.flags.userCreated) {
		//? User created Type
			let app = this.cache.apps.get(data["fibery/name"].split("/")[0]);

			if (!app) {
				app = new App(this, data["fibery/name"].split("/")[0]);
				app.flag = this.flags.userCreated|this.flags.app;
			};
			
			// Create the type
			const type = new Type(this, data);
			type.flag = this.flags.userCreated|this.flags.type;

			// Add the fields
			data["fibery/fields"].forEach(data => {
				const field = new Field(this, data);
				field.flag = this.flags.userCreated|this.flags.field;
				this.cache.fields.set(field.id, field);
				type.append(field);
			});

			// Append Type to the App
			app.append(type);

			// Update caches
			this.cache.apps.set(app.id, app);
			this.cache.types.set(type.id, type);
		}

		if (flag & this.flags.auxiliary) {
		//? Fibery auxiliary, can be either
			if (!this.cache.types.has(data["fibery/id"])) {
				const type = new Type(this, data);
				type.flag = this.flags.auxiliaryType|this.flags.type;

				// Add the fields
				data["fibery/fields"].forEach(data => {
					const field = new Field(this, data);
					field.flag = this.flags.auxiliaryField|this.flags.field;
					this.cache.fields.set(field.id, field);
					type.append(field);
				});

				this.cache.types.set(data["fibery/id"], type);
			}
		}

	}

	/**
	 * Returns the date something was created by passing its UUID (Using UUID v1).
	 * @param {string} uuid The UUID to get the creation date of
	 * @returns {Date}
	 * @example let date = berryfi.toDate("750bb3e0-a851-11ea-9163-48203d178ac1");
	 * console.log(date.getFullYear()) // 2020
	 */
	toDate(uuid) {
		uuid = uuid.split("-");
		uuid = parseInt([uuid[2].substring(1), uuid[1], uuid[0]].join(""), 16)
		return new Date(Math.floor((uuid - 122192928000000000) / 10000));
	}

	/**
	 * Fibery fields force Sentence case on the labels, and there's inconsistencies with the API (e.g. 'name' in API, 'Name' in response).
	 * This method converts the first letter to uppercase, and leave rest as-is.
	 * @param {string} string The string input to apply uppercase to the first letter
	 * @returns {string}
	 * @example console.log(berryfi.sentenceCase("hello there World!")) // "Hello there World!"
	 */
	stentenceCase(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
};

module.exports = Berryfi;