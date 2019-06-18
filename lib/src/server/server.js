var express = require("express");
var path = require("path");
var app = express();
var fs = require("fs");
var plans = {};
var modules = {};

app.use(express.static(path.join(__dirname, "./")));
app.use(express.json());

var port = process.env.PORT || 8080;

app.get("/plans", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("GET REQUESTED");
	fileHandler.read("../db/plans.json", plans, (data) => {
		console.log(plans);
		res.send(JSON.parse(plans));
	});
});

app.get("/plans/*", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	console.log("GET PLAN REQUESTED");
	let url = req.url;
	console.log(url);
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

app.delete("/deletePlan/*", (req, res) => {
	let url = req.url;
	let id = url.substring(url.lastIndexOf("/") + 1);
	console.log(id);
	delete plans[id];
	res.send();
});

app.listen(port, function () {
	console.log("Server listening on port " + port + "!");
});

class FileHandler {
	read(url, target, cb) {
		console.log("Filehandler read");
		fs.readFile(url, "utf8", (err, data) => {
			try {
				cb(data);
			}
			catch (e) {
				fs.writeFile(url, JSON.stringify({}), (error) => {
					if (error) {
						console.log(error);
					}
					target = {};
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

fileHandler.read("../db/m.json", modules, (data) => {
	modules = JSON.parse(data);
});
fileHandler.read("../db/plans.json", plans, (data) => {
	plans = JSON.parse(data);
});
