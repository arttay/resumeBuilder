var fs = require("fs");
var path = require("path");

var baseTmplPath = path.join(__dirname, "..", "templates/base.tmpl.html");
var aboutTmplPath = path.join(__dirname, "..", "templates/about.tmpl.html");
var previousWorkTmplPath = path.join(__dirname, "..", "templates/previousWork.tmpl.html");

/*
var baseTmpl = fs.readFileSync(baseTmplPath, "utf8");
var aboutTmpl = fs.readFileSync(aboutTmplPath, "utf8");
var previousWorkTmpl = fs.readFileSync(previousWorkTmplPath, "utf8");
*/

var tmplObj = {
	baseTmpl: fs.readFileSync(baseTmplPath, "utf8"),
	aboutTmpl: fs.readFileSync(aboutTmplPath, "utf8"),
	previousWorkTmpl: fs.readFileSync(previousWorkTmplPath, "utf8")
};

var obj = {
	build: function (attrs) {
		this.processAttrs(attrs);
		this.tmpl = "";
	},
	mapClass: function () {
		//todo: do I really need this?
		return {
			"basic_About": "aboutBasic",
			"skills_About": "aboutSkills",
			"contact_About": "aboutContact"
		}
	},
	mapAttributes: function () {
		return {
			baseTmpl: ["one", "two"],
			aboutTmpl: ["aboutBasic", "aboutSkills", "aboutContact"],
			previousWorkTmpl: ["three", "four"]
		}
	},
	findTemplate: function (prop) {
		var attrs = this.mapAttributes();
		for (var key in attrs) {
			var item = attrs[key];
			for (var k in item) {
				if (prop === item[k]) {
					return key;
				}
			}
		}
	},
	processAttrs: function (attr) { 
		for (var key in attr) {
			var item 	= attr[key],
				len 	= item.value.length - 1,
				tmpl 	= "";
			for (var k in item.value) {
				var item2 = item.value[k];
				if (item2.value instanceof Array) {
				} else {
					tmpl += this.templates().item.replace(/\{itemName\}/, item2.displayName).replace(/\{itemValue\}/, item2.value);
					if (len === parseInt(k)) {
						var mapKey = this.mapClass()[key]
						var tmpl = this.findTemplate(mapKey);
						this.renderTmpl(mapKey, tmpl);
					}	
				}
			}
		}
	},
	processItems: function (attr) {
		var str = "";
		var len = attr.length - 1;
		attr.map(function (item, key) {
			str += item + (key !== len ? ", " : "");
		});
		return str;
	},
	templates: function () {
		return {
			item: "<div><span class='property'>{itemName}</span>: {itemValue}</div>"
		}
	},
	renderTmpl: function (key, tmpl) {
		key = "{" + key + "}";
		var re = new RegExp(key,"g");
		console.log(re);

		tmplObj[tmpl].replace(re, "foo");
		//console.log(tmplObj[tmpl]);
	},
	builderIo: function () {

	}
};

module.exports = obj;