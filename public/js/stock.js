const myForm = document.getElementById("search_stock");
const input = document.getElementById("stock_ticker");
const errorContainer = document.getElementById("error_container");
const stockInfo = document.getElementById("stock_info");

const transForm = document.getElementById("transForm");
const shareInput = document.getElementById("amount");
const stockError = document.getElementById("error_container2");

const refreshForm = document.getElementById("refresh");
const temp = document.getElementById("temp_ticker");

if (myForm) {
	myForm.addEventListener("submit", (event) => {
		event.preventDefault();
		if (input.value.trim()) {
			input.value = input.value.trim();
			$.ajax({
				method: "POST",
				url: "/private/find",
				contentType: "application/json",
				data: JSON.stringify({
					stock_ticker: input.value.toUpperCase(),
				}),
			}).then(function (x) {
				if (x.error) {
					errorContainer.hidden = false;
					errorContainer.innerHTML = x.error;
					return;
				}
				errorContainer.hidden = true;
				stockInfo.innerHTML = "";

				let h1 = document.createElement("h1");
				if (!x.stock.name) {
					h1.innerHTML = " (" + x.stock.ticker + ")";
				} else {
					h1.innerHTML = x.stock.name + " (" + x.stock.ticker + ")";
				}
				stockInfo.append(h1);

				let h2 = document.createElement("h2");
				h2.innerHTML = "$" + x.stock.price;
				h2.id = "price";
				stockInfo.append(h2);
				stockInfo.append(refreshForm);

				let p1 = document.createElement("p");
				p1.innerHTML = "Exchange: " + x.stock.exchange;
				stockInfo.append(p1);

				let p2 = document.createElement("p");
				p2.innerHTML = "Industry: " + x.stock.industry;
				stockInfo.append(p2);

				let p3 = document.createElement("p");
				if (x.stock.range52W.high != "N/A") {
					p3.innerHTML = "52 Week High: $" + x.stock.range52W.high;
				} else {
					p3.innerHTML = "52 Week High: " + x.stock.range52W.high;
				}
				p3.id = "52high";
				stockInfo.append(p3);

				let p4 = document.createElement("p");
				if (x.stock.range52W.low != "N/A") {
					p4.innerHTML = "52 Week Low: $" + x.stock.range52W.low;
				} else {
					p4.innerHTML = "52 Week Low: " + x.stock.range52W.low;
				}
				p4.id = "52low";
				stockInfo.append(p4);

				let p5 = document.createElement("p");
				p5.innerHTML = "Volume: " + x.stock.volume;
				p5.id = "volume";
				stockInfo.append(p5);

				$("#temp_ticker").attr("value", x.stock.ticker);
				myForm.reset();
			});
		} else {
			errorContainer.hidden = false;
			errorContainer.innerHTML = "Please input a ticker";
		}
	});
}

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
					errorContainer.hidden = false;
					errorContainer.innerHTML = x.error;
					return;
				}
				errorContainer.hidden = true;
				const price = document.getElementById("price");
				if (price != x.stock.price) {
					console.log("This is price: " + price.innerHTML.substring(1));
					console.log("This is new price: " + x.stock.price);
					console.log(price.innerHTML.substring(1) == x.stock.price);
					if (price.innerHTML.substring(1) < x.stock.price) {
						price.className = "up";
					} else if (price.innerHTML.substring(1) == x.stock.price) {
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
				$("#temp_ticker").attr("value", x.stock.ticker);

				refreshForm.reset();
			});
		} else {
			errorContainer.hidden = false;
			errorContainer.innerHTML = "Please input a ticker";
		}
	});
}

if (transForm) {
	transForm.addEventListener("submit", (event) => {
		event.preventDefault();
		transaction = $("input[name=transaction]:checked").val();
		if (!transaction) {
			stockError.hidden = false;
		}
		if (shareInput.value) {
			console.log(shareInput.value);
		}
	});
}
