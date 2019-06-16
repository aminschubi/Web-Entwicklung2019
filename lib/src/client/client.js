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
		let c = document.getElementById("semesterController");
		while (c.firstChild) {
			c.removeChild(c.firstChild);
		}

		let t = document.createElement("header");
		t.innerHTML = "Semester";
		c.appendChild(t);
		let preview = document.createElement("select");
		preview.onchange = () => {
			for (let i = previewMod.options.length - 1; i >= 0; i--) {
				previewMod.remove(i);
			}
			this.plan.semesters[+preview.selectedIndex].modules.forEach((element, index) => {
				let option = document.createElement("option");
				option.text = this.plan.semesters[+preview.selectedIndex].modules[index].name;
				previewMod.add(option);
			});
		};

		this.plan.semesters.forEach((element, index) => {
			let option = document.createElement("option");
			option.text = "" + index;
			preview.add(option);
		});
		c.appendChild(preview);

		let addSemester = document.createElement("button");
		addSemester.innerHTML = "  +  ";
		addSemester.onclick = () => {
			this.plan.semesters.push(new Semester());
			let index = +preview.selectedIndex + 1;
			let option = document.createElement("option");
			option.text = "" + index;
			preview.add(option);
			preview.selectedIndex = index;
			plansjson[list.indexOf(this)] = this.plan;
			save();
		};

		let deleteSemester = document.createElement("button");
		deleteSemester.innerHTML = "  -  ";
		c.appendChild(addSemester);
		c.appendChild(deleteSemester);

		let m = document.getElementById("modulController");
		while (m.firstChild) {
			m.removeChild(m.firstChild);
		}
		let h = document.createElement("header");
		h.innerHTML = "Module";
		m.appendChild(h);

		let previewMod = document.createElement("select");
		this.plan.semesters[+preview.selectedIndex].modules.forEach((element, index) => {
			let option = document.createElement("option");
			option.text = this.plan.semesters[+preview.selectedIndex].modules[index].name;
			previewMod.add(option);
		});
		m.appendChild(previewMod);

		let addModule = document.createElement("button");
		addModule.innerHTML = "  +  ";
		addModule.onclick = () => {
			let name = window.prompt("Name für Modul:", "");
			let ects = window.prompt("ECTS-Anzahl:", "");
			this.plan.semesters[+preview.selectedIndex].modules.push(new Modul(name, +ects));
			let index = +preview.selectedIndex + 1;
			let option = document.createElement("option");
			option.text = name;
			previewMod.add(option);
			previewMod.selectedIndex = index;
			plansjson[list.indexOf(this)] = this.plan;
			save();
		};

		let deleteModule = document.createElement("button");
		deleteModule.innerHTML = "  -  ";
		deleteModule.onclick = () => {
			this.plan.semesters[+preview.selectedIndex].modules.splice(+previewMod.selectedIndex, 1);
			previewMod.remove(+previewMod.selectedIndex);
			plansjson[list.indexOf(this)] = this.plan;
			save();
		};
		m.appendChild(addModule);
		m.appendChild(deleteModule);
	}

	delete() {
		plansjson.splice(plansjson.indexOf(this.plan), 1);
		fs.writeFile("./plans.json", JSON.stringify(plansjson), (error) => {
			if (error) {
				alert("An error ocurred creating the file " + error.message);
			}

			reloadList();
		});
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

			save();
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

var plansjson = [];

function read(filePath, cb) {
	fs.readFile(filePath, "utf8", function (err, data) {
		if (err) {
			let listelement = new ListElement(x, y, "", undefined);
			view.appendChild(listelement.stud);
			list.push(listelement);
			fs.writeFile("./plans.json", JSON.stringify([]), (error) => {
				if (error) {
					alert("An error ocurred creating the file " + error.message);
				}

				read("./plans.json", function (data) {
					console.log(data);
					plansjson = JSON.parse(data);
				});
			});
		}
		cb(data);
	});
}

function save() {
	fs.writeFile("./plans.json", JSON.stringify(plansjson), (error) => {
		if (error) {
			alert("An error ocurred creating the file " + error.message);
		}

		read("./plans.json", function (data) {
			plansjson = JSON.parse(data);
			console.log(plansjson);
		});
	});
}

function reloadList() {
	x = 30;
	y = 30;
	read("./plans.json", function (data) {
		while (view.firstChild) {
			view.removeChild(view.firstChild);
		}
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
		}
	});
}
reloadList();

var x = 30;
var y = 30;
