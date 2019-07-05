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
		this.buttons.push(ind);
		this.div.appendChild(ind);

		for (let i = 0; i < semester.modules.length; i++) {
			var b = document.createElement("button");
			b.className = "previewButton";
			b.innerHTML = semester.modules[i].name;
			b.name = "" + i;
			// eslint-disable-next-line no-loop-func
			b.onclick = (event) => {
				console.log("Button pressed!");
				this.plan.plan.semesters[index - 1].modules[(Number.parseInt(event.target.name))] = this.plan.client.modules[0][1];
				this.plan.saveToClient();
				this.plan.client.savePlans();
				this.plan.createPreview();
				this.plan.client.reloadM(this.plan.client);
				console.log("done");
			};
			this.buttons.push(b);
			this.div.appendChild(b);
		}
	}
}

module.exports = SemesterListElement;
