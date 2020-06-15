![Berryfi logo](https://i.thevirt.us/06/Berryfi_logopng.png)  
Berryfi is a sweet little [Fibery.io](https://fibery.io) client focused on interaction with your pre-established Apps, Types, and Fields, create or modify entities of Types. It has context based approach with accessible children and parent you can perform logical actions via.

# Installation
For now;  
`npm install --save KeyboardRage/Berryfi`  

# Setup
```js
const Berryfi = require("Berryfi");
const berryfi = new Berryfi({
	workspace: "mycompany",
	token: "aaaaaaa.bbbbbbbbbbbbbbbbbbbb"
});

// Populate Apps, Types, and Fields
await berryfi.pull();
```

**Development**  
If you're playing around with it and doing a lot of `berryfi.pull()` during development, the following may be beneficial.  

By passing `cacheSchema: true` and `schemaPath: path.join(__dirname, "fiberycache.json")` Berryfi will store the Schema from Fibery in to the specififed `schemaPath` file on first load. From that point on it will find the file and `require()` it—making it load much faster and not make unnecessary schema requests to Fibery when starting up.  

ℹ The cached file is never considered stale. You can simply rename or delete the file and it will require and store a new schema.
```js
const path = require("path");
const Berryfi = require("Berryfi");
const berryfi = new Berryfi({
	workspace: "mycompany",
	token: "aaaaaaa.bbbbbbbbbbbbbbbbbbbb",
	cacheSchema: true,
	schemaPath: path.join(__dirname, "fiberycache.json")
});

await berryfi.pull(); // Pulled from Fibery's API
await berryfi.pull(); // Now pulled much faster by doing `require()` on a local JSON file.
```

# Documentation
Berryfi is documented with JSDoc. [See documentation](https://keyboardrage.github.io/berryfi/Berryfi.html).

# Limitations
Berryfi is early development, so it's lacking most things. For now, it works to load all your Apps, Types, and Fields—Entities cannot be pulled yet, but will be made, however *on demand* as they can be infinite.  
Berryfi is also not meant for account interations, like managing users, access control, and so on.  

# Roadmap
* Make pulling and querying for entities possible
* Possibility of creating, using, and modifying more "advanced" fields like relations, workflow, dropdowns etc.
* Simplify and streamline state changing
* Deletion of entities
* More robust and predictable state updating
* Better Readme "guide" instead of just directing to documentation
* … much more
