(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var PlanListElement = require("./planListElement.js");
var ModulListElement = require("./modulListElement.js");
var Studienablaufplan = require("./studienablaufplan.js");

class Client {
	constructor() {
		this.view = document.getElementById("list");
		this.plans = [
			[]
		];
		this.mList = [
			[]
		];
		this.modulesObject = {};
		this.plansObject = {};
		this.globalSetMinimum = 0;
		this.planPage = 1;
		var self = this;
		document.getElementById("switchToStud").onclick = (event) => {
			self.readPlans(self.reloadList);
		};
		document.getElementById("switchToMod").onclick = (event) => {
			self.readModules(self.reloadM);
		};
		this.readPlans(this.reloadList);
		this.readModules((t) => {
			console.log(t);
		});
	}

	readModules(cb) {
		let httpReq = new XMLHttpRequest();
		httpReq.open("GET", "http://localhost:8080/modules");
		httpReq.send();
		httpReq.onreadystatechange = (event) => {
			if (httpReq.readyState === 4 && httpReq.status === 200) {
				console.log("enter");
				this.mList = [
					[]
				];
				this.modulesObject = JSON.parse(httpReq.responseText);
				console.log(this.modulesObject);
				if (Object.keys(this.modulesObject).length > 0) {
					let i = 0;
					let k = 0;
					for (var key in this.modulesObject) {
						if (k < 5) {
							this.mList[i].push(this.modulesObject[key]);
							k++;
						}
						else {
							i++;
							k = 0;
							this.mList.push([]);
							this.mList[i].push(this.modulesObject[key]);
							k++;
						}
					}
				}
				console.log(this.mList);
				if (cb !== undefined) {
					cb(this);
				}
			}
		};
	}

	readPlans(cb) {
		let httpReq = new XMLHttpRequest();
		httpReq.open("GET", "http://localhost:8080/plans");
		httpReq.send();
		httpReq.onreadystatechange = (event) => {
			if (httpReq.readyState === 4 && httpReq.status === 200) {
				this.plans = [
					[]
				];
				this.plansObject = JSON.parse(httpReq.responseText);
				if (Object.keys(this.plansObject).length > 0) {
					let i = 0;
					let k = 0;
					for (var key in this.plansObject) {
						if (key !== "min") {
							if (k < 5) {
								this.plans[i].push(this.plansObject[key]);
								k++;
							}
							else {
								i++;
								k = 0;
								this.plans.push([]);
								this.plans[i].push(this.plansObject[key]);
								k++;
							}
						}
						else {
							this.globalSetMinimum = this.plansObject[key];
						}
					}
				}
				console.log(this.plansObject);
				console.log(this.plans);
				if (cb !== undefined) {
					cb(this);
				}
			}
		};
	}

	savePlans() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("POST", "http://localhost:8080/setPlans");
		httpReq.setRequestHeader("Content-type", "application/json");
		httpReq.onreadystatechange = () => {
			if (httpReq.status === 200) {
				console.log("RESPONSE TO POST ARRIVED");
				this.readPlans(this.reloadList);
			}
		};
		httpReq.send(JSON.stringify(this.plansObject));
	}

	reloadList(t) {
		while (t.view.firstChild) {
			t.view.removeChild(t.view.firstChild);
		}
		console.log(t);
		if (Object.keys(t.plansObject).length > 0) {
			console.log("NOT EMPTY");
			if (t.plans[t.planPage - 1] === undefined) {
				t.planPage--;
			}
			let k = t.plans[t.planPage - 1].length < 5 ? t.plans[t.planPage - 1].length : 5;
			if (t.plans[0].length > 0) {
				for (let i = 0; i < k; i++) {
					let listelement = new PlanListElement(t, t.plans[t.planPage - 1][i].name, new Studienablaufplan(t, t.plans[t.planPage - 1][i].name, t.plans[t.planPage - 1][i].semesterAmount, t.plans[t.planPage - 1][i].ectsPerSemester, t.plans[t.planPage - 1][i].semesters));
					listelement.div.style.height = "15%";
					t.view.appendChild(listelement.div);
				}
			}
			let listelement = new PlanListElement(t, "", undefined);
			t.view.appendChild(listelement.div);
		}
		else {
			console.log("X");
			let listelement = new PlanListElement(t, "", undefined);
			t.view.appendChild(listelement.div);
			t.globalSetMinimum = +window.prompt("Minimale Anzahl an ECTS-Punkten pro Modul:", "5");
			let key = "min";
			t.plansObject[key] = t.globalSetMinimum;
			t.savePlans();
			return;
		}
	}

	reloadM(t) {
		console.log(t);
		while (t.view.firstChild) {
			t.view.removeChild(t.view.firstChild);
		}
		console.log(t.planPage);
		if (Object.keys(t.modulesObject).length > 0) {
			console.log("NOT EMPTY");
			console.log(t.mList);
			if (t.mList[t.planPage - 1] === undefined) {
				t.planPage--;
			}
			let k = t.mList[t.planPage - 1].length < 5 ? t.mList[t.planPage - 1].length : 5;
			if (t.mList[0].length > 0) {
				for (let i = 0; i < k; i++) {
					let listelement = new ModulListElement(t, t.mList[t.planPage - 1][i]);
					listelement.div.style.height = "15%";
					t.view.appendChild(listelement.div);
				}
			}
			let listelement = new ModulListElement(t);
			t.view.appendChild(listelement.div);
		}
		else {
			console.log("X");
			let listelement = new ModulListElement(t);
			t.view.appendChild(listelement.div);
			return;
		}
	}

	switchToStud() {
		this.readPlans(this.reloadList);
	}

	switchToMod() {
		this.readModules(this.reloadM);
	}
}

