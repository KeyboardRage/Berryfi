/**
 * Represents a native or primitive in Fibery
 * @prop {string} name The Fibery name of this primitive
 * @prop {string} id The ID of this primitive
 * @prop {string} type The Fibery type of this primitive
 * @prop {object} meta The Fibery meta for this primitive
 */
class Primitive {
	/**
	 * Creates a new primitive
	 * @param {object} data The data directfly from Fibery
	 */
	constructor(data) {
		if (!data) throw new Error("Missing data");
		this.name = data["fibery/name"];
		this.type = data["fibery/type"];
		this.meta = data["fibery/meta"];
		this.id = data["fibery/id"];
	}

	/**
	 * Returns fibery/meta -> fibery/secure? value
	 * @returns {boolean}
	 */
	get isSecure() {
		return this.meta["fibery/secure?"];
	}
	/**
	 * Returns fibery/meta -> fibery/modification-date? value
	 * @returns {boolean}
	 */
	get hasModificationDate() {
		return this.meta["fibery/modification-date?"];
	}
	/**
	 * Returns fibery/meta -> fibery/id? value
	 * @returns {boolean}
	 */
	get isId() {
		return this.meta["fibery/id?"];
	}
	/**
	 * Returns fibery/meta -> fibery/readonly? value
	 * @returns {boolean}
	 */
	get readOnly() {
		return this.meta["fibery/readonly?"];
	}
	/**
	 * Returns fibery/meta -> fibery/default-value value
	 * @returns {strign|object}
	 */
	get defaultValue() {
		return this.meta["fibery/default-value"];
	}
	/**
	 * Returns fibery/meta -> ui/object-editor-order value
	 * @returns {number}
	 */
	get objectEditorOrder() {
		return this.meta["ui/object-editor-order"];
	}
	/**
	 * Returns fibery/meta -> ui/title? value
	 * @returns {boolean}
	 */
	get title() {
		return this.meta["ui/title?"];
	}
	/**
	 * Returns fibery/meta -> fibery/required? value
	 * @returns {boolean}
	 */
	get required() {
		return this.meta["fibery/required?"];
	}
	/**
	 * Returns fibery/meta -> fibery/public-id? value
	 * @returns {boolean}
	 */
	get isPublicId() {
		return this.meta["fibery/public-id?"];
	}
	/**
	 * Returns fibery/meta -> fibery/collection? value
	 * @returns {boolean}
	 */
	get collection() {
		return this.meta["fibery/collection?"];
	}
	/**
	 * Returns fibery/meta -> fibery/relation value
	 * @returns {string}
	 */
	get relation() {
		return this.meta["fibery/relation"];
	}
	/**
	 * Returns fibery/meta -> fibery/primitive? value
	 * @returns {boolean}
	 */
	get primitive() {
		return this.meta["fibery/primitive?"];
	}
	/**
	 * Returns fibery/meta -> fibery/domain? value
	 * @returns {boolean}
	 */
	get domain() {
		return this.meta["fibery/domain?"];
	}
	/**
	 * Returns fibery/meta -> ui/number-unit value
	 * @returns {string}
	 */
	get unit() {
		return this.meta["ui/number-unit"];
	}
	/**
	 * Returns fibery/meta -> ui/precision value
	 * @returns {boolean}
	 */
	get precision() {
		return this.meta["ui/precision"];
	}
	/**
	 * Returns fibery/meta -> app/mixins value
	 * @returns {object}
	 */
	get mixins() {
		return this.meta["app/mixins"];
	}
	/**
	 * Returns fibery/meta -> app/mixin? value
	 * @returns {boolean}
	 */
	get mixin() {
		return this.meta["app/mixin?"];
	}
	/**
	 * Returns fibery/meta -> ui/color value
	 * @returns {string}
	 */
	get color() {
		return this.meta["ui/color"];
	}
	/**
	 * Returns fibery/meta -> app/mixin-create-relation? value
	 * @returns {boolean}
	 */
	get mixinCreateRelation() {
		return this.meta["app/mixin-create-relation?"];
	}
	/**
	 * Returns fibery/meta -> ui/mixin-icon value
	 * @returns {string}
	 */
	get icon() {
		return this.meta["ui/mixin-icon"];
	}
	/**
	 * Returns fibery/meta -> ui/show-in-menu? value
	 * @returns {boolean}
	 */
	get showInMenu() {
		return this.meta["ui/show-in-menu?"];
	}
	/**
	 * Returns fibery/meta -> fibery/unique? value
	 * @returns {boolean}
	 */
	get unique() {
		return this.meta["fibery/unique?"];
	}

	/**
	 * Converts the Primitive to use Fibery's native layout
	 * @returns {object}
	 */
	toFibery() {
		return {
			"fibery/name": this.name;
			"fibery/type": this.type,
			"fibery/meta": this.meta;
			"fibery/id": this.id;
		}
	}
}