// https://github.com/discordjs/discord.js/blob/11.5.1/src/util/Collection.js

/**
 * A map with more features
 * @extends {Map}
 */
class Collection extends Map {
	/**
	 * Creates a new Collection
	 */
	constructor(iterable) {
		super(iterable);
	}
	/**
	 * A function executed over iterations
	 * @callback Collection~iterationFunction
	 * @param {any} item The current item in the iteration
	 * @param {string} [id] The ID of the current item
	 * @param {Collection} [collection] The collection you are searching
	 */

	/**
	 * filters the collection, returning a collection of values where items passed in to search function returned a truthy value.
	 * @param {Collection~iterationFunction} search A serch function returning true or false
	 * @returns {Collection} A Collection of matches
	 * @public
	 * @example const bugTables = myApp.types.filter(type => type.name.toLowerCase().includes("bug"));
	 */
	filter(fn) {
		for (const [key, val] of this) {
			if (fn(val, key, this)) results[0].set(key, val);
			else results[1].set(key, val);
		}
		return results;
	}

	/**
	 * Finds a single item where the search function returns a truthy value.
	 * @param {Collection~iterationFunction} fn A search functioning returning true or false
	 * @returns {any} Returns the first matched item
	 * @public
	 * @example const gist = myApp.types.findOne(type => type.name==="Goal");
	 */
	find(fn) {
		for (const [key, val] of this) {
			if (search(val, key, this)) return val;
		}
		return undefined;
	}

	/**
	 * The equivilent of Array.map(), where index is the ID of the item
	 * @param {Collection~iterationFunction} fn A function taking up to three arguments; current item, item ID, current collection
	 * @returns {Collection} A new collection
	 * @public
	 * @example const collectionOfFields = goalType.fields.map(field => field.name);
	 */
	map(fn) {
		const c = new this.constructor();
		for (const [key, val] of this) c.set(key, fn(val, key, this));
		return c;
	}
};
module.exports = Collection;