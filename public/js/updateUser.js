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
		$("#errors_div").hide();
		$("#errors_div").html("");

		let errorText = "";
		if (email) {
			let pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
			if (!pattern.test(email)) {
				errorText.concat("Email is not valid\n");
				$("#errors_div").html(
					$("#errors_div").text() + "<br />Email is not valid"
				);
				emailInput.focus();
				errors = true;
			}
		}

		if (password || cpassword) {
			if (password != cpassword) {
				$("#errors_div").html(
					$("#errors_div").text() + "<br />Passwords do not match"
				);
				passwordInput.focus();
				errors = true;
			}
		}
		if (
			!firstName &&
			!lastName &&
			!email &&
			!password &&
			!cpassword &&
			!age &&
			!cash
		) {
			$("#errors_div").html(
				$("#errors_div").text() + "<br />You must update at least one field"
			);
			errors = true;
		}
		if (!errors) {
			updateForm.off().submit();
		} else {
			$("#errors_div").show();
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
