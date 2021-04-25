const myForm = document.getElementById("search_stock");
const input = document.getElementById("stock_ticker");
const errorContainer = document.getElementById("error_container");
const stockInfo = document.getElementById("stock_info");

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
					stock_ticker: input.value,
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
				h1.innerHTML = x.stock.name + " (" + x.stock.ticker + ")";
				stockInfo.append(h1);

				let h2 = document.createElement("h2");
				h2.innerHTML = "$" + x.stock.price;
				stockInfo.append(h2);

				let p1 = document.createElement("p");
				p1.innerHTML = "Exchange: " + x.stock.exchange;
				stockInfo.append(p1);

				let p2 = document.createElement("p");
				p2.innerHTML = "Industry: " + x.stock.industry;
				stockInfo.append(p2);

				let p3 = document.createElement("p");
				p3.innerHTML = "52 Week High: $" + x.stock.range52W.high;
				stockInfo.append(p3);

				let p4 = document.createElement("p");
				p4.innerHTML = "52 Week Low: $" + x.stock.range52W.low;
				stockInfo.append(p4);

				let p5 = document.createElement("p");
				p5.innerHTML = "Volume: " + x.stock.volume;
				stockInfo.append(p5);
			});
		} else {
			errorContainer.hidden = false;
			errorContainer.innerHTML = "Please input a ticker";
		}
	});
}
