var fs = require("browserify-fs");
const http = require("http");
var view = document.getElementById("listView");
var list = [];
var parsedJSON = {};
var globalSetMinimum;
readPlans(reloadList);

class Studienablaufplan {
	constructor(name, semesterAmount, ectsPerSemester, semesters) {
		this.name = name;
		this.semesterAmount = semesterAmount;
		this.ectsPerSemester = ectsPerSemester;
		console.log(this.semesterAmount);
		if (semesters === undefined) {
			this.semesters = [];
			for (let i = 0; i < this.semesterAmount; i++) {
				var s = new Semester();
				console.log("new semester");
				this.semesters.push(s);
				for (let j = 0; j < this.ectsPerSemester / globalSetMinimum; j++) {
					s.addModule(new Modul("wpf", globalSetMinimum));
				}
			}
		}
		else {
			this.semesters = semesters;
		}
		console.log(this.semesters);
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
		let httpReq = new XMLHttpRequest();
		httpReq.open("GET", "http://localhost:8080/modules/" + name);
		httpReq.onreadystatechange = (event) => {
			console.log(httpReq.readyState, httpReq.status);
			if (httpReq.readyState === 4 && httpReq.status === 200) {
				console.log(httpReq.responseText);
				/*parsedJSON = JSON.parse(httpReq.responseText);
				console.log(parsedJSON);
				/*if (cb !== undefined) {
					cb();
				}*/
			}
		};
		httpReq.send();
		this.name = name;
		this.ects = ects;
	}
}
class ModulListElement {
	constructor(name, ects) {
		this.name = name;
		this.ects = ects;
	}
}

class PlanListElement {
	constructor(name, plan) {
		this.name = name;
		if (plan !== undefined) {
			this.plan = plan;

			this.stud = document.createElement("div");
			this.stud.id = this.name;
			this.stud.className = "listElement";

			this.nameButton = document.createElement("button");
			this.nameButton.className = "nameButton";
			this.nameButton.innerHTML += this.name;
			this.nameButton.className = "name";
			this.nameButton.onclick = (event) => {
				console.log(event.target);
			};

			this.editButton = document.createElement("button");
			this.editButton.innerHTML = "Edit";
			this.editButton.className = "editB";
			this.editButton.onclick = (event) => {
				this.edit();
			};

			this.deleteButton = document.createElement("button");
			this.deleteButton.innerHTML = "Delete";
			this.deleteButton.className = "deleteB";
			this.deleteButton.onclick = (event) => {
				this.delete();
			};

			this.stud.appendChild(this.nameButton);
			this.stud.appendChild(this.editButton);
			this.stud.appendChild(this.deleteButton);
		}
		else {
			this.stud = document.createElement("div");
			this.stud.className = "listElement";

			this.addButton = document.createElement("button");
			this.addButton.innerHTML += "+";
			this.addButton.className = "addPlan";
			this.addButton.onclick = (event) => {
				if (this.add()) {
					this.stud.removeChild(this.addButton);
					let listelement = new PlanListElement("", undefined);
					view.appendChild(listelement.stud);
					list.push(listelement);
				}
			};
			this.stud.appendChild(this.addButton);
		}
	}

	edit() {
		this.createPreview();
	}

