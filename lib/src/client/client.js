var fs = require("browserify-fs");
var view = document.getElementById("listView");
var list = [];
var parsedJSON = [];
var globalSetMinimum;
fs.readFile("./ectsmin.json", "utf8", function (err, data) {
	if (err) {
		fs.writeFile("./ectsmin.json", JSON.stringify(5), (error) => {
			if (error) {
				alert("An error ocurred creating the file " + error.message);
			}
			reloadList();
		});
	}
	else {
		console.log(JSON.parse(data));
		globalSetMinimum = JSON.parse(data);
		reloadList();
	}
});
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
	constructor(name, plan) {
		this.name = name;
		if (plan !== undefined) {
			this.plan = plan;

			this.stud = document.createElement("div");
			this.stud.id = this.name;

			this.nameButton = document.createElement("button");
			this.nameButton.className = "nameButton";
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

			this.addButton = document.createElement("button");
			this.addButton.innerHTML += "+";
			this.addButton.className = "addPlan";
			this.addButton.onclick = (event) => {
				if (this.add()) {
					this.stud.removeChild(this.addButton);
					let listelement = new ListElement("", undefined);
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
			parsedJSON[list.indexOf(this)] = this.plan;
			savePlans();
			this.edit();
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
			option.text = this.plan.semesters[+preview.selectedIndex].modules[index].name + " | " + this.plan.semesters[+preview.selectedIndex].modules[index].ects;
			previewMod.add(option);
		});
		m.appendChild(previewMod);

		let addModule = document.createElement("button");
		addModule.innerHTML = "  +  ";
		addModule.onclick = () => {
			let name = window.prompt("Name für Modul:", "");
			let ects = +window.prompt("ECTS-Anzahl(Mehrfaches von " + globalSetMinimum + "):", "");
			while (ects % globalSetMinimum !== 0) {
				ects = +window.prompt("ECTS-Anzahl(Mehrfaches von " + globalSetMinimum + "):", "");
			}
			console.log(ects);
			if (name !== null && ects !== 0) {
				this.plan.semesters[+preview.selectedIndex].modules.push(new Modul(name, ects));
				let index = +preview.selectedIndex + 1;
				let option = document.createElement("option");
				option.text = name + " | " + ects;
				previewMod.add(option);
				previewMod.selectedIndex = previewMod.options.length - 1;
				parsedJSON[list.indexOf(this)] = this.plan;
				savePlans();
			}
		};

		let deleteModule = document.createElement("button");
		deleteModule.innerHTML = "  -  ";
		deleteModule.onclick = () => {
			this.plan.semesters[+preview.selectedIndex].modules.splice(+previewMod.selectedIndex, 1);
			previewMod.remove(+previewMod.selectedIndex);
			parsedJSON[list.indexOf(this)] = this.plan;
			savePlans();
		};
		m.appendChild(addModule);
		m.appendChild(deleteModule);
	}

	delete() {
		parsedJSON.splice(parsedJSON.indexOf(this.plan), 1);
		fs.writeFile("./plans.json", JSON.stringify(parsedJSON), (error) => {
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
			parsedJSON.push(this.plan);

			savePlans();
			return true;
		}
	}
}

function empty() {
	fs.writeFile("./plans.json", JSON.stringify([]), (error) => {
		if (error) {
			alert("An error ocurred creating the file " + error.message);
		}

		readPlans("./plans.json", function (data) {
			console.log(data);
			parsedJSON = JSON.parse(data);
		});
	});

	fs.writeFile("./m.json", JSON.stringify([]), (error) => {
		if (error) {
			alert("An error ocurred creating the file " + error.message);
		}

		readPlans("./plans.json", function (data) {
			console.log(data);
			parsedJSON = JSON.parse(data);
		});
	});
}

function readPlans(filePath, cb) {
	fs.readFile(filePath, "utf8", function (err, data) {
		if (err) {
			fs.writeFile("./plans.json", JSON.stringify([]), (error) => {
				if (error) {
					alert("An error ocurred creating the file " + error.message);
				}

				readPlans("./plans.json", function (data) {
					console.log(data);
					parsedJSON = JSON.parse(data);
				});
			});
		}
		cb(data);
	});
}

function savePlans() {
	fs.writeFile("./plans.json", JSON.stringify(parsedJSON), (error) => {
		if (error) {
			alert("An error ocurred creating the file " + error.message);
		}

		readPlans("./plans.json", function (data) {
			parsedJSON = JSON.parse(data);
			console.log(parsedJSON);
		});
	});
}

function reloadList() {
	readPlans("./plans.json", function (data) {
		while (view.firstChild) {
			view.removeChild(view.firstChild);
		}

		parsedJSON = JSON.parse(data);
		console.log(parsedJSON);
		if (parsedJSON.length > 0) {
			console.log("NOT EMPTY");
			console.log(parsedJSON);
			parsedJSON.forEach(plan => {
				console.log(plan);
				let listelement = new ListElement(plan.name, new Studienablaufplan(plan.name, plan.semesters));
				view.appendChild(listelement.stud);
				console.log(listelement);
				list.push(listelement);
			});
			let listelement = new ListElement("", undefined);
			view.appendChild(listelement.stud);
			list.push(listelement);
		}
		else {
			let listelement = new ListElement("", undefined);
			view.appendChild(listelement.stud);
			list.push(listelement);
			globalSetMinimum = +window.prompt("Minimale Anzahl an ECTS-Punkten pro Modul:", "5");
			fs.writeFile("./ectsmin.json", JSON.stringify(globalSetMinimum), (error) => {
				if (error) {
					alert("An error ocurred creating the file " + error.message);
				}
			});
		}
	});
}
