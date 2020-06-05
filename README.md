![Berryfi logo](https://i.thevirt.us/06/Berryfi_logopng.png)
# Berryfi
Berryfi is a sweet little [Fibery.io](https://fibery.io) client based on the [Unofficial-client](https://gitlab.com/fibery-community/unofficial-js-client), but takes a step further with simplification.

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
From the Types, you can perform actions like creating or modifying entities.  

### App reference
```js
// Automatically populate Apps and Types…
await berryfi.init();
const gist berryfi.apps["GIST Planning"];

// … or create App reference manually
const gist = new berryfi.App("GIST Planning");
```

### Type reference
```js
// Use reference from loaded apps… 
const goal = gist.types["Goal"];

// … or create a new Type schema manually
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