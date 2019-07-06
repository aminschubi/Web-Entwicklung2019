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
