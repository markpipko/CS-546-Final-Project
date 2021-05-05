$("#login_button").click(function () {
	$.blockUI({
		message: "Authenticating. Please wait...",
		overlayCSS: { backgroundColor: "#0f0" },
	});
});

$("#update_button").click(function () {
	$.blockUI({
		message: "Updating. Please wait...",
		overlayCSS: { backgroundColor: "#0f0" },
	});
});