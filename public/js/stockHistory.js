const totalReturn = document.getElementById("totalReturn");
const percentGrowth = document.getElementById("percentGrowth");
const volatility = document.getElementById("volatility");
const refresh = document.getElementById("refresh");
var nav = document.querySelector("nav")
var main = document.querySelector("main")

start()
function start() {
	var currTime = new Date();
	var currHour = currTime.getHours();
	var currMin = currTime.getMinutes();

	if (currHour < 9 || currHour > 16 || (currHour == 9 && currMin < 30)) {
		nav.className = "navbar navbar-inverse"
		main.className = "night"
		document.body.style.backgroundColor = "black";
	}else{
		nav.className = "navbar navbar-default"
		main.className = "day"
		document.body.style.backgroundColor = "white";
	}
}

refresh.click(function (event) {
	event.preventDefault();
	var requestConfig = {
		method: "POST",
		url: `/private/update`,
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		totalReturn.innerHTML = "Total Return: " + responseMessage.totalReturn;
		percentGrowth.innerHTML = "Total Growth: " + responseMessage.percentGrowth;
		volatility.innerHTML = "Volatility: " + responseMessage.volatility;
	});
});