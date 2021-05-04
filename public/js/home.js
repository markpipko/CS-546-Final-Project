// const userMetrics = data.userMetrics;
const totalReturn = document.getElementById("totalReturn");
const percentGrowth = document.getElementById("percentGrowth");
const volatility = document.getElementById("volatility");
const refresh = document.getElementById("refresh");

var pValue = []
var dates = []


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

$(document).ready(function() {
	var myTime = setInterval(graph, 5000) //calls every 5 seconds
	graph()
})

function graph(){
	var requestConfig = {
		method: "POST",
		url: `/private/userGraph`,
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		pValue.push(responseMessage.value)
		var today = new Date()
		dates.push(today)

		var trace = {
			x: dates,
			y: pValue,
			mode: "lines+markers",
		};

		var data = [trace];
		Plotly.newPlot("userGraph", data)
	})
}


