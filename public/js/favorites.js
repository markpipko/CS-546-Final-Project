var nav = document.querySelector("nav")
var main = document.querySelector("main")
//var remove = document.getElementById("")

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
(function($) {
	var favs = $("#favs")

function bindEvents(element, link) {
	element.click( function(event) {
		event.preventDefault();
		var requestConfig = {
			method: 'DELETE',
			url: `/private/favorites/${link}`
		};
		
		$.ajax(requestConfig).then(function(responseMessage) {
			$(`#${link}1`).remove()
			$(`#${link}`).remove()
	})
})}

$(document).ready(function() {
	var requestConfig = {
		method: 'POST',
		url: `/private/getFavorites`
	};

	$.ajax(requestConfig).then(function(responseMessage) {
		var favoritesArr = responseMessage.favList
		if(favoritesArr.length == 0){
			favs.append(`<li>No Favorites</li>`)
		}
		else{
			for(var i = 0; i < favoritesArr.length; i++){
				var element = $(`<p id="${favoritesArr[i]}1">Stock: <a href="/private/stocks/${favoritesArr[i]}">${favoritesArr[i]}</a></p>`)
				favs.append(element)
				element = $(`<button id="${favoritesArr[i]}">Remove From Favorites</button>`)
				bindEvents(element, favoritesArr[i])
				favs.append(element)
				element = $(`<br />`)
				favs.append(element)
			}
		}
	});   
})
})(window.jQuery);