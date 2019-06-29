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
