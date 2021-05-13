(function ($) {
	let errors = false;
	let updateForm = $("#updateForm");
	let firstNameInput = $("#firstName_input_update");
	let lastNameInput = $("#lastName_input_update");
	let emailInput = $("#email_input_update");
	let passwordInput = $("#password_input_update");
	let confirmedPassInput = $("#password_input_confirm");
	let ageInput = $("#age_input_update");
	let cashInput = $("#cash_input_update");

	updateForm.submit((event) => {
		event.preventDefault();
		errors = false;

		$("#update_button").prop("disabled", true);
		let firstName = firstNameInput.val().trim();
		let lastName = lastNameInput.val().trim();
		let email = emailInput.val().trim();
		let password = passwordInput.val();
		let cpassword = confirmedPassInput.val();
		let age = ageInput.val().trim();
		let cash = cashInput.val().trim();

		if (password || cpassword) {
			if (password != cpassword) {
				alert("Passwords do not match");
				passwordInput.focus();
				errors = true;
			}
		}
		if (+age) {
			alert("Only input numbers into age");
			ageInput.focus();
			errors = true;
		}
		if (+cash) {
			alert("Only input numbers into cash");
			errors = true;
			cashInput.focus();
		}
		if (!errors) {
			updateForm.off().submit();
		} else {
			$("#update_button").prop("disabled", false);
		}
	});
})(jQuery);

// $("#update_button").click(function () {
// 	$.blockUI({
// 		message: "Updating. Please wait...",
// 		overlayCSS: { backgroundColor: "#0f0" },
// 	});
// });
