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
					s.addModule(client.modulesObject.wpf);
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
