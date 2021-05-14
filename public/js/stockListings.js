var nav = document.querySelector("nav");
var main = document.querySelector("main");

start();
function start() {
	var currTime = new Date();
	var currHour = currTime.getHours();
	var currMin = currTime.getMinutes();

	if (currHour < 9 || currHour > 16 || (currHour == 9 && currMin < 30)) {
		nav.className = "navbar navbar-inverse";
		main.className = "night";
		document.body.style.backgroundColor = "black";
	} else {
		nav.className = "navbar navbar-default";
		main.className = "day";
		document.body.style.backgroundColor = "white";
	}
}

$(document).ready(function () {
	$.ajax({
		method: "GET",
		url:
			"https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/8caaa9cecf5b6d60a147e15c20eee688/constituents_json.json",
	}).then(function (data) {
		let stockList = document.getElementById("stockList");
		stockList.innerHTML = "";
		data.forEach(function (x) {
			let li = document.createElement("li");
			let a = document.createElement("a");
			let linkText = document.createTextNode(x["Name"]);
			a.appendChild(linkText);
			a.href = "/private/stocks/" + x["Symbol"];
			a.className = "stockListing";
			li.append(a);
			stockList.append(li);
		});
		stockList.hidden = false;
	});
});
