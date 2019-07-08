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
						this.client.reloadList(t);
						cb(t);
						return;
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
			this.updateName((t) => {
				t.planLists[t.plans[t.plans.length - 1].length - 1].createPreview();
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
