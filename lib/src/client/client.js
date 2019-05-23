/* eslint-disable brace-style */
class Studienablaufplan {
	constructor(name, semesterAnzahl, anzahlECTSproSemester) {
		this.name = name;
		this.semesterAnzahl = semesterAnzahl;
		this.anzahlECTSproSemester = anzahlECTSproSemester;
	}
}
class Semester {
	constructor(modules) {
		this.modules = modules;
	}
}

class Modul {
	constructor(name, ects) {
		this.name = name;
		this.ects = ects;
	}
}

var file = require("./m.json");
var data = require("./m.json");

var buildBody = function () {
	var buttonTest = document.createElement("button");
	buttonTest.name = "Button";
	buttonTest.id = "b1";
	buttonTest.textContent = "HALLO";
	buttonTest.onclick = () => {
		var m = new Modul("THI", 5);
		data.push(JSON.stringify(m));
		file = JSON.stringify(data);
		file = require("./m.json");
		console.log(file);
	};
	document.body.appendChild(buttonTest);
};
buildBody();
