var loginForm = document.getElementById("loginForm");

if (loginForm) {
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var emailError = document.getElementById("emailError");
    var passwordError = document.getElementById("passwordError");
    var formMessage = document.getElementById("formMessage");

    // التحقق مما إذا كان المستخدم محولاً من صفحة الـ checkout
    var redirectUrl = (typeof getAuthRedirect === 'function') ? getAuthRedirect() : null;

    if (redirectUrl && !sessionStorage.getItem('signupSuccess')) {
        formMessage.textContent = 'Please log in to complete your checkout and place your order.';
        formMessage.classList.add('info');
    }

    // إذا كان المستخدم قادماً بعد إنشاء حساب جديد
    if (sessionStorage.getItem('signupSuccess')) {
        var prefillEmail = sessionStorage.getItem('signupEmail');
        if (prefillEmail && emailInput) {
            emailInput.value = prefillEmail;
        }
        formMessage.textContent = 'Signup successful! Please log in to continue.';
        formMessage.classList.add('success');
        sessionStorage.removeItem('signupSuccess');
        sessionStorage.removeItem('signupEmail');
    }

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        formMessage.innerHTML = "";
        formMessage.className = "form_message";

        var isValid = true;

        if (!REGEX.email.test(emailInput.value.trim())) {
            setFieldError(emailInput, emailError, "Please enter a valid email address.");
            isValid = false;
        } else {
            setFieldError(emailInput, emailError, "");
        }

        if (passwordInput.value.length === 0) {
            setFieldError(passwordInput, passwordError, "Password cannot be empty.");
            isValid = false;
        } else {
            setFieldError(passwordInput, passwordError, "");
        }

        if (!isValid) return;

        var email = emailInput.value.trim().toLowerCase();
        var users = getUsers();
        var user = users.find(function(u) { return u.email.toLowerCase() === email; });

        if (!user) {
            formMessage.innerHTML = "No account found with this email. Please sign up first.";
            formMessage.classList.add("error");
            return;
        }

        hashText(passwordInput.value).then(function(enteredHash) {
            if (enteredHash !== user.passwordHash) {
                formMessage.innerHTML = "Incorrect password. Please try again.";
                formMessage.classList.add("error");
                return;
            }

            // حفظ المستخدم المسجل في LocalStorage
            setCurrentUser({ id: user.id, name: user.name, email: user.email });

            // الرجوع لصفحة checkout إذا كان محولاً منها أو الصفحة الرئيسية
            var target = (typeof getAuthRedirect === 'function') ? getAuthRedirect() : null;
            if (typeof clearAuthRedirect === 'function') {
                clearAuthRedirect();
            }

            window.location.href = target || "index.html";
        });
    });
}