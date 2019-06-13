(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Studienablaufplan {
	constructor(name, semesters) {
		this.name = name;
		this.semesters = semesters;
		this.semesterAnzahl = semesters.length;
	}

	addSemester(semester) {
		this.semesters.push(semester);
		this.semesterAnzahl++;
	}

	removeSemester(index) {
		this.semesters[index].empty();
	}
}
class Semester {
	constructor() {
		this.modules = [];
		this.ectsMax = 0;
	}

	addModule(module) {
		this.modules.push(module);
		this.ectsMax += module.ects;
	}

	removeModule(index) {
		this.modules.splice(index, 1);
		this.ectsMax -= module.ects;
	}

	empty() {
		this.modules = [];
		this.ectsMax = 0;
	}
}

class Modul {
	constructor(name, ects) {
		this.name = name;
		this.ects = ects;
	}
}

class ListElement {
	constructor(x, y, name, plan) {
		this.name = name;
		if (plan !== undefined) {
			this.plan = plan;

			this.stud = document.createElement("div");
			this.stud.id = this.name;
			this.stud.style.position = "absolute";
			this.stud.style.left = x + "px";
			this.stud.style.top = y + "px";

			this.nameButton = document.createElement("button");
			this.nameButton.innerHTML += this.name;
			this.nameButton.className = "name";
			this.nameButton.onclick = (event) => {
				console.log(event.target);
			};

			this.editButton = document.createElement("button");
			this.editButton.innerHTML = "Edit";
			this.editButton.onclick = (event) => {
				this.edit();
			};

			this.deleteButton = document.createElement("button");
			this.deleteButton.innerHTML = "Delete";
			this.deleteButton.onclick = (event) => {
				this.delete();
			};

			this.stud.appendChild(this.nameButton);
			this.stud.appendChild(this.editButton);
			this.stud.appendChild(this.deleteButton);
		}
		else {
			this.stud = document.createElement("div");
			this.stud.style.position = "absolute";
			this.stud.style.left = x + "px";
			this.stud.style.top = y + "px";

			this.addButton = document.createElement("button");
			this.addButton.innerHTML += "+";
			this.addButton.onclick = (event) => {
				if (this.add()) {
					this.stud.removeChild(this.addButton);
					y += 53;
					let listelement = new ListElement(x, y, "", undefined);
					console.log("X");
					view.appendChild(listelement.stud);
					list.push(listelement);
				}
			};
			this.stud.appendChild(this.addButton);
		}
	}

	edit() {
		return;
	}

	delete() {
		return;
	}

	add() {
		this.name = window.prompt("Name für Studienablaufplan:", "");
		if (this.name === "") {
			alert("Kein Name angegeben!, bitte nochmal versuchen");
			return false;
		}
		else {
			this.nameButton = document.createElement("button");
			this.nameButton.className = "name";
			this.nameButton.innerHTML += this.name;
			this.nameButton.onclick = (event) => {
				console.log(event.target);
			};

			this.editButton = document.createElement("button");
			this.editButton.innerHTML = "Edit";
			this.editButton.onclick = (event) => {
				this.edit();
			};

			this.deleteButton = document.createElement("button");
			this.deleteButton.innerHTML = "Delete";
			this.deleteButton.onclick = (event) => {
				this.delete();
			};

			this.stud.appendChild(this.nameButton);
			this.stud.appendChild(this.editButton);
			this.stud.appendChild(this.deleteButton);

			this.plan = new Studienablaufplan(this.name, []);
			let json = JSON.stringify(this.plan);
			plansjson.push(json);
			fs.writeFile("./plans.json", plansjson, (error) => {
				console.log(error);
			});
			return true;
		}
	}
}

var fs = require("fs");
var data = require("./m.json");
var rawdata = require("./plans.json");

var body = document.body.innerHTML;
var view = document.getElementById("listView");
var list = [];
var plaene = [];

var plansjson = JSON.parse(rawdata);
var x = 30;
var y = 30;
var sW = window.innerWidth;
var sH = window.innerHeight;

if (plansjson !== []) {
	for (var key in plansjson) {
		let listelement = new ListElement(x, y, key, plansjson[key]);
		list.push(listelement);
	}
	let listelement = new ListElement(x, y, "", undefined);
	view.appendChild(listelement.stud);
	list.push(listelement);
}
else {
	let listelement = new ListElement(x, y, "", undefined);
	console.log("X");
	view.appendChild(listelement.stud);
	list.push(listelement);
}

},{"./m.json":2,"./plans.json":3,"fs":4}],2:[function(require,module,exports){
module.exports=[]

},{}],3:[function(require,module,exports){
module.exports="[]"

},{}],4:[function(require,module,exports){

},{}]},{},[1]);