	delete() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("DELETE", "http://localhost:8080/deletePlan/" + this.name);
		httpReq.onreadystatechange = (event) => {
			if (httpReq.status === 200) {
				console.log("RESPONSE TO POST ARRIVED");
				readPlans(reloadList);
			}
		};
		httpReq.send();
	}

	add() {
		this.name = window.prompt("Name für Studienablaufplan:", "");
		if (this.name === "") {
			alert("Kein Name angegeben!, bitte nochmal versuchen");
			return false;
		}
		else {
			console.log("name entered");
			let httpReq = new XMLHttpRequest();
			httpReq.open("POST", "http://localhost:8080/setPlan/" + this.name);
			httpReq.setRequestHeader("Content-type", "application/json");
			let d = JSON.stringify(this.plan);
			httpReq.onreadystatechange = () => {
				console.log(httpReq.status);
				if (httpReq.status === 409 && httpReq.readyState === 4) {
					console.log("RESPONSE TO POST ARRIVED");
					this.nameButton = document.createElement("button");
					this.nameButton.className = "name";
					this.nameButton.innerHTML += this.name;
					this.nameButton.onclick = (event) => {
						console.log(event.target);
					};

					this.editButton = document.createElement("button");
					this.editButton.innerHTML = "Edit";
					this.editButton.className = "editB";
					this.editButton.onclick = (event) => {
						this.edit();
					};
					console.log(this.editButton.className);

					this.deleteButton = document.createElement("button");
					this.deleteButton.innerHTML = "Delete";
					this.deleteButton.className = "deleteB";
					this.deleteButton.onclick = (event) => {
						this.delete();
					};

					this.stud.appendChild(this.nameButton);
					this.stud.appendChild(this.editButton);
					this.stud.appendChild(this.deleteButton);

					this.plan = new Studienablaufplan(this.name, 6, 30);
					parsedJSON[this.name] = this.plan;
					savePlans();
					readPlans(reloadList);
					return;
				}
				else if (httpReq.status === 404 && httpReq.readyState === 4) {
					alert("Already exists");
					return;
				}
			};
			httpReq.send(d);

			return true;
		}
	}

	createPreview() {
		let v = document.getElementById("planpreview");

		while (v.firstChild) {
			v.removeChild(v.firstChild);
		}
		let p = document.createElement("div");
		let top = 0;
		let left = 0;
		console.log(this.plan);
		console.log(this.plan.semesterAmount);
		for (let i = 0; i < this.plan.semesterAmount; i++) {
			console.log("row");
			for (let j = 0; j < this.plan.ectsPerSemester / globalSetMinimum; j++) {
				console.log("button");
				let m = this.plan.semesters[i].modules[j];
				let b = document.createElement("button");
				b.onclick = () => {
					console.log("module clicked");
				};
				b.innerHTML = m.name;
				b.className = "moduleButton";
				console.log(b);
				p.appendChild(b);
				//left += (this.plan.ectsPerSemester / globalSetMinimum);
				console.log(left);
			}
			//left = 0;
			//top += 100 / this.plan.semesterAmount;
		}
		console.log(p);
		v.appendChild(p);
	}
}

function readPlans(cb) {
	let httpReq = new XMLHttpRequest();
	httpReq.open("GET", "http://localhost:8080/plans");
	httpReq.send();
	console.log("X");
	httpReq.onreadystatechange = (event) => {
		console.log(httpReq.readyState, httpReq.status);
		if (httpReq.readyState === 4 && httpReq.status === 200) {
			console.log(httpReq.responseText);
			parsedJSON = JSON.parse(httpReq.responseText);
			console.log(parsedJSON);
			if (cb !== undefined) {
				cb();
			}
		}
	};
}

function savePlans() {
	let httpReq = new XMLHttpRequest();
	httpReq.open("POST", "http://localhost:8080/setPlans");
	httpReq.setRequestHeader("Content-type", "application/json");
	let d = JSON.stringify(parsedJSON);
	httpReq.onreadystatechange = () => {
		if (httpReq.status === 200) {
			console.log("RESPONSE TO POST ARRIVED");
			readPlans(reloadList);
		}
	};
	httpReq.send(d);
}

function reloadList() {
	while (view.firstChild) {
		view.removeChild(view.firstChild);
	}
	if (Object.keys(parsedJSON).length > 0) {
		console.log("NOT EMPTY");
		console.log(parsedJSON);
		for (var key in parsedJSON) {
			if (key !== "min") {
				let plan = parsedJSON[key];
				console.log(plan);
				let listelement = new PlanListElement(plan.name, new Studienablaufplan(plan.name, plan.semesterAmount, plan.ectsPerSemester, plan.semesters));
				listelement.stud.style.height = "15%";
				view.appendChild(listelement.stud);
				console.log(listelement);
				list.push(listelement);
			}
			else {
				globalSetMinimum = parsedJSON[key];
			}
		}
		let listelement = new PlanListElement("", undefined);
		view.appendChild(listelement.stud);
		list.push(listelement);
	}
	else {
		console.log("X");
		let listelement = new PlanListElement("", undefined);
		view.appendChild(listelement.stud);
		list.push(listelement);
		globalSetMinimum = +window.prompt("Minimale Anzahl an ECTS-Punkten pro Modul:", "5");
		let key = "min";
		parsedJSON[key] = globalSetMinimum;
		savePlans();
	}
}
