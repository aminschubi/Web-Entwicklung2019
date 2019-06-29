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
