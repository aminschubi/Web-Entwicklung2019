var express = require("express");
var path = require("path");
var app = express();
var fs = require("fs");
var plans = {};
var modules = {};

app.use(express.static(path.join(__dirname, "./")));
app.use(express.json());

var port = process.env.PORT || 8080;

app.get("/fonts/*", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	let url = req.url;
	console.log(req);
	let id = url.substring(url.lastIndexOf("/") + 1);
	let end = url.substring(url.lastIndexOf(".") + 1);
	console.log(end);
	if (end === "woff2") {
		res.setHeader("Content-Type", "application/font-woff2");
	}
	else {
		res.setHeader("Content-Type", "application/font-woff woff");
	}
	console.log("GET REQUESTED");
	const u = ".." + req.url;
	res.sendFile(path.join(__dirname, u));
});

app.get("/plans", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("GET REQUESTED");
	console.log(plans);
	res.send(plans);
});

app.get("/modules", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("GET REQUESTED");
	console.log(modules);
	res.send(modules);
});

app.get("/plans/*", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("GET PLAN REQUESTED");
	let url = req.url;
	let id = url.substring(url.lastIndexOf("/") + 1);
	console.log(plans);
	res.send(getPlan(id));
});

app.get("/modules/*", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("GET MODULE REQUESTED");
	let url = req.url;
	let id = url.substring(url.lastIndexOf("/") + 1);
	if (!modules[id]) {
		res.status = 404;
		res.send("404");
	}
	else {
		console.log(modules[id]);
		res.send((modules[id]));
	}
});

app.post("/setPlans", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("POST REQUESTED");
	plans = req.body;
	console.log(plans);
	fileHandler.write("../db/plans.json", plans, () => {
		res.send();
	});
});

app.post("/setPlan/*", (req, res) => {
	console.log("POST PLAN REQUESTED");
	let url = req.url;
	let id = url.substring(url.lastIndexOf("/") + 1);
	console.log(req.body);
	if (Object.keys(plans).indexOf(id) === -1) {
		plans[id] = req.body;
		fileHandler.write("../db/plans.json", JSON.stringify(plans), () => {
			res.sendStatus(409);
		});
	}
	else {
		res.sendStatus(404);
	}
});

app.post("setModules/*", (req, res) => {
	console.log("POST MODULE REQUESTED");
	let url = req.url;
	let id = url.substring(url.lastIndexOf("/") + 1);
	if (Object.keys(modules).indexOf(id) === -1) {
		plans[id] = req.body;
		fileHandler.write("../db/m.json", JSON.stringify(modules), () => {
			res.sendStatus(409);
		});
	}
	else {
		res.sendStatus(404);
	}
});

app.delete("/deletePlan/*", (req, res) => {
	console.log("DELETE REQUESTED");
	let url = req.url;
	console.log(url);
	let id = url.substring(url.lastIndexOf("/") + 1);
	let clean = id.split("%20").join(" ");
	console.log(plans);
	delete plans[clean];
	console.log(plans);
	fileHandler.write("../db/plans.json", plans, () => {
		res.send();
	});
});

app.listen(port, function () {
	console.log("Server listening on port " + port + "!");
});

var getPlan = (id) => {
	return plans[id];
};

class FileHandler {
	read(url, c) {
		console.log("Filehandler read");
		var cb = c;
		console.log(c);
		fs.readFile(url, "utf8", (err, data) => {
			console.log(typeof data);
			if (data !== "{}") {
				console.log(data, "Y");
				cb(JSON.parse(data));
			}
			else {
				fs.writeFile(url, JSON.stringify({}), (error) => {
					if (error) {
						console.log(error);
					}
				});
			}
		});
	}

	write(url, target, cb) {
		fs.writeFile(url, JSON.stringify(target), (error) => {
			if (error) {
				console.error(error);
			}
			cb();
		});
	}
}

var fileHandler = new FileHandler();

fileHandler.read("../db/m.json", (data) => {
	modules = data;
});
fileHandler.read("../db/plans.json", (data) => {
	plans = data;
});
