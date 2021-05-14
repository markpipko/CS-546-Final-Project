(function ($) {
	let errors = false;
	let signupForm = $("#signupForm");
	let firstNameInput = $("#firstName_input_signup");
	let lastNameInput = $("#lastName_input_signup");
	let emailInput = $("#email_input_signup");
	let passwordInput = $("#password_input_signup");
	let ageInput = $("#age_input_signup");
	let cashInput = $("#cash_input_signup");

	signupForm.submit((event) => {
		event.preventDefault();
		errors = false;

		firstNameInput.removeClass("is-invalid is-valid");
		lastNameInput.removeClass("is-invalid is-valid");
		emailInput.removeClass("is-invalid is-valid");
		passwordInput.removeClass("is-invalid is-valid");
		ageInput.removeClass("is-invalid is-valid");
		cashInput.removeClass("is-invalid is-valid");

		$("#sign_up_button").prop("disabled", true);
		let firstName = firstNameInput.val().trim();
		let lastName = lastNameInput.val().trim();
		let email = emailInput.val().trim();
		let password = passwordInput.val();
		let age = ageInput.val().trim();
		let cash = cashInput.val().trim();

		if (!firstName) {
			alert("Please enter your first name");
			firstNameInput.addClass("is-invalid");
			firstNameInput.focus();
			errors = true;
		} else {
			firstNameInput.addClass("is-valid");
		}

		if (!lastName) {
			alert("Please enter your last name");
			lastNameInput.addClass("is-invalid");
			lastNameInput.focus();
			errors = true;
		} else {
			lastNameInput.addClass("is-valid");
		}
		if (!email) {
			alert("Please enter your email");
			emailInput.addClass("is-invalid");
			emailInput.focus();
			errors = true;
		} else {
			let pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
			if (!pattern.test(email)) {
				alert("Email is not valid");
				emailInput.addClass("is-invalid");
				emailInput.focus();
				errors = true;
			} else {
				emailInput.addClass("is-valid");
			}
		}
		if (!password) {
			alert("Please enter your password");
			passwordInput.addClass("is-invalid");
			passwordInput.focus();
			errors = true;
		} else {
			passwordInput.addClass("is-valid");
		}
		if (!age) {
			alert("Please enter your age");
			ageInput.addClass("is-invalid");
			ageInput.focus();
			errors = true;
		} else {
			ageInput.addClass("is-valid");
		}
		if (!cash) {
			alert("Please enter your starting cash");
			cashInput.addClass("is-invalid");
			cashInput.focus();
			errors = true;
		} else {
			cashInput.addClass("is-valid");
		}

		if (!errors) {
			signupForm.off().submit();
		} else {
			$("#sign_up_button").prop("disabled", false);
		}
	});
})(jQuery);
