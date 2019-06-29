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
