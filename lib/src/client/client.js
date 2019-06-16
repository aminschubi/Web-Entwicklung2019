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
			plansjson.push(this.plan);

			fs.writeFile("./plans.json", JSON.stringify(plansjson), (error) => {
				if (error) {
					alert("An error ocurred creating the file " + error.message);
				}

				read("./plans.json", function (data) {
					console.log(data);
					plansjson = JSON.parse(data);
				});
			});
			return true;
		}
	}
}

var fs = require("browserify-fs");
var path = require("path");
var http = require("http");

var body = document.body.innerHTML;
var view = document.getElementById("listView");
var list = [];
var plaene = [];

var plansjson = "";

function read(filePath, cb) {
	fs.readFile(filePath, "utf8", function (err, data) {
		if (err) {
			return;
		}
		cb(data);
	});
}

read("./plans.json", function (data) {
	if (data[0] !== "[") {
		fs.writeFile("./plans.json", JSON.stringify([]), (error) => {
			if (error) {
				alert("An error ocurred creating the file " + error.message);
			}
		});
	}
	else {
		plansjson = JSON.parse(data);
		console.log(plansjson);
		if (plansjson !== []) {
			console.log("NOT EMPTY");
			console.log(plansjson);
			plansjson.forEach(plan => {
				console.log(plan);
				let listelement = new ListElement(x, y, plan.name, new Studienablaufplan(plan.name, plan.semesters));
				view.appendChild(listelement.stud);
				console.log(listelement);
				list.push(listelement);
				y += 53;
			});
			let listelement = new ListElement(x, y, "", undefined);
			view.appendChild(listelement.stud);
			list.push(listelement);
		}
		else {
			let listelement = new ListElement(x, y, "", undefined);
			view.appendChild(listelement.stud);
			list.push(listelement);
		}
	}
});

var x = 30;
var y = 30;
