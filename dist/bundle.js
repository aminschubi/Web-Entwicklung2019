(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* eslint-disable brace-style */
class Studienablaufplan {
	constructor(name, semesterAnzahl, anzahlECTSproSemester) {
		this.name = name;
		this.semesterAnzahl = semesterAnzahl;
		this.anzahlECTSproSemester = anzahlECTSproSemester;
	}
}
class Semester {
	constructor(modules) {
		this.modules = modules;
	}
}

class Modul {
	constructor(name, ects) {
		this.name = name;
		this.ects = ects;
	}
}

var fs = require("fs");
var file = require("./m.json");
var data = require("./m.json");

var buildBody = function () {
	var buttonTest = document.createElement("button");
	buttonTest.name = "Button";
	buttonTest.id = "b1";
	buttonTest.textContent = "HALLO";
	buttonTest.onclick = () => {
		var m = new Modul("THI", 5);
		data.push(JSON.stringify(m));
		file = JSON.stringify(data);
		file = require("./m.json");
		console.log(file);
	};
	document.body.appendChild(buttonTest);
};
buildBody();

},{"./m.json":2,"fs":3}],2:[function(require,module,exports){
module.exports=[]

},{}],3:[function(require,module,exports){

},{}]},{},[1]);
