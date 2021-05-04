const myForm = document.getElementById("search_stock");
const input = document.getElementById("stock_ticker");
const errorContainer = document.getElementById("error_container");
const stockInfo = document.getElementById("stock_info");

const transForm = document.getElementById("transForm");
const shareInput = document.getElementById("amount");
const stockError = document.getElementById("error_container2");

const refreshForm = document.getElementById("refresh");
const temp = document.getElementById("temp_ticker");

// if (myForm) {
// 	myForm.addEventListener("submit", (event) => {
// 		event.preventDefault();
// 		if (input.value.trim()) {
// 			input.value = input.value.trim();
// 			$.ajax({
// 				method: "POST",
// 				url: "/private/find",
// 				contentType: "application/json",
// 				data: JSON.stringify({
// 					stock_ticker: input.value.toUpperCase(),
// 				}),
// 			}).then(function (x) {
// 				if (x.error) {
// 					errorContainer.hidden = false;
// 					errorContainer.innerHTML = x.error;
// 					return;
// 				}
// 				errorContainer.hidden = true;
// 				stockInfo.innerHTML = "";

// 				let h1 = document.createElement("h1");
// 				if (!x.stock.name) {
// 					h1.innerHTML = " (" + x.stock.ticker + ")";
// 				} else {
// 					h1.innerHTML = x.stock.name + " (" + x.stock.ticker + ")";
// 				}
// 				document.title = x.stock.ticker;

// 				stockInfo.append(h1);

// 				let h2 = document.createElement("h2");
// 				h2.innerHTML = "$" + x.stock.price;
// 				h2.id = "price";
// 				if (x.status == 1) {
// 					h2.className = "up";
// 				} else if (x.status == 0) {
// 					h2.className = "same";
// 				} else {
// 					h2.className = "down";
// 				}
// 				stockInfo.append(h2);
// 				stockInfo.append(refreshForm);

// 				let p1 = document.createElement("p");
// 				p1.innerHTML = "Exchange: " + x.stock.exchange;
// 				stockInfo.append(p1);

// 				let p2 = document.createElement("p");
// 				p2.innerHTML = "Industry: " + x.stock.industry;
// 				stockInfo.append(p2);

// 				let p3 = document.createElement("p");
// 				if (x.stock.range52W.high != "N/A") {
// 					p3.innerHTML = "52 Week High: $" + x.stock.range52W.high;
// 				} else {
// 					p3.innerHTML = "52 Week High: " + x.stock.range52W.high;
// 				}
// 				p3.id = "52high";
// 				stockInfo.append(p3);

// 				let p4 = document.createElement("p");
// 				if (x.stock.range52W.low != "N/A") {
// 					p4.innerHTML = "52 Week Low: $" + x.stock.range52W.low;
// 				} else {
// 					p4.innerHTML = "52 Week Low: " + x.stock.range52W.low;
// 				}
// 				p4.id = "52low";
// 				stockInfo.append(p4);

// 				let p5 = document.createElement("p");
// 				p5.innerHTML = "Volume: " + x.stock.volume;
// 				p5.id = "volume";
// 				stockInfo.append(p5);

// 				let p6 = document.createElement("p");
// 				p6.innerHTML = "Recommendation: " + x.recommendation;
// 				p6.id = "recommendation";
// 				stockInfo.append(p6);
// 				$("#temp_ticker").attr("value", x.stock.ticker);
// 				myForm.reset();
// 				$.unblockUI();
// 			});
// 		} else {
// 			$.unblockUI();
// 			errorContainer.hidden = false;
// 			errorContainer.innerHTML = "Please input a ticker";
// 		}
// 	});
// }

if (refreshForm) {
	refreshForm.addEventListener("submit", (event) => {
		event.preventDefault();
		if (temp.value.trim()) {
			temp.value = temp.value.trim();
			$.ajax({
				method: "POST",
				url: "/private/find",
				contentType: "application/json",
				data: JSON.stringify({
					stock_ticker: temp.value.toUpperCase(),
				}),
			}).then(function (x) {
				if (x.error) {
					$.unblockUI();
					errorContainer.hidden = false;
					errorContainer.innerHTML = x.error;
					return;
				}
				errorContainer.hidden = true;
				const price = document.getElementById("price");
				if (price != x.stock.price) {
					if (x.status == 1) {
						price.className = "up";
					} else if (x.status == 0) {
						price.className = "same";
					} else {
						price.className = "down";
					}
					price.innerHTML = "$" + x.stock.price;
				}

				const high52 = document.getElementById("52high");
				if (high52 != "N/A") {
					if (high52 != x.stock.range52W.high)
						high52.innerHTML = "52 Week High: $" + x.stock.range52W.high;
				} else {
					high52.innerHTML = "52 Week High: " + x.stock.range52W.high;
				}

				const low52 = document.getElementById("52low");
				if (low52 != "N/A") {
					if (low52 != x.stock.range52W.low)
						low52.innerHTML = "52 Week Low: $" + x.stock.range52W.low;
				} else {
					low52.innerHTML = "52 Week Low: $" + x.stock.range52W.low;
				}

				const volume = document.getElementById("volume");
				if (volume != x.stock.volume) {
					volume.innerHTML = "Volume: " + x.stock.volume;
				}

				const recommendation = document.getElementById("recommendation");
				if (recommendation != x.recommendation) {
					recommendation.innerHTML = "Recommendation: " + x.recommendation;
				}
				$("#temp_ticker").attr("value", x.stock.ticker);
				$.unblockUI();

				refreshForm.reset();
			});
		} else {
			errorContainer.hidden = false;
			errorContainer.innerHTML = "Please input a ticker";
		}
	});
}

