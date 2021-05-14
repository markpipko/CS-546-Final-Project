const myForm = document.getElementById("search_stock");
const input = document.getElementById("stock_ticker");
const errorContainer = document.getElementById("error_container");
const stockInfo = document.getElementById("stock_info");

const transForm = document.getElementById("transForm");
const shareInput = document.getElementById("amount");

const refreshForm = document.getElementById("refresh");
const temp = document.getElementById("temp_ticker");

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
					$("#modal-body").html("");
					$("#modalTitle").html("Error");
					let errorStatus = document.createElement("p");
					errorStatus.innerHTML = "Error refreshing data";
					$("#transaction_modal").modal("show");
					$("#modal-body").append(errorStatus);
					$.unblockUI();
					return;
				}
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
			$("#modal-body").html("");
			$("#modalTitle").html("Error");
			let errorStatus = document.createElement("p");
			errorStatus.innerHTML = "Error refreshing data";
			$("#transaction_modal").modal("show");
			$("#modal-body").append(errorStatus);
			$.unblockUI();
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
	var requestConfig = {
		method: "POST",
		url: `/private/updateStock`,
		contentType: "application/json",
		data: JSON.stringify({
			ticker: temp.value.trim(),
		}),
	};
	$.ajax(requestConfig).then(function (responseMessage) {
		$("#cash").html("Cash: " + "$" + responseMessage.cash.toFixed(2));
		$("#owned").html("Shares Owned: " + responseMessage.sharesOwned);
	});
});

$("#favorites_button").click(function () {
	$.ajax({
		method: "POST",
		url: `/private/favorites/${this.name}`,
		contentType: "application/json",
		data: JSON.stringify({
			ticker: this.name,
		}),
	});
	// $("favorites_button").hide();
	// $("#favorites_remove_button").show();
});

$("#favorites_remove_button").click(function () {
	$.ajax({
		method: "DELETE",
		url: `/private/favorites/${this.name}`,
		contentType: "application/json",
		data: JSON.stringify({
			ticker: this.name,
		}),
		async: false,
	});
	// $("#favorites_remove_button").hide();
	// $("favorites_button").show();

	// location.reload();
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
		let transaction = $("input[class=form-check-input]:checked").val();
		$("#modal-body").html("");

		if (!transaction) {
			$("#modalTitle").html("Transaction Incomplete");
			let errorStatus = document.createElement("p");
			errorStatus.innerHTML = "Transaction was not specified.";
			$("#transaction_modal").modal("show");
			$("#modal-body").append(errorStatus);
			$("#twitter_share").hide();
			$("#email_share").hide();
			$.unblockUI();
			return;
		}

		let quantity = $("#amount").val();
		if (!quantity && transaction != "sellAll") {
			$("#modalTitle").html("Transaction Incomplete");
			let errorStatus = document.createElement("p");
			errorStatus.innerHTML = "Quantity was not specified.";
			$("#transaction_modal").modal("show");
			$("#modal-body").append(errorStatus);
			$("#twitter_share").hide();
			$("#email_share").hide();
			$.unblockUI();
			return;
		}
		let investOption = $("#choice").val();

		if (quantity <= 0 && transaction != "sellAll") {
			$("#modalTitle").html("Transaction Incomplete");
			let errorStatus = document.createElement("p");
			if (investOption == "shares") {
				errorStatus.innerHTML = "Stock quantity must be greater than 0";
			} else {
				errorStatus.innerHTML = "Dollar amount must be greater than 0";
			}
			$("#transaction_modal").modal("show");
			$("#modal-body").append(errorStatus);
			$("#twitter_share").hide();
			$("#email_share").hide();
			$.unblockUI();
			return;
		}

		if (temp.value.trim() && transaction && quantity || transaction == "sellAll") {
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
					investOption: investOption,
				}),
			}).then(function (x) {
				if (x.error) {
					$("#modalTitle").html("Transaction Incomplete");
					let errorStatus = document.createElement("p");
					errorStatus.innerHTML = x.error;
					$("#transaction_modal").modal("show");
					$("#modal-body").append(errorStatus);
					$("#twitter_share").hide();
					$("#email_share").hide();
				} else {
					let result = document.createElement("p");
					quantity = x.quantity;
					$("#modalTitle").html("Transaction Complete");
					$("#transaction_modal").modal("show");
					let shares = "";
					if (quantity == 1) {
						shares = "share";
						result.innerHTML = `Your order to ${transaction} ${quantity} share of ${temp.value.toUpperCase()} was successful.`;
					} else {
						shares = "shares";
						result.innerHTML = `Your order to ${transaction} ${quantity} shares of ${temp.value.toUpperCase()} was successful.`;
					}
					if (transaction == "buy") {
						$("#twitter_share").attr(
							"href",
							"https://twitter.com/intent/tweet?text=I just bought " +
								quantity +
								" " +
								shares +
								" of " +
								temp.value.toUpperCase() +
								" on Paper Trader! Go check them out!"
						);
						$("#email_share").attr(
							"href",
							"mailto:?subject=Check this out!&body=I just bought " +
								quantity +
								" " +
								shares +
								" of " +
								temp.value.toUpperCase() +
								" on Paper Trader! Go check them out!"
						);
					} else {
						$("#twitter_share").attr(
							"href",
							"https://twitter.com/intent/tweet?text=I just sold " +
								quantity +
								" " +
								shares +
								" of " +
								temp.value.toUpperCase() +
								" on Paper Trader! Go check them out!"
						);
						$("#email_share").attr(
							"href",
							"mailto:?subject=Check this out!&body=I just sold " +
								quantity +
								" " +
								shares +
								" of " +
								temp.value.toUpperCase() +
								" on Paper Trader! Go check them out!"
						);
					}
					$("#twitter_share").show();
					$("#email_share").show();
					$("#modal-body").append(result);
					transForm.reset();
				}

				$.unblockUI();
			});
		}
	});
}

$(document).ready(function () {
	let ticker = temp.value;
	if (!ticker || !ticker.trim()) {
		throw "Ticker is empty";
	}
	var requestConfig = {
		method: "POST",
		url: `/private/graph`,
		contentType: "application/json",
		data: JSON.stringify({
			ticker: ticker,
			subtract: 7,
		}),
	};

	var layout = {
		autosize: false,
		width: 500,
		height: 500,
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		Plotly.newPlot("graph", responseMessage.chart, layout);
	});
});

$("#1w, #1m, #1y, #5y").click(function (event) {
	event.preventDefault();
	let ticker = temp.value;
	if (!ticker || !ticker.trim()) {
		throw "Ticker is empty";
	}
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
	var layout = {
		autosize: false,
		width: 500,
		height: 500,
	};

	$.ajax(requestConfig).then(function (responseMessage) {
		Plotly.newPlot("graph", responseMessage.chart, layout);
	});
});
