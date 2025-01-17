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