$("#search_button").click(function () {
	$.blockUI({
		message: "Loading...",
		overlayCSS: { backgroundColor: "#0f0" },
	});
});

$("#refresh_button").click(function () {
	$.blockUI({
		message: "Loading...",
		overlayCSS: { backgroundColor: "#0f0" },
	});
});

function blockTransaction() {
	$.blockUI({
		message: "Please wait...",
		overlayCSS: { backgroundColor: "#0f0" },
	});
}

if (transForm) {
	transForm.addEventListener("submit", (event) => {
		event.preventDefault();
		let transaction = $("input[name=transaction]:checked").val();
		if (!transaction) {
			$.unblockUI();
			stockError.hidden = false;
			stockError.innerHTML = "Transaction was not specified";
		}

		let quantity = $("#amount").val();
		if (!quantity) {
			$.unblockUI();
			stockError.hidden = false;
			stockError.innerHTML = "Stock quantity was not specified";
		}
		if (quantity < 1) {
			$.unblockUI();
			stockError.hidden = false;
			stockError.innerHTML = "Stock quantity cannot be less than 1";
		}

		if (temp.value.trim() && transaction && quantity) {
			temp.value = temp.value.trim();
			blockTransaction();
			$.ajax({
				method: "POST",
				url: "/private/transaction",
				contentType: "application/json",
				data: JSON.stringify({
					stock_ticker: temp.value.toUpperCase(),
					transaction: transaction,
					quantity: quantity,
				}),
			}).then(function (x) {
				if (x.error) {
					// stockError.hidden = false;
					// stockError.innerHTML = x.error;
					let errorStatus = document.createElement("p");
					$("#dialog-message2").html("");
					errorStatus.innerHTML = x.error;

					$("#dialog-message2").append(errorStatus);
					$("#dialog-message2").dialog({
						modal: true,
						buttons: {
							Ok: function () {
								$(this).dialog("close");
							},
						},
					});
				} else {
					let result = document.createElement("p");
					$("#dialog-message").html("");
					if (quantity == 1) {
						result.innerHTML = `Your order to ${transaction} ${quantity} share of ${temp.value.toUpperCase()} was successful.`;
					} else {
						result.innerHTML = `Your order to ${transaction} ${quantity} shares of ${temp.value.toUpperCase()} was successful.`;
					}

					$("#dialog-message").append(result);
					$("#dialog-message").dialog({
						modal: true,
						buttons: {
							Ok: function () {
								$(this).dialog("close");
							},
						},
					});
					transForm.reset();
				}

				$.unblockUI();
			});
		}
	});
}

$(document).ready(function () {
	let ticker = temp.value;
	var requestConfig = {
		method: "POST",
		url: `/private/graph`,
		contentType: "application/json",
		data: JSON.stringify({
			ticker: ticker,
			subtract: 7,
		}),
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		Plotly.newPlot("graph", responseMessage.chart);
	});
});

$("#1w, #1m, #1y, #5y").click(function (event) {
	event.preventDefault();
	let ticker = temp.value;
	var num;
	if ($(event.target).attr("id") == "1w") {
		num = 7;
	} else if ($(event.target).attr("id") == "1m") {
		num = 30;
	} else if ($(event.target).attr("id") == "1y") {
		num = 365;
	} else if ($(event.target).attr("id") == "5y") {
		num = 365 * 5;
	}

	//console.log(ticker, num);
	var requestConfig = {
		method: "POST",
		url: `/private/graph`,
		contentType: "application/json",
		data: JSON.stringify({
			ticker: ticker,
			subtract: num,
		}),
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		Plotly.newPlot("graph", responseMessage.chart);
	});
});

// 	Ploty.newPlot('graph', trace)
// })
