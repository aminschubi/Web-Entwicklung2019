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
		this.modules = [
			[]
		];
		this.selectedModule = 0;
		this.modulesObject = {};
		this.plansObject = {};
		this.globalSetMinimum = 0;
		this.planPage = 1;
		this.pageV = document.createElement("button");
		this.pageV.className = "pageCounter";
		this.pageV.innerHTML = "" + this.planPage;
		this.view.appendChild(this.pageV);
		var self = this;
		document.getElementById("switchToStud").onclick = (event) => {
			self.planPage = 1;
			self.readPlans(self.reloadList(self));
		};
		document.getElementById("switchToMod").onclick = (event) => {
			self.planPage = 1;
			self.readModules(self.reloadM(self));
		};
		document.getElementById("exitEditMode").onclick = (event) => {
			document.getElementById("exitEditMode").style.visibility = "hidden";
			document.getElementById("switchToStud").disabled = false;
			self.planPage = 1;
			self.readPlans(self.reloadList(self));
			let info = document.getElementById("planInfo");
			while (info.firstChild) {
				info.removeChild(info.firstChild);
			}
			let v = document.getElementById("planpreview");
			while (v.firstChild) {
				v.removeChild(v.firstChild);
			}
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
				this.modules = [
					[]
				];
				this.modulesObject = JSON.parse(httpReq.responseText);
				console.log(this.modulesObject);
				if (Object.keys(this.modulesObject).length > 0) {
					let i = 0;
					let k = 0;
					for (var key in this.modulesObject) {
						if (k < 9) {
							this.modules[i].push(this.modulesObject[key]);
							k++;
						}
						else {
							i++;
							k = 0;
							this.modules.push([]);
							this.modules[i].push(this.modulesObject[key]);
							k++;
						}
					}
				}
				console.log(this.modules);
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

	updatePlan(plan, cb) {
		let httpReq = new XMLHttpRequest();
		httpReq.open("POST", "http://localhost:8080/updatePlan/" + plan.name);
		httpReq.setRequestHeader("Content-type", "application/json");
		httpReq.onreadystatechange = () => {
			if (httpReq.status === 200 && httpReq.readyState === 4) {
				console.log("Successful");
				cb(1);
			}
			else if (httpReq.status === 409 && httpReq.readyState === 4) {
				console.log("Not successful");
				cb(0);
			}
		};
		httpReq.send(JSON.stringify(plan));
	}

	savePlans() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("POST", "http://localhost:8080/setPlans");
		httpReq.setRequestHeader("Content-type", "application/json");
		httpReq.onreadystatechange = () => {
			if (httpReq.status === 200) {
				console.log("RESPONSE TO POST ARRIVED");
				//this.readPlans(this.reloadList);
			}
		};
		httpReq.send(JSON.stringify(this.plansObject));
	}

	reloadList(t) {
		while (t.view.firstChild) {
			t.view.removeChild(t.view.firstChild);
		}
		console.log(t);

		t.pageControl = document.createElement("div");
		t.pageControl.id = "pControls";
		t.flipPageButtonNeg = document.createElement("button");
		t.flipPageButtonNeg.innerHTML = "<-";
		t.flipPageButtonNeg.className = "flipNeg";
		t.flipPageButtonNeg.onclick = (event) => {
			if (this.planPage > 0) {
				this.planPage--;
				this.reloadList(t);
			}
		};
		t.pageV = document.createElement("button");
		t.pageV.className = "pageCounter";
		t.pageV.innerHTML = "" + t.planPage;
		t.flipPageButtonPos = document.createElement("button");
		t.flipPageButtonPos.innerHTML = "->";
		t.flipPageButtonPos.className = "flipPos";
		t.flipPageButtonPos.onclick = (event) => {
			if (t.planPage < t.plans.length) {
				t.planPage++;
				t.reloadList(t);
			}
		};
		console.log(t.plans[t.planPage]);
		if (t.plans[t.planPage - 1] !== undefined && t.plans[t.planPage - 1].length === 5 && t.plans[t.planPage] !== undefined) {
			t.flipPageButtonPos.disabled = false;
		}
		else {
			t.flipPageButtonPos.disabled = true;
		}

		if (t.plans[t.planPage - 2] !== undefined) {
			t.flipPageButtonNeg.disabled = false;
		}
		else {
			t.flipPageButtonNeg.disabled = true;
		}

		t.pageControl.appendChild(t.flipPageButtonNeg);
		t.pageControl.appendChild(t.pageV);
		t.pageControl.appendChild(t.flipPageButtonPos);

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
			t.view.appendChild(t.pageControl);
		}
		else {
			console.log("X");
			let listelement = new PlanListElement(t, "", undefined);
			t.view.appendChild(listelement.div);
			t.view.appendChild(t.pageControl);
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

		t.pageControl = document.createElement("div");
		t.pageControl.id = "pControls";
		t.flipPageButtonNeg = document.createElement("button");
		t.flipPageButtonNeg.innerHTML = "<-";
		t.flipPageButtonNeg.className = "flipNeg";
		t.flipPageButtonNeg.onclick = (event) => {
			if (t.planPage > 0) {
				t.planPage--;
				t.reloadM(t);
			}
		};
		t.pageV = document.createElement("button");
		t.pageV.className = "pageCounter";
		t.flipPageButtonPos = document.createElement("button");
		t.flipPageButtonPos.innerHTML = "->";
		t.flipPageButtonPos.className = "flipPos";
		t.flipPageButtonPos.onclick = (event) => {
			if (t.planPage < t.modules.length) {
				t.planPage++;
				t.reloadM(t);
			}
		};
		if (t.modules[t.planPage - 1] !== undefined && t.modules[t.planPage - 1].length === 9 && t.modules[t.planPage] !== undefined) {
			t.flipPageButtonPos.disabled = false;
		}
		else {
			t.flipPageButtonPos.disabled = true;
		}

		if (t.modules[t.planPage - 2] !== undefined) {
			t.flipPageButtonNeg.disabled = false;
		}
		else {
			t.flipPageButtonNeg.disabled = true;
		}

		t.pageControl.appendChild(t.flipPageButtonNeg);
		t.pageControl.appendChild(t.pageV);
		t.pageControl.appendChild(t.flipPageButtonPos);

		if (Object.keys(t.modulesObject).length > 0) {
			console.log("NOT EMPTY");
			console.log(t.modules);
			if (t.modules[t.planPage - 1] === undefined) {
				t.planPage--;
			}
			let k = t.modules[t.planPage - 1].length < 9 ? t.modules[t.planPage - 1].length : 9;
			if (t.modules[0].length > 0) {
				for (let i = 0; i < k; i++) {
					let listelement = new ModulListElement(t, t.modules[t.planPage - 1][i]);
					listelement.div.style.height = "8%";
					t.view.appendChild(listelement.div);
				}
			}
			let listelement = new ModulListElement(t);
			t.view.appendChild(listelement.div);
			t.view.appendChild(t.pageControl);
		}
		else {
			console.log("X");
			let listelement = new ModulListElement(t);
			t.view.appendChild(listelement.div);
			t.view.appendChild(t.pageControl);
		}
		t.pageV.innerHTML = "" + t.planPage;
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
			this.div.className = "listElementM";
			this.buttons = [];

			this.nameButton = document.createElement("button");
			this.nameButton.className = "nameM";
			this.nameButton.innerHTML += this.name + "(ECTS:" + this.ects + ")";
			this.nameButton.onclick = (event) => {
				console.log(event.target);
			};

			this.editButton = document.createElement("button");
			this.editButton.innerHTML = "Bearbeiten";
			this.editButton.className = "editMB";
			this.editButton.onclick = (event) => {
				this.edit();
			};

			this.deleteButton = document.createElement("button");
			this.deleteButton.innerHTML = "Löschen";
			this.deleteButton.className = "deleteMB";
			this.deleteButton.onclick = (event) => {
				this.delete();
			};

			this.lockButton = document.createElement("button");
			this.lockButton.innerHTML = "->";
			this.lockButton.className = "lockMB";
			this.lockButton.onclick = (event) => {
				this.client.selectedModule = this.modul;
				//this.lockButton.disabled = true;
			};

			this.div.appendChild(this.nameButton);
			this.div.appendChild(this.editButton);
			this.div.appendChild(this.deleteButton);
			this.div.appendChild(this.lockButton);
		}
		else {
			this.div = document.createElement("div");
			this.div.className = "listElement";

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

			this.div.appendChild(this.addButton);
		}
	}

	edit() {
		let name = window.prompt("Neuer Modulname:", this.modul.name);
		if (name === "") {
			alert("Kein Name angegeben!, bitte nochmal versuchen");
			return;
		}
		else {
			let httpReq = new XMLHttpRequest();
			httpReq.open("POST", "http://localhost:8080/updateModules/" + this.name);
			httpReq.setRequestHeader("Content-type", "application/json");
			httpReq.onreadystatechange = () => {
				console.log(httpReq.status);
				if (httpReq.status === 409 && httpReq.readyState === 4) {
					console.log("RESPONSE TO POST ARRIVED");
					this.div.id = "name";
					this.client.readModules(this.client.reloadM);
					return;
				}
				else if (httpReq.status === 404 && httpReq.readyState === 4) {
					alert("Modul existiert nicht!");
				}
			};
			httpReq.send(JSON.stringify({
				name: name,
				ects: this.modul.ects
			}));
		}
	}

	delete() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("DELETE", "http://localhost:8080/deleteModule/" + this.name);
		httpReq.onreadystatechange = (event) => {
			if (httpReq.status === 200 && httpReq.readyState === 4) {
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
		this.moduleRefs = [];
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

			this.div.appendChild(this.addButton);
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
		console.log(this.plan);
		this.moduleRefs = [];
		let c = this.moduleRefs;
		let info = document.getElementById("planInfo");
		while (info.firstChild) {
			info.removeChild(info.firstChild);
		}

		let title = document.createElement("button");
		title.className = "planTitleB";
		title.innerHTML = this.plan.name;
		info.appendChild(title);

		let v = document.getElementById("planpreview");
		while (v.firstChild) {
			v.removeChild(v.firstChild);
		}

		console.log(v);

		for (let i = 0; i < this.plan.semesterAmount; i++) {
			console.log("row");
			let p = new SemesterListElement(this.plan.semesters[i], i + 1, this);
			this.plan.semesters[i].modules.forEach(element => {
				c.push(element);
			});
			console.log(p.div);
			v.appendChild(p.div);
		}

		let legend = document.createElement("div");
		legend.className = "semesterListElement";
		let bn = document.createElement("button");
		bn.className = "previewIndex";
		bn.innerHTML = "Sem|ECTS";
		bn.style.width = "" + (100 / ((this.plan.ectsPerSemester / this.client.globalSetMinimum) + 1)) + "%";
		legend.appendChild(bn);
		for (let i = 0; i < this.plan.ectsPerSemester / this.client.globalSetMinimum; i++) {
			var b = document.createElement("button");
			b.className = "previewIndex";
			b.innerHTML = "" + this.client.globalSetMinimum;
			b.name = "legendECTS";
			b.style.width = "" + (100 / ((this.plan.ectsPerSemester / this.client.globalSetMinimum) + 1)) + "%";
			legend.appendChild(b);
		}
		v.appendChild(legend);

		document.getElementById("switchToStud").disabled = true;
		document.getElementById("exitEditMode").style.visibility = "visible";
		this.client.readModules(this.client.reloadM(this.client));
	}

	saveToClient() {
		console.log("----------------------------------------------");
		this.client.plansObject[this.name] = this.plan;
		console.log(this.client.plansObject);
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
	constructor(semester, index, parent) {
		this.plan = parent;
		this.div = document.createElement("div");
		this.div.className = "semesterListElement";
		this.semester = semester;
		this.buttons = [];
		console.log(this.semester.modules);
		var ind = document.createElement("button");
		ind.className = "previewIndex";
		ind.innerHTML = "" + index;
		ind.style.width = "" + (100 / ((this.plan.plan.ectsPerSemester / this.plan.client.globalSetMinimum) + 1)) + "%";
		ind.onclick = () => {
			console.log(semester);
		};
		this.buttons.push(ind);
		this.div.appendChild(ind);

		let x = semester.modules.length;
		for (var i = 0; i < x; i++) {
			var b = document.createElement("button");
			b.className = "previewButton";
			b.innerHTML = semester.modules[i].name;
			b.name = "" + i;
			b.style.width = "" + (100 / (((this.plan.plan.ectsPerSemester / this.plan.client.globalSetMinimum) + 1) * (this.plan.client.globalSetMinimum / semester.modules[i].ects))) + "%";
			b.onclick = (event) => {
				console.log("Button pressed!");
				var freeEctsPoints = this.plan.plan.ectsPerSemester;
				this.plan.plan.semesters[index - 1].modules.forEach(function (modul, i) {
					if (modul.name !== "wpf") {
						freeEctsPoints -= modul.ects;
					}
				});
				if (freeEctsPoints === 0) {
					freeEctsPoints += this.plan.plan.semesters[index - 1].modules[(Number.parseInt(event.target.name))].ects;
				}
				console.log(freeEctsPoints, this.plan.client.selectedModule.ects);
				if (freeEctsPoints >= this.plan.client.selectedModule.ects) {
					let reset = this.plan.plan.semesters[index - 1].modules[(Number.parseInt(event.target.name))];
					let resArray = [reset.name, reset.ects];
					this.plan.plan.semesters[index - 1].modules[(Number.parseInt(event.target.name))] = this.plan.client.selectedModule;
					this.plan.saveToClient();
					this.plan.client.updatePlan(this.plan.plan, (value) => {
						if (value === 1) {
							this.plan.createPreview();
							this.plan.client.reloadM(this.plan.client);
							console.log("done");
						}
						else {
							alert("Modul ist in Plan schon vorhanden!");
							this.plan.plan.semesters[index - 1].modules[(Number.parseInt(event.target.name))] = {
								name: resArray[0],
								ects: resArray[1]
							};
						}
					});
				}
				else {
					alert("ECTS-Grenze überschritten!");
				}
			};
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
					s.addModule({
						name: "wpf",
						ects: client.globalSetMinimum
					});
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
