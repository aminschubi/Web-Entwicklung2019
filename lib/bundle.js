(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var view = document.getElementById("list");
var plans = [
	[]
];
var parsedJSON = {};
var globalSetMinimum;
var planPage = 1;
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
					let m = new Modul("wpf", globalSetMinimum, s.addModule(m));
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
	constructor(name, ects, cb) {
		let httpReq = new XMLHttpRequest();
		httpReq.open("GET", "http://localhost:8080/modules/" + name);
		httpReq.onreadystatechange = (event) => {
			console.log(httpReq.readyState, httpReq.status);
			if (httpReq.readyState === 4 && httpReq.status === 200) {
				let m = JSON.parse(httpReq.response);
				console.log(m);
				this.name = m.name;
				this.ects = m.ects;
				cb();
			}
			else if (httpReq.status === 404) {
				alert("Module does not exist!");
				delete this;
			}
		};
		httpReq.send();
	}
}
class ModulListElement {
	constructor(name, ects) {
		this.name = name;
		this.ects = ects;
	}
}
class SemesterListElement {
	constructor(semester) {
		this.div = document.createElement("div");
		this.div.className = "semesterListElement";
		this.semester = semester;
		this.buttons = [];
		console.log(this.semester.modules);
		for (let i = 0; i < semester.modules.length; i++) {
			var b = document.createElement("button");
			b.className = "previewButton";
			b.innerHTML = semester.modules[i].name;
			console.log(b);
			this.buttons.push(b);
			this.div.appendChild(b);
		}
	}
}
class PlanListElement {
	constructor(name, plan) {
		this.name = name;
		if (plan !== undefined) {
			this.plan = plan;

			this.div = document.createElement("div");
			this.div.id = this.name;
			this.div.className = "listElement";

			this.nameButton = document.createElement("button");
			this.nameButton.className = "nameButton";
			this.nameButton.innerHTML += this.name;
			this.nameButton.className = "name";
			this.nameButton.onclick = (event) => {
				console.log(event.target);
			};

			this.editButton = document.createElement("button");
			this.editButton.innerHTML = "Bearbeiten";
			this.editButton.className = "editB";
			this.editButton.onclick = (event) => {
				this.edit();
			};

			this.deleteButton = document.createElement("button");
			this.deleteButton.innerHTML = "Löschen";
			this.deleteButton.className = "deleteB";
			this.deleteButton.onclick = (event) => {
				this.delete();
			};

			this.div.appendChild(this.nameButton);
			this.div.appendChild(this.editButton);
			this.div.appendChild(this.deleteButton);
		}
		else {
			this.div = document.createElement("div");
			this.div.className = "listElement";

			this.flipPageButtonNeg = document.createElement("button");
			this.flipPageButtonNeg.innerHTML = "<-";
			this.flipPageButtonNeg.className = "flipNeg";
			this.flipPageButtonNeg.onclick = (event) => {
				if (planPage > 0) {
					planPage--;
					reloadList();
				}
			};

			this.addButton = document.createElement("button");
			this.addButton.innerHTML += "+";
			this.addButton.className = "addPlan";
			this.addButton.onclick = (event) => {
				if (this.add()) {
					this.div.removeChild(this.addButton);
					let listelement = new PlanListElement("", undefined);
					view.appendChild(listelement.div);
				}
			};

			this.flipPageButtonPos = document.createElement("button");
			this.flipPageButtonPos.innerHTML = "->";
			this.flipPageButtonPos.className = "flipPos";
			this.flipPageButtonPos.onclick = (event) => {
				if (planPage < plans.length) {
					planPage++;
					reloadList();
				}
			};

			if (plans[planPage - 1].length === 5 && plans[planPage] !== undefined) {
				this.flipPageButtonPos.disabled = false;
			}
			else {
				this.flipPageButtonPos.disabled = true;
			}

			if (plans[planPage - 2] !== undefined) {
				this.flipPageButtonNeg.disabled = false;
			}
			else {
				this.flipPageButtonNeg.disabled = true;
			}

			this.div.appendChild(this.flipPageButtonNeg);
			this.div.appendChild(this.addButton);
			this.div.appendChild(this.flipPageButtonPos);
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
			this.ectsPerSemester = +window.prompt("ECTS-Punkte pro Semester(min. 30):", "30");
			if (!Number.isNaN(this.ectsPerSemester) && this.ectsPerSemester >= 30) {
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

						this.div.appendChild(this.nameButton);
						this.div.appendChild(this.editButton);
						this.div.appendChild(this.deleteButton);

						this.plan = new Studienablaufplan(this.name, 6, this.ectsPerSemester);
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
			else {
				return false;
			}
		}
	}

	createPreview() {
		let v = document.getElementById("planpreview");
		while (v.firstChild) {
			v.removeChild(v.firstChild);
		}

		for (let i = 0; i < this.plan.semesterAmount; i++) {
			console.log("row");
			let p = new SemesterListElement(this.plan.semesters[i]);
			console.log(p.div);
			v.appendChild(p.div);
		}
	}
}

function readPlans(cb) {
	let httpReq = new XMLHttpRequest();
	httpReq.open("GET", "http://localhost:8080/plans");
	httpReq.send();
	httpReq.onreadystatechange = (event) => {
		if (httpReq.readyState === 4 && httpReq.status === 200) {
			plans = [
				[]
			];
			parsedJSON = JSON.parse(httpReq.responseText);
			if (Object.keys(parsedJSON).length > 0) {
				let i = 0;
				let k = 0;
				for (var key in parsedJSON) {
					if (key !== "min") {
						if (k < 5) {
							plans[i].push(parsedJSON[key]);
							k++;
						}
						else {
							i++;
							k = 0;
							plans.push([]);
							plans[i].push(parsedJSON[key]);
							k++;
						}
					}
					else {
						globalSetMinimum = parsedJSON[key];
					}
				}
			}
			console.log(parsedJSON);
			console.log(plans);
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
	httpReq.onreadystatechange = () => {
		if (httpReq.status === 200) {
			console.log("RESPONSE TO POST ARRIVED");
			readPlans(reloadList);
		}
	};
	httpReq.send(JSON.stringify(parsedJSON));
}

function reloadList() {
	while (view.firstChild) {
		view.removeChild(view.firstChild);
	}
	if (Object.keys(parsedJSON).length > 0) {
		console.log("NOT EMPTY");
		if (plans[planPage - 1] === undefined) {
			planPage--;
		}
		let k = plans[planPage - 1].length < 5 ? plans[planPage - 1].length : 5;
		if (plans[0].length > 0) {
			for (let i = 0; i < k; i++) {
				let listelement = new PlanListElement(plans[planPage - 1][i].name, new Studienablaufplan(plans[planPage - 1][i].name, plans[planPage - 1][i].semesterAmount, plans[planPage - 1][i].ectsPerSemester, plans[planPage - 1][i].semesters));
				listelement.div.style.height = "15%";
				view.appendChild(listelement.div);
			}
		}
		let listelement = new PlanListElement("", undefined);
		view.appendChild(listelement.div);
	}
	else {
		console.log("X");
		let listelement = new PlanListElement("", undefined);
		view.appendChild(listelement.div);
		globalSetMinimum = +window.prompt("Minimale Anzahl an ECTS-Punkten pro Modul:", "5");
		let key = "min";
		parsedJSON[key] = globalSetMinimum;
		savePlans();
		return;
	}
}

},{}]},{},[1]);
