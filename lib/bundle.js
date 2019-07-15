(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var PlanListElement = require("./planListElement.js");
var ModulListElement = require("./modulListElement.js");
var Studienablaufplan = require("./studienablaufplan.js");
var saveAs = require("file-saver");
var domtoimage = require("dom-to-image");

class Client {
	constructor() {
		this.view = document.getElementById("list");
		this.plans = [
			[]
		];
		this.modules = [
			[]
		];
		this.planLists = [];
		this.selectedModule = 0;
		this.modulesObject = {};
		this.plansObject = {};
		this.globalSetMinimum = 0;
		this.planPage = 1;
		this.previousPageIndex = 1;
		this.pageV = document.createElement("button");
		this.pageV.className = "pageCounter";

		this.pageV.innerHTML = "" + this.planPage;
		this.view.appendChild(this.pageV);
		var self = this;
		document.getElementById("switchToStud").onclick = (event) => {
			self.planPage = 1;
			self.readPlans(self.reloadList(self));
			document.getElementById("switchToStud").style.border = "3px solid #ffffff";
			document.getElementById("switchToMod").style.border = "3px solid #000000";
		};
		document.getElementById("switchToMod").onclick = (event) => {
			self.planPage = 1;
			self.readModules(self.reloadM(self));
			document.getElementById("switchToMod").style.border = "3px solid #ffffff";
			document.getElementById("switchToStud").style.border = "3px solid #000000";
		};
		document.getElementById("exitEditMode").onclick = (event) => {
			document.getElementById("switchToStud").style.border = "3px solid #ffffff";
			document.getElementById("switchToMod").style.border = "3px solid #000000";
			document.getElementById("exitEditMode").style.visibility = "hidden";
			document.getElementById("printPlan").style.visibility = "hidden";
			document.getElementById("exportPlan").style.visibility = "hidden";
			document.getElementById("switchToStud").disabled = false;
			self.planPage = self.previousPageIndex;
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
		this.readModules(() => {
			console.log("");
		});
	}

	readModules(cb) {
		let httpReq = new XMLHttpRequest();
		httpReq.open("GET", "http://localhost:8080/modules");
		httpReq.setRequestHeader("charset", "utf-8");
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
						if (k < 11) {
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
							if (k < 7) {
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
					let self = this;
					cb(self);
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
		if (t.plans[t.planPage - 1] !== undefined && t.plans[t.planPage - 1].length === 7 && t.plans[t.planPage] !== undefined) {
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
			let k = t.plans[t.planPage - 1].length < 7 ? t.plans[t.planPage - 1].length : 7;
			if (t.plans[0].length > 0) {
				t.planLists = [];
				for (let i = 0; i < k; i++) {
					let listelement = new PlanListElement(t, t.plans[t.planPage - 1][i].name, new Studienablaufplan(t, t.plans[t.planPage - 1][i].name, t.plans[t.planPage - 1][i].semesterAmount, t.plans[t.planPage - 1][i].ectsPerSemester, t.plans[t.planPage - 1][i].semesters));
					listelement.div.style.height = "12.57841%";
					t.planLists.push(listelement);
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
		if (t.modules[t.planPage - 1] !== undefined && t.modules[t.planPage - 1].length === 11 && t.modules[t.planPage] !== undefined) {
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
			let k = t.modules[t.planPage - 1].length < 11 ? t.modules[t.planPage - 1].length : 11;
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

	savePlanAsPNG(plan) {
		domtoimage.toBlob(document.getElementById("preview"))
			.then(function (blob) {
				saveAs(blob, plan.name + ".png");
			});
	}

	printPlan() {
		let httpReq = new XMLHttpRequest();
		httpReq.open("GET", "http://localhost:8080/style");
		httpReq.send();
		httpReq.onreadystatechange = (event) => {
			if (httpReq.readyState === 4 && httpReq.status === 200) {
				let cssText = httpReq.responseText;
				var divContents = document.getElementById("preview").innerHTML;
				var a = window.open("", "", "height=500, width=500");
				a.document.write("<html>");
				a.document.write("<style>" + cssText + "</style>");
				a.document.write("<body >");
				a.document.write(divContents);
				a.document.write("</body></html>");
				a.document.close();
				a.print();
			}
		};
	}
}

module.exports = Client;

},{"./modulListElement.js":3,"./planListElement.js":4,"./studienablaufplan.js":7,"dom-to-image":8,"file-saver":9}],2:[function(require,module,exports){
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
			this.div.setAttribute("tabindex", "1");
			this.buttons = [];

			this.nameButton = document.createElement("button");
			this.nameButton.className = "nameM";
			this.nameButton.innerHTML += this.name + "(ECTS:" + this.ects + ")";
			this.nameButton.onclick = (event) => {
				this.edit();
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
			let c = this.client;
			this.lockButton.onclick = (event) => {
				c.selectedModule = this.modul;
				this.div.style.border = "4px solid #e36f52";
				let id = this.modul.name;
				var children = c.view.children;
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child.className === "listElementM") {
						if (child.id !== id) {
							child.style.border = "0px solid #ffffff";
						}
					}
				}
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
		if (name === "" || name === null || name === "null") {
			alert("Kein oder ungültiger Name, bitte nochmal versuchen!");
			return;
		}
		else if (name.includes("/")
			|| name.includes("%")
			|| name.includes("\\")
			|| name.includes("#")
			|| name.includes(".")
			|| name.includes("?")
			|| name.includes("$")) {
			alert("Name darf kein / , % , \\ , # , . , $ enthalten. Bitte nochmal versuchen");
			return;
		}
		else {
			let httpReq = new XMLHttpRequest();
			httpReq.open("POST", "http://localhost:8080/updateModules/" + this.name.trim());
			httpReq.setRequestHeader("Content-type", "application/json");
			httpReq.onreadystatechange = () => {
				console.log(httpReq.status);
				if (httpReq.status === 409 && httpReq.readyState === 4) {
					console.log("RESPONSE TO POST ARRIVED");
					this.div.id = name.trim();
					this.client.readModules(this.client.reloadM);
					return;
				}
				else if (httpReq.status === 404 && httpReq.readyState === 4) {
					alert("Modul existiert nicht!");
				}
			};
			httpReq.send(JSON.stringify({
				name: name.trim(),
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
		if (name === "" || name === null || name === "null") {
			alert("Kein Name angegeben!, bitte nochmal versuchen");
			return false;
		}
		else if (name.includes("/")
			|| name.includes("%")
			|| name.includes("\\")
			|| name.includes("#")
			|| name.includes(".")
			|| name.includes("?")
			|| name.includes("$")) {
			alert("Name darf kein / , % , \\ , # , . , $ enthalten. Bitte nochmal versuchen");
			return false;
		}
		else {
			let ects = +window.prompt("ECTS-Punkte für Modul:", "" + this.client.globalSetMinimum);
			if (!Number.isNaN(ects) && ects % this.client.globalSetMinimum === 0) {
				console.log("name entered");
				let httpReq = new XMLHttpRequest();
				httpReq.open("POST", "http://localhost:8080/setModules/" + name.trim());
				httpReq.setRequestHeader("Content-type", "application/json");
				let d = {
					name: name.trim(),
					ects: ects
				};
				httpReq.onreadystatechange = () => {
					console.log(httpReq.status);
					if (httpReq.status === 409 && httpReq.readyState === 4) {
						console.log("RESPONSE TO POST ARRIVED");
						this.client.modulesObject[name] = {
							name: name.trim(),
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
				this.updateName();
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
		if (this.name === "" || this.name === null || this.name === "null") {
			alert("Kein oder ungültiger Name, bitte nochmal versuchen");
			return false;
		}
		else if (this.name.includes("/")
			|| this.name.includes("%")
			|| this.name.includes("\\")
			|| this.name.includes("#")
			|| this.name.includes(".")
			|| this.name.includes("$")) {
			alert("Name darf kein / , % , \\ , # , . , $ enthalten. Bitte nochmal versuchen");
			return false;
		}
		else if (!Number.isNaN(+this.name[0])) {
			alert("Name muss mit einem Buchstaben beginnen");
			return false;
		}
		else {
			this.ectsPerSemester = +window.prompt("ECTS-Punkte pro Semester(min. 30):", "30");
			if (!Number.isNaN(this.ectsPerSemester) && this.ectsPerSemester >= 30) {
				console.log("name entered");
				let httpReq = new XMLHttpRequest();
				this.name = decodeURI(this.name).trim();
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
							this.updateName();
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

	updateName(cb) {
		let name = window.prompt("Neuer Planname:", this.plan.name);
		if (name === "" || name === null || name === "null") {
			alert("Kein oder ungültiger Name, bitte nochmal versuchen!");
			return;
		}
		else if (name.includes("/")
			|| name.includes("%")
			|| name.includes("\\")
			|| name.includes("#")
			|| name.includes(".")
			|| name.includes("?")
			|| name.includes("$")) {
			alert("Name darf kein / , % , \\ , # , . , $ enthalten. Bitte nochmal versuchen");
			return;
		}
		else if (!Number.isNaN(+name[0])) {
			alert("Name muss mit einem Buchstaben beginnen");
			return;
		}
		else {
			let httpReq = new XMLHttpRequest();
			httpReq.open("POST", "http://localhost:8080/updatePlanName/" + this.name);
			httpReq.setRequestHeader("Content-type", "application/json");
			httpReq.onreadystatechange = () => {
				console.log(httpReq.status);
				if (httpReq.status === 200 && httpReq.readyState === 4) {
					console.log("RESPONSE TO POST ARRIVED");
					this.client.readPlans((t) => {
						t.planPage = t.plans.length;
						t.reloadList(t);
						cb(t, name);
					});
				}
				else if (httpReq.status === 409 && httpReq.readyState === 4) {
					alert("Plan existiert nicht!");
				}
			};
			httpReq.send(JSON.stringify({
				name: name.trim()
			}));
		}
	}

	createPreview() {
		document.getElementById("switchToMod").style.border = "3px solid #ffffff";
		this.client.previousPageIndex = this.client.planPage;
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
		title.onclick = () => {
			this.updateName((t, name) => {
				console.log(t.planLists);
				t.planLists.forEach(e => {
					console.log(name, e.name);
					if (e.name === name) {
						e.createPreview();
					}
				});
				//t.planLists[t.plans[t.plans.length - 1].length - 1].createPreview();
			});
		};
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

		let self = this;
		let bn = document.createElement("button");
		bn.className = "previewIndex";
		bn.innerHTML = "Sem|ECTS";
		bn.style.width = "" + (100 / ((this.plan.ectsPerSemester / this.client.globalSetMinimum) + 1)) + "%";
		document.getElementById("exportPlan").onclick = () => {
			self.client.savePlanAsPNG(self.plan);
		};
		document.getElementById("printPlan").onclick = () => {
			self.client.printPlan();
		};
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
		document.getElementById("printPlan").style.visibility = "visible";
		document.getElementById("exportPlan").style.visibility = "visible";
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
			b.style.fontSize = "" + (20 - (4 * (semester.modules[i].name.length / 30))) + "px";
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
				freeEctsPoints += this.plan.plan.semesters[index - 1].modules[(Number.parseInt(event.target.name))].ects;
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

},{"./semester.js":5}],8:[function(require,module,exports){
(function (global) {
    'use strict';

    var util = newUtil();
    var inliner = newInliner();
    var fontFaces = newFontFaces();
    var images = newImages();

    // Default impl options
    var defaultOptions = {
        // Default is to fail on error, no placeholder
        imagePlaceholder: undefined,
        // Default cache bust is false, it will use the cache
        cacheBust: false
    };

    var domtoimage = {
        toSvg: toSvg,
        toPng: toPng,
        toJpeg: toJpeg,
        toBlob: toBlob,
        toPixelData: toPixelData,
        impl: {
            fontFaces: fontFaces,
            images: images,
            util: util,
            inliner: inliner,
            options: {}
        }
    };

    if (typeof module !== 'undefined')
        module.exports = domtoimage;
    else
        global.domtoimage = domtoimage;


    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options
     * @param {Function} options.filter - Should return true if passed node should be included in the output
     *          (excluding node means excluding it's children as well). Not called on the root node.
     * @param {String} options.bgcolor - color for the background, any valid CSS color value.
     * @param {Number} options.width - width to be applied to node before rendering.
     * @param {Number} options.height - height to be applied to node before rendering.
     * @param {Object} options.style - an object whose properties to be copied to node's style before rendering.
     * @param {Number} options.quality - a Number between 0 and 1 indicating image quality (applicable to JPEG only),
                defaults to 1.0.
     * @param {String} options.imagePlaceholder - dataURL to use as a placeholder for failed images, default behaviour is to fail fast on images we can't fetch
     * @param {Boolean} options.cacheBust - set to true to cache bust by appending the time to the request url
     * @return {Promise} - A promise that is fulfilled with a SVG image data URL
     * */
    function toSvg(node, options) {
        options = options || {};
        copyOptions(options);
        return Promise.resolve(node)
            .then(function (node) {
                return cloneNode(node, options.filter, true);
            })
            .then(embedFonts)
            .then(inlineImages)
            .then(applyOptions)
            .then(function (clone) {
                return makeSvgDataUri(clone,
                    options.width || util.width(node),
                    options.height || util.height(node)
                );
            });

        function applyOptions(clone) {
            if (options.bgcolor) clone.style.backgroundColor = options.bgcolor;

            if (options.width) clone.style.width = options.width + 'px';
            if (options.height) clone.style.height = options.height + 'px';

            if (options.style)
                Object.keys(options.style).forEach(function (property) {
                    clone.style[property] = options.style[property];
                });

            return clone;
        }
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a Uint8Array containing RGBA pixel data.
     * */
    function toPixelData(node, options) {
        return draw(node, options || {})
            .then(function (canvas) {
                return canvas.getContext('2d').getImageData(
                    0,
                    0,
                    util.width(node),
                    util.height(node)
                ).data;
            });
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a PNG image data URL
     * */
    function toPng(node, options) {
        return draw(node, options || {})
            .then(function (canvas) {
                return canvas.toDataURL();
            });
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a JPEG image data URL
     * */
    function toJpeg(node, options) {
        options = options || {};
        return draw(node, options)
            .then(function (canvas) {
                return canvas.toDataURL('image/jpeg', options.quality || 1.0);
            });
    }

    /**
     * @param {Node} node - The DOM Node object to render
     * @param {Object} options - Rendering options, @see {@link toSvg}
     * @return {Promise} - A promise that is fulfilled with a PNG image blob
     * */
    function toBlob(node, options) {
        return draw(node, options || {})
            .then(util.canvasToBlob);
    }

    function copyOptions(options) {
        // Copy options to impl options for use in impl
        if(typeof(options.imagePlaceholder) === 'undefined') {
            domtoimage.impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
        } else {
            domtoimage.impl.options.imagePlaceholder = options.imagePlaceholder;
        }

        if(typeof(options.cacheBust) === 'undefined') {
            domtoimage.impl.options.cacheBust = defaultOptions.cacheBust;
        } else {
            domtoimage.impl.options.cacheBust = options.cacheBust;
        }
    }

    function draw(domNode, options) {
        return toSvg(domNode, options)
            .then(util.makeImage)
            .then(util.delay(100))
            .then(function (image) {
                var canvas = newCanvas(domNode);
                canvas.getContext('2d').drawImage(image, 0, 0);
                return canvas;
            });

        function newCanvas(domNode) {
            var canvas = document.createElement('canvas');
            canvas.width = options.width || util.width(domNode);
            canvas.height = options.height || util.height(domNode);

            if (options.bgcolor) {
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = options.bgcolor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            return canvas;
        }
    }

    function cloneNode(node, filter, root) {
        if (!root && filter && !filter(node)) return Promise.resolve();

        return Promise.resolve(node)
            .then(makeNodeCopy)
            .then(function (clone) {
                return cloneChildren(node, clone, filter);
            })
            .then(function (clone) {
                return processClone(node, clone);
            });

        function makeNodeCopy(node) {
            if (node instanceof HTMLCanvasElement) return util.makeImage(node.toDataURL());
            return node.cloneNode(false);
        }

        function cloneChildren(original, clone, filter) {
            var children = original.childNodes;
            if (children.length === 0) return Promise.resolve(clone);

            return cloneChildrenInOrder(clone, util.asArray(children), filter)
                .then(function () {
                    return clone;
                });

            function cloneChildrenInOrder(parent, children, filter) {
                var done = Promise.resolve();
                children.forEach(function (child) {
                    done = done
                        .then(function () {
                            return cloneNode(child, filter);
                        })
                        .then(function (childClone) {
                            if (childClone) parent.appendChild(childClone);
                        });
                });
                return done;
            }
        }

        function processClone(original, clone) {
            if (!(clone instanceof Element)) return clone;

            return Promise.resolve()
                .then(cloneStyle)
                .then(clonePseudoElements)
                .then(copyUserInput)
                .then(fixSvg)
                .then(function () {
                    return clone;
                });

            function cloneStyle() {
                copyStyle(window.getComputedStyle(original), clone.style);

                function copyStyle(source, target) {
                    if (source.cssText) target.cssText = source.cssText;
                    else copyProperties(source, target);

                    function copyProperties(source, target) {
                        util.asArray(source).forEach(function (name) {
                            target.setProperty(
                                name,
                                source.getPropertyValue(name),
                                source.getPropertyPriority(name)
                            );
                        });
                    }
                }
            }

            function clonePseudoElements() {
                [':before', ':after'].forEach(function (element) {
                    clonePseudoElement(element);
                });

                function clonePseudoElement(element) {
                    var style = window.getComputedStyle(original, element);
                    var content = style.getPropertyValue('content');

                    if (content === '' || content === 'none') return;

                    var className = util.uid();
                    clone.className = clone.className + ' ' + className;
                    var styleElement = document.createElement('style');
                    styleElement.appendChild(formatPseudoElementStyle(className, element, style));
                    clone.appendChild(styleElement);

                    function formatPseudoElementStyle(className, element, style) {
                        var selector = '.' + className + ':' + element;
                        var cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
                        return document.createTextNode(selector + '{' + cssText + '}');

                        function formatCssText(style) {
                            var content = style.getPropertyValue('content');
                            return style.cssText + ' content: ' + content + ';';
                        }

                        function formatCssProperties(style) {

                            return util.asArray(style)
                                .map(formatProperty)
                                .join('; ') + ';';

                            function formatProperty(name) {
                                return name + ': ' +
                                    style.getPropertyValue(name) +
                                    (style.getPropertyPriority(name) ? ' !important' : '');
                            }
                        }
                    }
                }
            }

            function copyUserInput() {
                if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
                if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
            }

            function fixSvg() {
                if (!(clone instanceof SVGElement)) return;
                clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

                if (!(clone instanceof SVGRectElement)) return;
                ['width', 'height'].forEach(function (attribute) {
                    var value = clone.getAttribute(attribute);
                    if (!value) return;

                    clone.style.setProperty(attribute, value);
                });
            }
        }
    }

    function embedFonts(node) {
        return fontFaces.resolveAll()
            .then(function (cssText) {
                var styleNode = document.createElement('style');
                node.appendChild(styleNode);
                styleNode.appendChild(document.createTextNode(cssText));
                return node;
            });
    }

    function inlineImages(node) {
        return images.inlineAll(node)
            .then(function () {
                return node;
            });
    }

    function makeSvgDataUri(node, width, height) {
        return Promise.resolve(node)
            .then(function (node) {
                node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                return new XMLSerializer().serializeToString(node);
            })
            .then(util.escapeXhtml)
            .then(function (xhtml) {
                return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + '</foreignObject>';
            })
            .then(function (foreignObject) {
                return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                    foreignObject + '</svg>';
            })
            .then(function (svg) {
                return 'data:image/svg+xml;charset=utf-8,' + svg;
            });
    }

    function newUtil() {
        return {
            escape: escape,
            parseExtension: parseExtension,
            mimeType: mimeType,
            dataAsUrl: dataAsUrl,
            isDataUrl: isDataUrl,
            canvasToBlob: canvasToBlob,
            resolveUrl: resolveUrl,
            getAndEncode: getAndEncode,
            uid: uid(),
            delay: delay,
            asArray: asArray,
            escapeXhtml: escapeXhtml,
            makeImage: makeImage,
            width: width,
            height: height
        };

        function mimes() {
            /*
             * Only WOFF and EOT mime types for fonts are 'real'
             * see http://www.iana.org/assignments/media-types/media-types.xhtml
             */
            var WOFF = 'application/font-woff';
            var JPEG = 'image/jpeg';

            return {
                'woff': WOFF,
                'woff2': WOFF,
                'ttf': 'application/font-truetype',
                'eot': 'application/vnd.ms-fontobject',
                'png': 'image/png',
                'jpg': JPEG,
                'jpeg': JPEG,
                'gif': 'image/gif',
                'tiff': 'image/tiff',
                'svg': 'image/svg+xml'
            };
        }

        function parseExtension(url) {
            var match = /\.([^\.\/]*?)$/g.exec(url);
            if (match) return match[1];
            else return '';
        }

        function mimeType(url) {
            var extension = parseExtension(url).toLowerCase();
            return mimes()[extension] || '';
        }

        function isDataUrl(url) {
            return url.search(/^(data:)/) !== -1;
        }

        function toBlob(canvas) {
            return new Promise(function (resolve) {
                var binaryString = window.atob(canvas.toDataURL().split(',')[1]);
                var length = binaryString.length;
                var binaryArray = new Uint8Array(length);

                for (var i = 0; i < length; i++)
                    binaryArray[i] = binaryString.charCodeAt(i);

                resolve(new Blob([binaryArray], {
                    type: 'image/png'
                }));
            });
        }

        function canvasToBlob(canvas) {
            if (canvas.toBlob)
                return new Promise(function (resolve) {
                    canvas.toBlob(resolve);
                });

            return toBlob(canvas);
        }

        function resolveUrl(url, baseUrl) {
            var doc = document.implementation.createHTMLDocument();
            var base = doc.createElement('base');
            doc.head.appendChild(base);
            var a = doc.createElement('a');
            doc.body.appendChild(a);
            base.href = baseUrl;
            a.href = url;
            return a.href;
        }

        function uid() {
            var index = 0;

            return function () {
                return 'u' + fourRandomChars() + index++;

                function fourRandomChars() {
                    /* see http://stackoverflow.com/a/6248722/2519373 */
                    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
                }
            };
        }

        function makeImage(uri) {
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = reject;
                image.src = uri;
            });
        }

        function getAndEncode(url) {
            var TIMEOUT = 30000;
            if(domtoimage.impl.options.cacheBust) {
                // Cache bypass so we dont have CORS issues with cached images
                // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
                url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
            }

            return new Promise(function (resolve) {
                var request = new XMLHttpRequest();

                request.onreadystatechange = done;
                request.ontimeout = timeout;
                request.responseType = 'blob';
                request.timeout = TIMEOUT;
                request.open('GET', url, true);
                request.send();

                var placeholder;
                if(domtoimage.impl.options.imagePlaceholder) {
                    var split = domtoimage.impl.options.imagePlaceholder.split(/,/);
                    if(split && split[1]) {
                        placeholder = split[1];
                    }
                }

                function done() {
                    if (request.readyState !== 4) return;

                    if (request.status !== 200) {
                        if(placeholder) {
                            resolve(placeholder);
                        } else {
                            fail('cannot fetch resource: ' + url + ', status: ' + request.status);
                        }

                        return;
                    }

                    var encoder = new FileReader();
                    encoder.onloadend = function () {
                        var content = encoder.result.split(/,/)[1];
                        resolve(content);
                    };
                    encoder.readAsDataURL(request.response);
                }

                function timeout() {
                    if(placeholder) {
                        resolve(placeholder);
                    } else {
                        fail('timeout of ' + TIMEOUT + 'ms occured while fetching resource: ' + url);
                    }
                }

                function fail(message) {
                    console.error(message);
                    resolve('');
                }
            });
        }

        function dataAsUrl(content, type) {
            return 'data:' + type + ';base64,' + content;
        }

        function escape(string) {
            return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
        }

        function delay(ms) {
            return function (arg) {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(arg);
                    }, ms);
                });
            };
        }

        function asArray(arrayLike) {
            var array = [];
            var length = arrayLike.length;
            for (var i = 0; i < length; i++) array.push(arrayLike[i]);
            return array;
        }

        function escapeXhtml(string) {
            return string.replace(/#/g, '%23').replace(/\n/g, '%0A');
        }

        function width(node) {
            var leftBorder = px(node, 'border-left-width');
            var rightBorder = px(node, 'border-right-width');
            return node.scrollWidth + leftBorder + rightBorder;
        }

        function height(node) {
            var topBorder = px(node, 'border-top-width');
            var bottomBorder = px(node, 'border-bottom-width');
            return node.scrollHeight + topBorder + bottomBorder;
        }

        function px(node, styleProperty) {
            var value = window.getComputedStyle(node).getPropertyValue(styleProperty);
            return parseFloat(value.replace('px', ''));
        }
    }

    function newInliner() {
        var URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

        return {
            inlineAll: inlineAll,
            shouldProcess: shouldProcess,
            impl: {
                readUrls: readUrls,
                inline: inline
            }
        };

        function shouldProcess(string) {
            return string.search(URL_REGEX) !== -1;
        }

        function readUrls(string) {
            var result = [];
            var match;
            while ((match = URL_REGEX.exec(string)) !== null) {
                result.push(match[1]);
            }
            return result.filter(function (url) {
                return !util.isDataUrl(url);
            });
        }

        function inline(string, url, baseUrl, get) {
            return Promise.resolve(url)
                .then(function (url) {
                    return baseUrl ? util.resolveUrl(url, baseUrl) : url;
                })
                .then(get || util.getAndEncode)
                .then(function (data) {
                    return util.dataAsUrl(data, util.mimeType(url));
                })
                .then(function (dataUrl) {
                    return string.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
                });

            function urlAsRegex(url) {
                return new RegExp('(url\\([\'"]?)(' + util.escape(url) + ')([\'"]?\\))', 'g');
            }
        }

        function inlineAll(string, baseUrl, get) {
            if (nothingToInline()) return Promise.resolve(string);

            return Promise.resolve(string)
                .then(readUrls)
                .then(function (urls) {
                    var done = Promise.resolve(string);
                    urls.forEach(function (url) {
                        done = done.then(function (string) {
                            return inline(string, url, baseUrl, get);
                        });
                    });
                    return done;
                });

            function nothingToInline() {
                return !shouldProcess(string);
            }
        }
    }

    function newFontFaces() {
        return {
            resolveAll: resolveAll,
            impl: {
                readAll: readAll
            }
        };

        function resolveAll() {
            return readAll(document)
                .then(function (webFonts) {
                    return Promise.all(
                        webFonts.map(function (webFont) {
                            return webFont.resolve();
                        })
                    );
                })
                .then(function (cssStrings) {
                    return cssStrings.join('\n');
                });
        }

        function readAll() {
            return Promise.resolve(util.asArray(document.styleSheets))
                .then(getCssRules)
                .then(selectWebFontRules)
                .then(function (rules) {
                    return rules.map(newWebFont);
                });

            function selectWebFontRules(cssRules) {
                return cssRules
                    .filter(function (rule) {
                        return rule.type === CSSRule.FONT_FACE_RULE;
                    })
                    .filter(function (rule) {
                        return inliner.shouldProcess(rule.style.getPropertyValue('src'));
                    });
            }

            function getCssRules(styleSheets) {
                var cssRules = [];
                styleSheets.forEach(function (sheet) {
                    try {
                        util.asArray(sheet.cssRules || []).forEach(cssRules.push.bind(cssRules));
                    } catch (e) {
                        console.log('Error while reading CSS rules from ' + sheet.href, e.toString());
                    }
                });
                return cssRules;
            }

            function newWebFont(webFontRule) {
                return {
                    resolve: function resolve() {
                        var baseUrl = (webFontRule.parentStyleSheet || {}).href;
                        return inliner.inlineAll(webFontRule.cssText, baseUrl);
                    },
                    src: function () {
                        return webFontRule.style.getPropertyValue('src');
                    }
                };
            }
        }
    }

    function newImages() {
        return {
            inlineAll: inlineAll,
            impl: {
                newImage: newImage
            }
        };

        function newImage(element) {
            return {
                inline: inline
            };

            function inline(get) {
                if (util.isDataUrl(element.src)) return Promise.resolve();

                return Promise.resolve(element.src)
                    .then(get || util.getAndEncode)
                    .then(function (data) {
                        return util.dataAsUrl(data, util.mimeType(element.src));
                    })
                    .then(function (dataUrl) {
                        return new Promise(function (resolve, reject) {
                            element.onload = resolve;
                            element.onerror = reject;
                            element.src = dataUrl;
                        });
                    });
            }
        }

        function inlineAll(node) {
            if (!(node instanceof Element)) return Promise.resolve(node);

            return inlineBackground(node)
                .then(function () {
                    if (node instanceof HTMLImageElement)
                        return newImage(node).inline();
                    else
                        return Promise.all(
                            util.asArray(node.childNodes).map(function (child) {
                                return inlineAll(child);
                            })
                        );
                });

            function inlineBackground(node) {
                var background = node.style.getPropertyValue('background');

                if (!background) return Promise.resolve(node);

                return inliner.inlineAll(background)
                    .then(function (inlined) {
                        node.style.setProperty(
                            'background',
                            inlined,
                            node.style.getPropertyPriority('background')
                        );
                    })
                    .then(function () {
                        return node;
                    });
            }
        }
    }
})(this);

},{}],9:[function(require,module,exports){
(function (global){
(function(a,b){if("function"==typeof define&&define.amd)define([],b);else if("undefined"!=typeof exports)b();else{b(),a.FileSaver={exports:{}}.exports}})(this,function(){"use strict";function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b),e.responseType="blob",e.onload=function(){a(e.response,c,d)},e.onerror=function(){console.error("could not download file")},e.send()}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send()}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"))}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b)}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof global&&global.global===global?global:void 0,a=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href)},4E4),setTimeout(function(){e(j)},0))}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i)})}}:function(a,b,d,e){if(e=e||open("","_blank"),e&&(e.document.title=e.document.body.innerText="downloading..."),"string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),e?e.location.href=a:location=a,e=null},j.readAsDataURL(a)}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l,e=null,setTimeout(function(){k.revokeObjectURL(l)},4E4)}});f.saveAs=a.saveAs=a,"undefined"!=typeof module&&(module.exports=a)});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2]);
