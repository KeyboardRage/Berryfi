![Berryfi logo](https://i.thevirt.us/06/Berryfi_logopng.png)  
Berryfi is a sweet little [Fibery.io](https://fibery.io) client built on top of the [Unofficial client](https://gitlab.com/fibery-community/unofficial-js-client), but takes a step further with simplification.
Everything possible in the Unofficial client can also be done in Berryfi.

The focus of Berryfi is to simplify interaction with pre-established Apps, Types, and Fields. However interaction outside of this scope is still possible by calling the base client's original "commands".

## Getting started
**Installing** 
`npm install berryfi`  

**Getting your token:**  
See [Fibery API](https://api.fibery.io/#authentication) on how to generate a token.

**Setup**  
```js
const Berryfi = require("berryfi");
const berryfi = new Berryfi({
    host: 'YOUR_ACCOUNT.fibery.io',
    token: 'YOUR_TOKEN'
});
```

## References
Berryfi creates a simple context bound to the individual Apps.  
This way you can easily perform actions on specific Apps, like adding or modifying Types.  
From the Types, you can reference, modify, and create Fields.
You can also create, modify, and delete Entities of a Type through its Type.

### Automatic loading
You can use the `berryfi.load()` method to request the current state of Apps, Types, and Fields from Fibery.

Loading resets the Berryfi.apps collection before loading a fresh batch to take its place. This severs reference link between the two.
```js
// Automatically populate Apps, Types, and Fields
await berryfi.load();

const gistApp = berryfi.apps.get("GIST Planning");
console.log(berryfi.apps.get("GIST Planning") === gistApp); // true

await berryfi.load();
console.log(berryfi.apps.get("GIST Planning") === gistApp); // false
```

### Manual loading
You can define your own set of Apps, Types, and Fields.
If the name and data is correct, everything should work just expected from those made from automatic loading.

```js
// Create App reference—assuming an app by this name already exist inyour Fibery workspace.
const contactApp = new berryfi.App("Contacts");

// Create the fields at the same time as the Type …
const userType = new contactApp.Type({
	name: "Person",
	fields: [{
		name: "Name",
		type: "text"
	}, {
		name: "Age",
		type: "number",
		unit: "yrs",
		format: "double",
		precision: 2 // e.g. for 23.87
	}]
});

// … or create standalone fields…
const email = new contactApp.Field({
	name: "Email",
	type: "email"
});
const employed = new contactApp.Field({
	name: "Employed",
	type: "check"
});
// … then pass them in to the 'fields'.
const customerType = new contactApp.Type({
	name: "Customer",
	fields: [email, employed]
})
```

### Collections
Collections is basically a JavaScript Map with some additional features. See the API documentation for which additional methods are available.

All collections' entries are stored with the ID of item as the key—except for Apps, which is more of an arbitrary concept of a group, thus it does not have an ID. Instead the key name for these wil be the literal name of the apps (*case sensitive*).


### Fibery schema
* Any `fibery/id` is an `UUID/v1`.
* Apps are not their own entity. They're more of a container, so they do not have an ID and properties.
* Types are prefixed with the App name to make up the App.
* An app have always three fields: `fibery/name: String`, `fibery/fields: Object[]`, and `fibery/meta: Object`.
* What the `fibery/meta` contains vary`and may optionally be empty.
* `fibery/fields` may be empty.
* Every object in `fibery/fields` are always made up of 4 keys: `fibery/name: String`, `fibery/type: String`, `fibery/id: String`, and `fibery/meta: Object`.
* Like with Apps, what the `fibery/meta` of a `fibery/fields` contain vary, and may be empty.

Berryfi simplifies the naming of these by omitting `fibery/`.  


### App reference
**What is an app?**  
In Fibery, it's the group you can open/collapse on the navigational panel that has various views in it, with an outlined icon and coloured background next to the name of the App.

**Getting an App reference**  
You can get App references either by creating them manually, or accessing them after using the loader.

```js
await berryfi.load();
const gistApp = berryfi.apps.get("GIST Planning");

// … or create App reference manually
const gistApp = new berryfi.App("GIST Planning");
```

### Type reference
Just like the `Berryfi.apps` has a collection of `Apps` + a class to create new ones, an `App` has a collection of `Types` and a class to create new Types.

```js
// The collections can also be searched for a matching condition… 
const goalType = gistApp.types.find(type => type.name === "Goal");

// … or create a new Type manually
const goalType = new gistApp.Type("Goal", {
	"Description": String,
	"Key Results": String,
	"Planned": Date
});
```

### Field reference
Following the pattern, each `Type` has a Collection of `Fields` and a `Field` class you can use to construct new ones with.
Additionally, since you may not have the Type if you're creating fields at the same time, you can access the `Field` class through the `App` as well.

```js
// New field through Type
const emplyed = new goalType.Field({
	name: "Employed",
	type: "check"
});

// New field through App
const email = new contactApp.Field({
	name: "Email",
	type: "email"
});

// Get a Field from the Type
const nameField = goalType.fields.find(field => field.name === "Name");
```

### Entity reference
To avoid unpredictably large amounts of data, Fibery loads somewhat "lazily".  
This is why all the entries are not loaded, however you can easily load them manually on demand.  
  
Calling `.load()` on a `Type` will load all the `Entities` of a given `Type`, which can also take a couple of filters.
To avoid potential huge amounts of load, a default filter is used to limit the amount of returned/loaded `Entities`. This limit can be turned off.  
  
⚠ **Warning** Turning off filters result in a *huge* amount of `Entities` being returned and loaded, as Fibery has no limit on the amount of `Entities` you can have per `Type`—nor do they enforce an upper limit on max returned `Entities`.
```js
// Search cache for entities
const someGoal = goal.entities.find(entity => entity.name === "A wonderful goal! 🚩");

// … or create a new Entity manually
const someGoal = new goal.Entity("A wonderful goal! 🚩", {
	"Description": "Here are some details about this goal",
	"Key Results": "More info about key results",
	"Planned": new Date(Date.now() + 1000*60*60*24*3)
});

// … or get a specific entity by ID
const specificEnt = await goal.fetch(entityId);
```

**Entity .load() filter**
To limit the returned results you can use a filter when loading entities.


## Basic actions
### New entity
```js
const someGoal = new goal.Entity("A wonderful goal! 🚩", {
	"Description": "Here are some details about this goal",
	"Key Results": "More info about key results",
	"Planned": new Date(Date.now() + 1000*60*60*24*3)
});

// Push current state to Fibery
someGoal.push();
```

### Update entity
The same `entity.push()` method is used to update changes.
```js
someGoal.prop.Plannet = new Date(Date.now() + 1000*60*60*24*7);
someGoal.prop.Description = "New details about this goal. We pushed planned date another 4 days forward.";
someGoal.prop["Key Results"] = null;

// Update with new state.
// Wipe 'Key Results' field as it was set to null.
await someGoal.push();
```

### Get entity data
If you want to make sure your fields don't conflict with that in Fibery, you can first perform a pull to update an entity's properties.
```js
console.log(someGoal.prop["Description"]) // 'New details about this goal. We pushed planned date another 4 days forward'
await someGoal.pull();
console.log(someGoal.prop["Description"]) // 'Near completion. Just missing some stuff. 3 days left!'

let daysLeft = Math.ceil((someGoal.prop.Planned.getTime() - Date.now()) / 1000/24/60/60);
someGoal.prop.Description = `Near completion. Just missing some stuff. ${daysLeft} days left!`;
await someGoal.push();
```