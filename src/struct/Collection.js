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
	 * filters the collection, returning a collection of values where items passed in to search function returned a truthy value.
	 * @param {function} search A serch function returning true or false
	 * @returns {Collection} A Collection of matches
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
	 * Searches for a single item where its specified property's value is identical to the given value
	 * (`item[prop] === value`), or the given function returns a truthy value. In the latter case, this is identical to
	 * Array.find().
	 * @param {string|Function} propOrFn The property to test against, or the function to test with
	 * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
	 * @returns {*}
	 * @example
	 * collection.find('username', 'Bob');
	 * @example
	 * collection.find(val => val.username === 'Bob');
	 */
	find(propOrFn, value) {
		if (typeof propOrFn === 'string') {
		if (typeof value === 'undefined') throw new Error('Value must be specified.');
		for (const item of this.values()) {
			if (item[propOrFn] === value) return item;
		}
		return null;
		} else if (typeof propOrFn === 'function') {
		for (const [key, val] of this) {
			if (propOrFn(val, key, this)) return val;
		}
		return null;
		} else {
		throw new Error('First argument must be a property string or a function.');
		}
	}

	/**
	 * The equivilent of Array.map(), where index is the ID of the item
	 * @param {function} fn A function taking up to three arguments; current item, item ID, current collection
	 * @returns {Collection} A new collection
	 * @example const collectionOfFields = goalType.fields.map(field => field.name);
	 */
	map(fn) {
		const c = new this.constructor();
		for (const [key, val] of this) c.set(key, fn(val, key, this));
		return c;
	}
};
module.exports = Collection;