module.exports = Client;

},{"./modulListElement.js":3,"./planListElement.js":4,"./studienablaufplan.js":7}],2:[function(require,module,exports){
var Client = require("./client.js");
var c = new Client();

},{"./client.js":1}],3:[function(require,module,exports){
class ModulListElement {
	constructor(client, modul) {
		this.client = client;
		if (modul !== undefined) {
			console.log(modul);
			this.modul = modul;
			this.name = this.modul.name;
			this.ects = this.modul.ects;
			this.div = document.createElement("div");
			this.div.id = this.modul.name;
			this.div.className = "listElement";
			this.buttons = [];

			this.nameButton = document.createElement("button");
			this.nameButton.className = "name";
			this.nameButton.innerHTML += this.name + "(ECTS:" + this.ects + ")";
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
				if (this.client.planPage > 0) {
					this.client.planPage--;
					this.client.reloadM(this.client);
				}
			};

			this.addButton = document.createElement("button");
			this.addButton.innerHTML += "+";
			this.addButton.className = "addPlan";
			this.addButton.onclick = (event) => {
				if (this.add()) {
					this.div.removeChild(this.addButton);
					let listelement = new ModulListElement(this.client);
					this.client.view.appendChild(listelement.div);
				}
			};

			this.flipPageButtonPos = document.createElement("button");
			this.flipPageButtonPos.innerHTML = "->";
			this.flipPageButtonPos.className = "flipPos";
			this.flipPageButtonPos.onclick = (event) => {
				if (this.client.planPage < this.client.mList.length) {
					this.client.planPage++;
					console.log("flip");
					this.client.reloadM(this.client);
				}
			};

			if (this.client.mList[this.client.planPage - 1].length === 5 && this.client.mList[this.client.planPage] !== undefined) {
				this.flipPageButtonPos.disabled = false;
			}
			else {
				this.flipPageButtonPos.disabled = true;
			}

			if (this.client.mList[this.client.planPage - 2] !== undefined) {
				this.flipPageButtonNeg.disabled = false;
			}
			else {
				this.flipPageButtonNeg.disabled = true;
			}

			console.log(this.flipPageButtonPos.disabled);
			this.div.appendChild(this.flipPageButtonNeg);
			this.div.appendChild(this.addButton);
			this.div.appendChild(this.flipPageButtonPos);
		}
	}

	edit() {
		//this.createPreview();
	}

	delete() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("DELETE", "http://localhost:8080/deleteModule/" + this.name);
		httpReq.onreadystatechange = (event) => {
			if (httpReq.status === 200) {
				console.log("RESPONSE TO POST ARRIVED");
				this.client.readModules(this.client.reloadM);
			}
		};
		httpReq.send();
	}

	add() {
		let name = window.prompt("Name für Modul:", "");
		if (name === "") {
			alert("Kein Name angegeben!, bitte nochmal versuchen");
			return false;
		}
		else {
			let ects = +window.prompt("ECTS-Punkte für Modul:", "" + this.client.globalSetMinimum);
			if (!Number.isNaN(ects) && ects % this.client.globalSetMinimum === 0) {
				console.log("name entered");
				let httpReq = new XMLHttpRequest();
				httpReq.open("POST", "http://localhost:8080/setModules/" + name);
				httpReq.setRequestHeader("Content-type", "application/json");
				let d = {
					name: name,
					ects: ects
				};
				httpReq.onreadystatechange = () => {
					console.log(httpReq.status);
					if (httpReq.status === 409 && httpReq.readyState === 4) {
						console.log("RESPONSE TO POST ARRIVED");
						this.client.modulesObject[name] = {
							name: name,
							ects: ects
						};
						this.client.readModules(this.client.reloadM);
						return;
					}
					else if (httpReq.status === 404 && httpReq.readyState === 4) {
						alert("Already exists");
						return;
					}
				};
				httpReq.send(JSON.stringify(d));
				return true;
			}
			else {
				return false;
			}
		}
	}
}

