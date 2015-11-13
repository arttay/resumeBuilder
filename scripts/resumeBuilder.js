var fs = require("fs");
var path = require("path");

var baseTmplPath = path.join(__dirname, "..", "templates/base.tmpl.html");
var aboutTmplPath = path.join(__dirname, "..", "templates/about.tmpl.html");
var previousWorkTmplPath = path.join(__dirname, "..", "templates/previousWork.tmpl.html");
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
		var self = this;
		for (var key in attr) {
			if (key === "previous_work") {
				var previousWorkTmpl = this.processWork(attr[key]);
				var  previousTmpl = self.renderTmpl("previousWork", "previousWorkTmpl", previousWorkTmpl);
			} else {
				var item 	= attr[key],
				len 		= item.value.length - 1,
				tmpl 		= "";
				for (var k in item.value) {
					var item2 = item.value[k];
					if (item2.value instanceof Array) {
						tmpl += this.templates().item.replace(/\{itemName\}/, item2.displayName).replace(/\{itemValue\}/, this.processItems(item2.value)).replace(/\{className\}/, this.checkPropClass(item2));
						if (len === parseInt(k)) {
							var mapKey = this.mapClass()[key]
							var tmplName = this.findTemplate(mapKey);
							this.renderTmpl(mapKey, tmplName, tmpl);
						}
					} else {
						tmpl += this.templates().item.replace(/\{itemName\}/, item2.displayName).replace(/\{itemValue\}/, this.checkProps(item2)).replace(/\{className\}/, this.checkPropClass(item2));
						if (len === parseInt(k)) {
							var mapKey = this.mapClass()[key]
							var tmplName = this.findTemplate(mapKey);
							this.renderTmpl(mapKey, tmplName, tmpl);
						}	
					}
				}
			}	
		}
		this.renderTmpl("previousWorkTmpl", "baseTmpl", previousTmpl)
		this.renderTmpl("aboutTmpl", "baseTmpl", tmplObj["aboutTmpl"]);

		var foo = this.renderTmpl("previousWorkTmpl", "baseTmpl", previousTmpl)
		console.log(foo);

		this.builderIo(tmplObj["baseTmpl"]);
	},

	processWork: function (arr) {
		var tmpl = "";
		var self = this;
		arr.forEach(function (item, key) {
			//console.log(key, item);
			for (var key in item) {
				if (key === "company") {
					console.log(item[key]);
					tmpl += self.templates().previousCompany.replace(/\{companyName\}/, item[key]);
				}
				if (key === "to" || key === "from" || key === "title") {
					tmpl += self.templates().singleLineString.replace(/\{key\}/, key).replace(/\{value\}/, item[key]);
				}
				if (key === "responsibilities" || key === "accomplishments") {
					tmpl += self.templates().multiLineString.replace(/\{key\}/, key).replace(/\{value\}/, item[key]);
				}

				//console.log(typeof item[key]);

				if(Array.isArray(item[key])) {
					//console.log(item[key]);
				}
				
			}
			
			tmpl += self.templates().endLine;
		});
		
		return tmpl;
	},

	processItems: function (attr) {
		var str = "";
		var len = attr.length - 1;
		attr.map(function (item, key) {
			str += item + (key !== len ? ", " : "");
		});
		return str;
	},

	checkProps: function (item) {
		if (item.hasOwnProperty('url')) {
			return this.checkSpecialProp(item);
		} else {
			return item.value;
		}
	},

	checkPropClass: function (item) {
		return item.hasOwnProperty("className") ? item.className : "";
	},
	
	checkSpecialProp: function (item) {
		var tmpl = "";
		if (item.hasOwnProperty('url')) {
			tmpl += this.templates().url.replace(/\{urlLink\}/g, item.url).replace(/\{urlText\}/g, item.linkText || item.url);
		}
		return tmpl;
	},
	templates: function () {
		return {
			item: "<div class='{className}'><span class='property'>{itemName}</span>: {itemValue}</div>",
			endLine: "<div class='indentTitle'>}</div>",
			previousCompany: "<div class = 'indentTitle class'>.{companyName} <span class = 'colorWhite'>{</span></div>",
			previousSingleLine: "<div class='displayBlock indent'><span class = 'property'>{key}</span>: &nbsp; {value};</div>",
			singleLineString: "<div class='displayBlock indent'><span class = 'property'>{key}</span>: &nbsp; <span class='string'>\"{value}\"</span>;</div>",
			multiLineString: "<div class='displayBlock indent mediaObj clearfix'><span class = 'property leftObj'>{key}<span class='colorWhite'>:</span></span> &nbsp; <span class='string multiLine rightObj'>\"{value}\";</span></div>",
			url: "<a href='{urlLink}'><span class='colorWhite'>url(</span><span class='propertyLink'>&nbsp;{urlText}&nbsp;</span><span class='colorWhite'>)</span></a>"
		}
	},
	renderTmpl: function (key, tmplName, tmpl) {
		key = "\{" + key + "\}";
		var re = new RegExp(key,"g");
		tmplObj[tmplName] = tmplObj[tmplName].replace(re, tmpl);
		return tmplObj[tmplName];
	},
	builderIo: function (tmpl) {
		var styleNewPath = path.join(__dirname, "..", "build/base.css");
		var styleOldPath = path.join(__dirname, "..", "styles/base.css");

		fs.writeFile("./build/index.html", tmpl, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The file was saved!");
		});
		fs.createReadStream(styleOldPath).pipe(fs.createWriteStream(styleNewPath));
	}
};

module.exports = obj;