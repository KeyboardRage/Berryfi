

/**
 * Returns an object that follows Fibery's naming conventions
 * @param {Array<object>|object} data The data to return as Fibery naming convention
 * @returns {object}
 */
function toFibery(data) {
	if (!data) throw new Error("Missing the data to check");
	if (Array.isArray(data)) {
		return meta.map(prop => {
			const d = Object();
			if (prop.secured !== undefined) d["fibery/secured?"] = prop.secured;
			if (prop.title !== undefined) d["ui/title?"] = prop.title;
			if (prop.readonly !== undefined) d["fibery/readonly?"] = prop.readonly;
			if (prop.hasId !== undefined) d["fibery/id?"] = prop.hasId;
			if (prop.id !== undefined) d["fibery/id"] = prop.id;
			if (prop.publicId !== undefined) d["fibery/public-id?"] = prop.publicId;
			if (prop.creationDate !== undefined) d["fibery/creation-date?"] = prop.creationDate;
			if (prop.collection !== undefined) d["fibery/collection?"] = prop.collection;
			if (prop.required !== undefined) d["fibery/required?"] = prop.required;
			if (prop.lookup !== undefined) d["fibery/lookup?"] = prop.lookup;
			if (prop.domain !== undefined) d["fibery/domain?"] = prop.domain;
			if (prop.hasFormula !== undefined) d["fibery/formula?"] = prop.hasFormula;
			if (prop.formula !== undefined) d["fibery/formula"] = prop.formula;
			if (prop.relation !== undefined) d["fibery/relation"] = prop.relation;
			if (prop.defaultValue !== undefined) d["fibery/default-value"] = prop.defaultValue;
			if (prop.objectEditorOrder !== undefined) d["fibery/ui/object-editor-order"] = prop.objectEditorOrder;
			if (prop.precision !== undefined) d["fibery/precision"] = prop.precision;
			if (prop.numberUnit !== undefined) d["fibery/number-unit"] = prop.numberUnit;
			if (prop.mixinIcon !== undefined) d["ui/mixin-icon"] = prop.mixinIcon;
			if (prop.isMixin !== undefined) d["app/mixin?"] = prop.isMixin;
			if (prop.primitive !== undefined) d["fibery/primitive?"] = prop.primitive;
			if (prop.mixins !== undefined) d["app/mixins"] = prop.mixins;
			if (prop.enum !== undefined) d["fibery/enum?"] = prop.enum;
			if (prop.showInMenu !== undefined) d["ui/show-in-menu?"] = prop.showInMenu;
			if (prop.meta !== undefined) d["fibery/meta?"] = prop.meta;
			if (prop.rankMixin !== undefined) d["fibery/rank-mixin"] = prop.rankMixin;
			if (prop.collabDocuments !== undefined) d["Collaboration~Documents/ReferencesMixin"] = prop.collabDocuments;
			if (prop.assignmentMixin !== undefined) d["fibery/assignments/assignments-mixin"] = prop.assignmentMixin;
			if (prop.workflow !== undefined) d["workflow/workflow"] = prop.workflow;
			if (prop.avatarMixin !== undefined) d["avatar/avatar-mixin"] = prop.avatarMixin;
			return d;
		});
	} else if (data.constructor.name === "Object") {
		const d = Object();
		if (data.secured !== undefined) d["fibery/secured?"] = data.secured;
		if (data.title !== undefined) d["ui/title?"] = data.title;
		if (data.readonly !== undefined) d["fibery/readonly?"] = data.readonly;
		if (data.hasId !== undefined) d["fibery/id?"] = data.hasId;
		if (data.id !== undefined) d["fibery/id"] = data.id;
		if (data.publicId !== undefined) d["fibery/public-id?"] = data.publicId;
		if (data.creationDate !== undefined) d["fibery/creation-date?"] = data.creationDate;
		if (data.collection !== undefined) d["fibery/collection?"] = data.collection;
		if (data.required !== undefined) d["fibery/required?"] = data.required;
		if (data.lookup !== undefined) d["fibery/lookup?"] = data.lookup;
		if (data.domain !== undefined) d["fibery/domain?"] = data.domain;
		if (data.hasFormula !== undefined) d["fibery/formula?"] = data.hasFormula;
		if (data.formula !== undefined) d["fibery/formula"] = data.formula;
		if (data.relation !== undefined) d["fibery/relation"] = data.relation;
		if (data.defaultValue !== undefined) d["fibery/default-value"] = data.defaultValue;
		if (data.objectEditorOrder !== undefined) d["fibery/ui/object-editor-order"] = data.objectEditorOrder;
		if (data.precision !== undefined) d["fibery/precision"] = data.precision;
		if (data.numberUnit !== undefined) d["fibery/number-unit"] = data.numberUnit;
		if (data.mixinIcon !== undefined) d["ui/mixin-icon"] = data.mixinIcon;
		if (data.isMixin !== undefined) d["app/mixin?"] = data.isMixin;
		if (data.primitive !== undefined) d["fibery/primitive?"] = data.primitive;
		if (data.mixins !== undefined) d["app/mixins"] = data.mixins;
		if (data.enum !== undefined) d["fibery/enum?"] = data.enum;
		if (data.showInMenu !== undefined) d["ui/show-in-menu?"] = data.showInMenu;
		if (data.meta !== undefined) d["fibery/meta?"] = data.meta;
		if (data.rankMixin !== undefined) d["fibery/rank-mixin"] = data.rankMixin;
		if (data.collabDocuments !== undefined) d["Collaboration~Documents/ReferencesMixin"] = data.collabDocuments;
		if (data.assignmentMixin !== undefined) d["fibery/assignments/assignments-mixin"] = data.assignmentMixin;
		if (data.workflow !== undefined) d["workflow/workflow"] = data.workflow;
		if (data.avatarMixin !== undefined) d["avatar/avatar-mixin"] = data.avatarMixin;
		return d;
	}
}