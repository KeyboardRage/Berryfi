const fs = require("fs");
const path = require("path");
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
 * @prop {object} fibery Last update from Fibery and its state
 * @prop {Collection<App>} apps A collection of apps cached. Key is App name.
 * @prop {Collection<Type>} types A collection of types cached. Key is type ID.
 * @prop {Collection<Field>} fields A collection of fields cached. Key is field ID.
 * @prop {Collection<Entity>} entities A collection of entities cached. Key is entity ID.
 * @prop {Flags} flags An object of flags that can be used to check boolean values of data.
 */
class Berryfi {
	/**
	 * Creates a new Berryfi client
	 * @param {object} config Configuration for the Berryfi client
	 * @param {string} config.workspace The name of your workspace. Can be found in url: https://{workspace name}.fibery.io/
	 * @param {string} config.token Your Fibery token. Check Fibery API documentation on how to get your token.
	 * @param {boolean} [config.cacheSchema=false] Meant for debugging and development. If true, caches the returned Fibery Schema in the config.schemaPath as a JSON file. Berryfi will try to check this location on creation, or Berryfi.pull(), and use the data there if found. If not, it will write it if connected to Fibery, and then from that point on read from that cache. The schema cache is never considered stale, so you either have to delete or rename the file to make Berryfi make a new updated one.
	 * @param {string} [config.schemaPath] Meant for debugging and development. An absolute path to the location where the Fibery schema overview will be saved. Berryfi fill try to read the file in this location on creation, or Berryfi.pull(), and use the data there if found.
	 * @see https://api.fibery.io/?shell#authentication
	 * @example const Berryfi = require("Berryfi");
	 * 
	 * const berryfi = new Berryfi({
	 * 	workspace: "somewhere",
	 * 	token: "a1a1a1a1a1.b2b2b2b2b2b2b2b2b2b2b2b2b2"
	 * });
	 * 
	 * // If restarting a lot, debuggin, testing etc. you should check Schema caching.
	 * const berryfi = new Berryfi({
	 * 	workspace: "somewhere",
	 * 	token: "a1a1a1a1a1.b2b2b2b2b2b2b2b2b2b2b2b2b2",
	 * 	cacheSchema: true,
	 * 	schemaPath: path.join(__dirname, "schemaCache.json")
	 * });
	 */
	constructor(config) {
		if (!config.workspace) throw new Error("Missing workspace name");
		if (!config.token) throw new Error("Missing Fibery API token");

		this.workspace = config.workspace;
		this._token = config.token;
		this._cacheSchema = config.cacheSchema && config.schemaPath ? true : false;
		this._schemaPath = config.schemaPath;
		if (this._cacheSchema && !path.isAbsolute(this._schemaPath)) throw new Error(`The schema path must be absolute`);
		var _config = require("../package.json");
		this._version = _config.version;
		this.req = got.extend({
			method: "POST",
			prefixUrl: `https://${this.workspace}.fibery.io/api`,
			responseType: "json",
			headers: {
				"User-Agent": `Berryfi/${this._version} (${_config.homepage})`,
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

		this.fibery = Object();
		this.apps = new Collection();
		this.types = new Collection();
		this.fields = new Collection(),
		this.entities = new Collection();

		//TODO ******************************
		/**
		 * @todo Make the path reading thing see if file passed (if so, must be .json). Else check if path. Auto-fix.
		 */
		if (this._cacheSchema) {
			try {
				// Try to read file
				let e = require(this._schemaPath);
				this._readSchemas(e);
			} catch (_) {}
		}
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

		// console.log("Exec: ", body);
		const errors = body.reduce((acc, res, i) => {
			if (!res.success) return acc.concat(`Error while executing command: ${res.result.message}`);
			else return acc;
		}, []);
		if (errors.length) throw new Error(errors.join('\n'));

		if (this._usingInit) {
			this.fibery = {
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
		if (this._cacheSchema) {
			// Try to read file
			try {
				let e = require(this._schemaPath);
				return this._readSchemas(e);
			} catch(_) { }
		}

		this._usingInit = true;
		let rawData = await this.exec([{ command: "fibery.schema/query" }]);

		if (!rawData) throw new Error("No data recieved from Fibery");
		if (this._cacheSchema) {
			try {
				// Cache file
				fs.writeFileSync(this._schemaPath.endsWith(".json") ? this._schemaPath : path.join(this._schemaPath, "fiberySchemaCache.json"), JSON.stringify(rawData[0]["fibery/types"]));
			} catch (_) {
				console.error(_);
			}
		}
		return this._readSchemas(rawData[0]["fibery/types"]);
	}

	/**
	 * Reads the Fibery API schema overview and create cache of Types, Apps, and Fields.
	 * @param {Array<object>} schemas An array of Fibery Types
	 * @private
	 */
	_readSchemas(schemas) {
		schemas.forEach(type => {
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
			if (!this.fields.has(data["fibery/id"])) {
				const type = new Field(this, data);
				type.flag = this.flags.primitive|this.flags.field;
				this.fields.set(data["fibery/id"], type);
			}
		}

		if (flag & this.flags.userCreated) {
		//? User created Type
			let app = this.apps.get(data["fibery/name"].split("/")[0]);

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
				this.fields.set(field.id, field);
				type.append(field);
			});

			// Append Type to the App
			app.append(type);

			// Update caches
			this.apps.set(app.id, app);
			this.types.set(type.id, type);
		}

		if (flag & this.flags.auxiliary) {
		//? Fibery auxiliary, can be either
			if (!this.types.has(data["fibery/id"])) {
				const type = new Type(this, data);
				type.flag = this.flags.auxiliaryType|this.flags.type;

				// Add the fields
				data["fibery/fields"].forEach(data => {
					const field = new Field(this, data);
					field.flag = this.flags.auxiliaryField|this.flags.field;
					this.fields.set(field.id, field);
					type.append(field);
				});

				this.types.set(data["fibery/id"], type);
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