// const userMetrics = data.userMetrics;
const totalReturn = document.getElementById("totalReturn");
const percentGrowth = document.getElementById("percentGrowth");
const volatility = document.getElementById("volatility");
const refresh = document.getElementById("refresh");
const pValueTag = document.getElementById("pValue");

var pValue = []
var dates = []
var repititions = 0;

$(document).ready(function() {
	var myTime = setInterval(graph, 5000); //calls every 5 seconds
	graph();
})

function graph(){
	if (repititions >= 5) {
		var currTime = new Date();
		var currHour = currTime.getHours();
		var currMin = currTime.getMinutes();

		if (currHour < 9 || currHour > 16 || (currHour == 9 && currMin < 30)) {
			//TODO: Can set Dark Mode for closed hours here
			return;
		}

		repititions = 0;
	}
	repititions++;

	var requestConfig = {
		method: "POST",
		url: `/private/userGraph`,
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		pValue.push(responseMessage.totalValue);
		var today = new Date();
		dates.push(today);

		var trace = {
			x: dates,
			y: pValue,
			mode: "lines+markers",
		};

		var layout = {
			autosize: false,
			width: 500,
			height: 500,
		  };

		var data = [trace];
		Plotly.newPlot("userGraph", data, layout);

		pValueTag.innerHTML = `Portfolio Value: $${responseMessage.pValue}`;
	});
}


