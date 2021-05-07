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