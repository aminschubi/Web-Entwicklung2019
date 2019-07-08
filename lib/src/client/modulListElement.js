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
				this.div.style.border = "1px solid #ffffff";
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
		else if (name.includes("/") || name.includes("%") || name.includes("\\") || name.includes("#")) {
			alert("Name darf kein / , % , \\ , # enthalten. Bitte nochmal versuchen");
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
					this.div.id = name;
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
		if (name === "" || name === null || name === "null") {
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
