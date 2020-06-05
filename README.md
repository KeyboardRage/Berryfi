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

**Create app reference**
Berryfi creates a simple context bound to the individual Apps.
This way you can easily perform actions on specific Apps, like adding or modifying Types.
From the Types, you can perform actions like creating or modifying entities.

```js
// create App reference
const gistApp = new berryfi.App("GIST Planning");

// create Type reference in App
const goal = new gistApp.Type("Goal", {
	"Description": String,
	"Key Results": String,
	"Planned": Date
});

```

## Entities
### Create entity
**Insert a single entity**