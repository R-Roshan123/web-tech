
// GET FORM ELEMENTS

const form = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const courseInput = document.getElementById("course");


// FUNCTION 1: CHECK EMPTY VALUE

function isEmpty(value) {
    return value.trim() === "";
}


// FUNCTION 2: VALIDATE EMAIL

function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}


// FUNCTION 3: VALIDATE PASSWORD

function isStrongPassword(password) {
    return password.length >= 8;
}


// FUNCTION 4: SHOW ERROR

function showError(id, message) {
    document.getElementById(id).textContent = message;
}


// FUNCTION 5: CLEAR ERRORS

function clearErrors() {

    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passError").textContent = "";
    document.getElementById("courseError").textContent = "";

    document.querySelectorAll("input").forEach(function(input) {
        input.classList.remove("valid", "invalid");
    });

    document.getElementById("result").textContent = "";
    document.getElementById("result").className = "";
}


// FUNCTION 6: VALIDATE FORM

function validateForm() {

    let valid = true;

    clearErrors();

    // NAME VALIDATION

    const name = nameInput.value.trim();

    if (isEmpty(name)) {
        showError("nameError", "Name is required");
        nameInput.classList.add("invalid");
        valid = false;

    } else if (name.length < 3) {
        showError("nameError", "Enter at least 3 characters");
        nameInput.classList.add("invalid");
        valid = false;

    } else {
        nameInput.classList.add("valid");
    }


    // EMAIL VALIDATION

    const email = emailInput.value.trim();

    if (isEmpty(email)) {
        showError("emailError", "Email is required");
        emailInput.classList.add("invalid");
        valid = false;

    } else if (!isValidEmail(email)) {
        showError("emailError", "Enter a valid email");
        emailInput.classList.add("invalid");
        valid = false;

    } else {
        emailInput.classList.add("valid");
    }


    // PASSWORD VALIDATION

    const password = passwordInput.value;

    if (isEmpty(password)) {
        showError("passError", "Password is required");
        passwordInput.classList.add("invalid");
        valid = false;

    } else if (!isStrongPassword(password)) {
        showError("passError", "Minimum 8 characters required");
        passwordInput.classList.add("invalid");
        valid = false;

    } else {
        passwordInput.classList.add("valid");
    }


    // COURSE VALIDATION

    if (isEmpty(courseInput.value)) {
        showError("courseError", "Please select a course");
        valid = false;
    }

    return valid;
}


// FORM SUBMISSION

form.addEventListener("submit", function(event) {

        const result = document.getElementById("result");

        result.textContent =
            "Registration Successful! Welcome to LearnSphere.";

        result.className = "success";

        form.reset();

    }

}
);
