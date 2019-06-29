class SemesterListElement {
	constructor(semester) {
		this.div = document.createElement("div");
		this.div.className = "semesterListElement";
		this.semester = semester;
		this.buttons = [];
		console.log(this.semester.modules);
		for (let i = 0; i < semester.modules.length; i++) {
			var b = document.createElement("button");
			b.className = "previewButton";
			b.innerHTML = semester.modules[i].name;
			console.log(b);
			this.buttons.push(b);
			this.div.appendChild(b);
		}
	}
}

module.exports = SemesterListElement;