module.exports = ModulListElement;

},{}],4:[function(require,module,exports){
var SemesterListElement = require("./semesterListElement.js");
var Studienablaufplan = require("./studienablaufplan.js");

class PlanListElement {
	constructor(client, name, plan) {
		this.name = name;
		this.client = client;
		if (plan !== undefined) {
			this.plan = plan;
			console.log(this.plan);

			this.div = document.createElement("div");
			this.div.id = this.name;
			this.div.className = "listElement";

			this.nameButton = document.createElement("button");
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
				if (this.client.planPage > 0) {
					this.client.planPage--;
					this.client.reloadList(this.client);
				}
			};

			this.addButton = document.createElement("button");
			this.addButton.innerHTML += "+";
			this.addButton.className = "addPlan";
			this.addButton.onclick = (event) => {
				if (this.add()) {
					this.div.removeChild(this.addButton);
					let listelement = new PlanListElement(this.client, "", undefined);
					this.client.view.appendChild(listelement.div);
				}
			};

			this.flipPageButtonPos = document.createElement("button");
			this.flipPageButtonPos.innerHTML = "->";
			this.flipPageButtonPos.className = "flipPos";
			this.flipPageButtonPos.onclick = (event) => {
				if (this.client.planPage < this.client.plans.length) {
					this.client.planPage++;
					this.client.reloadList(this.client);
				}
			};

			if (this.client.plans[this.client.planPage - 1].length === 5 && this.client.plans[this.client.planPage] !== undefined) {
				this.flipPageButtonPos.disabled = false;
			}
			else {
				this.flipPageButtonPos.disabled = true;
			}

			if (this.client.plans[this.client.planPage - 2] !== undefined) {
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
		console.log("should work");
		this.createPreview();
	}

	delete() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("DELETE", "http://localhost:8080/deletePlan/" + this.name);
		httpReq.onreadystatechange = (event) => {
			if (httpReq.status === 200) {
				console.log("RESPONSE TO POST ARRIVED");
				this.client.readPlans(this.client.reloadList);
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

						this.plan = new Studienablaufplan(this.client, this.name, 6, this.ectsPerSemester);
						this.client.plansObject[this.name] = this.plan;
						this.client.savePlans();
						this.client.readPlans(this.client.reloadList);
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

		console.log(v);
		for (let i = 0; i < this.plan.semesterAmount; i++) {
			console.log("row");
			let p = new SemesterListElement(this.plan.semesters[i]);
			console.log(p.div);
			v.appendChild(p.div);
		}
	}
}

module.exports = PlanListElement;

},{"./semesterListElement.js":6,"./studienablaufplan.js":7}],5:[function(require,module,exports){
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

module.exports = Semester;

},{}],6:[function(require,module,exports){
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

module.exports = SemesterListElement;

},{}],7:[function(require,module,exports){
var Semester = require("./semester.js");

class Studienablaufplan {
	constructor(client, name, semesterAmount, ectsPerSemester, semesters) {
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
				for (let j = 0; j < this.ectsPerSemester / client.globalSetMinimum; j++) {
					s.addModule(client.modulesObject.wpf);
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

module.exports = Studienablaufplan;

},{"./semester.js":5}]},{},[2]);
