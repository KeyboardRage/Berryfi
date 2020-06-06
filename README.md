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

## Setting up your references
Berryfi creates a simple context bound to the individual Apps.  
This way you can easily perform actions on specific Apps, like adding or modifying Types.  
From the Types, you can reference, modify, and create entities.

### Automatic loading
You can use the `berryfi.load()` method to request the current state of Apps, Types, and Fields from Fibery.

Loading resets the Berryfi.apps collection before load a fresh batch. This severs references between the two.
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
If the names and data is correct, everything should work just as fine as leaving it to the automatic loading.

```js
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
		precision: 2 // 23.87
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

### Berryfi reference
The created Berryfi client contains a Collection of apps, conviniently named 'apps'.


### App reference
**What is an app?**
In Fibery, it's the group you can open/collapse on the navigational panel that has various views in it, with an outlined icon and coloured background next to the name of the App.

**Getting an App reference**
You can get App references either by creating them manually, or accessing them after using the loader.

```js
await berryfi.load();
const gist berryfi.apps.get("GIST Planning");

// … or create App reference manually
const gist = new berryfi.App("GIST Planning");
```

### Type reference
```js
// Use reference from a populated Type… 
const goal = gist.types.findOne(type => type.name === "Goal");

// … or create a new Type manually
const goal = new gist.Type("Goal", {
	"Description": String,
	"Key Results": String,
	"Planned": Date
});
```

### Entity reference
```js
// Use reference loaded from apps… 
const someGoal = goal.entities.find(entity => entity.name === "A wonderful goal! 🚩");

// … or create a new Entity manually
const someGoal = new goal.Entity("A wonderful goal! 🚩", {
	"Description": "Here are some details about this goal",
	"Key Results": "More info about key results",
	"Planned": new Date(Date.now() + 1000*60*60*24*3)
});
```

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
