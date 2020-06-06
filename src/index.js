const request = require("request-promise-native");
const Fibery = require("fibery-unofficial");
const Type = require("./struct/BaseType");
const Entity = require("fibery-unofficial/source/entity");
const Field = require("fibery-unofficial/source/field");
const Collection = require("./struct/Collection");
const AppType = require("./struct/AppType");
const { RestrictedAppNames } = require("./struct/constants");
const { version, homepage } = require("../package.json");

/**
 * Represents a Berryfi client. Berryfi is a library built on top of the Unofficial Fibery client. Anything you can do with that client, you can do with this one as well.
 * @description Berryfi is a library built on top of the Unofficial Fibery client (https://gitlab.com/fibery-community/unofficial-js-client/). Anything you can do with that client, you can do with this one as well.
 * @extends {Fibery}
 * @prop {Collection<AppType>} apps A Collection of loaded apps from the user's workspace
 * @prop {Class<AppType>} App A class for creating new Apps
 */
class Berryfi extends Fibery {
	/**
	 * Creates a new Berryfi client
	 * @param {string} token Your Fibery.io token. How to get your token on the Authentication of the Fibery API.
	 * @param {string} host Your Fibery workspace domain. You can get this from the URL: https://{host name here}.fibery.io/
	 * @see https://api.fibery.io/?shell#authentication
	 * @example const Berryfi = require("Berryfi");
	 * const berryfi = new Berryfi({
	 * 	host: "somewhere.fibery.io",
	 * 	token: "a1a1a1a1a1.b2b2b2b2b2b2b2b2b2b2b2b2b2"
	 * });
	 */
	constructor({token, host}) {
		super({token, host});
		
		this.__token = token;
		this.__host = host;

		this.__version = version;
		this.__homepage = homepage;
		this.App = App;
		this.apps = new Collection();
	}

	/**
	 * Makes a request to Fibery and loads all the Apps, Types, and Fields the user has created automatically.
	 * @returns {Promise}
	 * @example await berryfi.load();
	 * console.info("Successfully loaded %s apps.", berryfi.apps.size)
	 */
	async load() {
		// Fetch types list from Fibery
		let rawData = await Promise.resolve(this.req("/commands"));
		if (!rawData) throw new Error("No data recieved from Fibery");
		if (Array.isArray(rawData)) rawData = rawData[0];
		this.apps = new Collection();

		// Iterate over returned schemas and generate user defined Types
		for(var i=0;i<rawData["fibery/types"].length;i++) {
			// Is a Fibery native type, skip
			if (rawData["fibery/types"][i]["fibery/name"].startsWith("fibery/") || RestrictedAppNames.includes(rawData["fibery/types"][i]["fibery/name"].split("/")[0].toLowerCase())) continue;

			const appId = rawData["fibery/types"][i]["fibery/name"].split("/")[0];
			let app = this.apps.get(appId);

			// Create new app if it doesn't exist
			if (!app) {
				app = new this.App(rawData["fibery/types"][i]["fibery/name"].split("/")[0]);
				this.apps.set(app.name, app);
			}

			// Drop nested auxiliary Types
			if (!rawData["fibery/types"][i]["fibery/meta"]["fibery/domain?"]) continue;

			const typeId = rawData["fibery/types"][i]["fibery/id"];
			let type = app.types.get(typeId);
			
			// Create new type if it doesn't exist
			if (!type) {
				type = new app.Type(rawData["fibery/types"][i]["fibery/id"], rawData["fibery/types"][i]);
				app.types.set(type.name, type);
			}
		}
	}

	/**
	 * Make an HTTP request to Fibery
	 * @param {string} endpoint URL endpoint to send request to
	 * @param {string} [method="POST"] The HTTP method to use
	 * @returns {Promise<object>}
	 * @example const entity = await berryfi.req("/commands");
	 */
	async req(endpoint, method="POST") {
		console.log(`Request: https://${this.__host}/api${endpoint}`);

		let response = await request({
			url: `https://${this.__host}/api${endpoint}`,
			method: method,
			headers: {
				"Authorization": `Token ${this.__token}`,
				"X-Client": `Berryfi ${this.__version}`,
				"User-Agent": `Berryfi (${this.__homepage}, ${this.__version})`
			},
			json: [{ command: "fibery.schema/query" }]
		});

		const errors = response.reduce((acc, res, i) => {
			if (!res.success) return acc.concat(`Error while executing command '${commands[i].command}': ${res.result.message}`);
			else return acc;
		}, []);

		if (errors.length) throw new Error(errors.join('\n'));

		return response.map(res => res.result);
	}
};

const brr = new Berryfi()

module.exports = Berryfi;