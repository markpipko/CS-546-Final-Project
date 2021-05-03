// const userMetrics = data.userMetrics;
const totalReturn = document.getElementById("totalReturn");
const percentGrowth = document.getElementById("percentGrowth");
const volatility = document.getElementById("volatility");
const refresh = document.getElementById("refresh");

(function($) {
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
})(window.jQuery);
