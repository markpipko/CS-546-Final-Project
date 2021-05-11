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

$("#sign_up_button").click(function () {
	$.blockUI({
		message: "Creating User. Please wait...",
		overlayCSS: { backgroundColor: "#0f0" },
	});
});

$("#delete_button").click(function() {
	var radioValue = $("input[name='deleteUser']:checked").val();
	if (radioValue == "yes") {
		$.blockUI({
			message: "Deleting User. Please wait...",
			overlayCSS: { backgroundColor: "#0f0" },
		});
	}
	else {
		$.blockUI({
			message: "Redirecting back to home page. Please wait...",
			overlayCSS: { backgroundColor: "#0f0" },
		});
	}
});

/*var nav = document.querySelector("nav");
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
	}else{
		nav.className = "navbar navbar-default";
		main.className = "day";
        document.body.style.backgroundColor = "white";
	}
}*/