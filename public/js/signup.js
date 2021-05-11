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
		console.log("ths ran");
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
			document.getElementById("firstName_input_signup").style.borderColor =
				"red";
			errors = true;
		} else {
			document.getElementById("firstName_input_signup").style.borderColor =
				"green";
		}

		if (!lastName) {
			alert("Please enter your last name");
			document.getElementById("lastName_input_signup").style.borderColor =
				"red";
			lastNameInput.addClass("is-invalid");
			errors = true;
		} else {
			document.getElementById("lastName_input_signup").style.borderColor =
				"green";
		}
		if (!email) {
			alert("Please enter your email");
			document.getElementById("email_input_signup").style.borderColor = "red";
			emailInput.addClass("is-invalid");
			errors = true;
		} else {
			document.getElementById("email_input_signup").style.borderColor = "green";
		}
		if (!password) {
			alert("Please enter your password");
			passwordInput.addClass("is-invalid");
			document.getElementById("password_input_signup").style.borderColor =
				"red";

			errors = true;
		} else {
			document.getElementById("password_input_signup").style.borderColor =
				"green";
		}
		if (!age) {
			alert("Please enter your age");
			ageInput.addClass("is-invalid");
			document.getElementById("age_input_signup").style.borderColor = "red";
			errors = true;
		} else {
			document.getElementById("age_input_signup").style.borderColor = "green";
		}
		if (!cash) {
			alert("Please enter your starting cash");
			cashInput.addClass("is-invalid");
			document.getElementById("cash_input_signup").style.borderColor = "red";
			errors = true;
		} else {
			document.getElementById("cash_input_signup").style.borderColor = "green";
		}

		if (!errors) {
			signupForm.off().submit();
		} else {
			$("#sign_up_button").prop("disabled", false);
		}
	});
})(jQuery);
