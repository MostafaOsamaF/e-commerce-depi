var USERS_KEY = 'ecommerce_users';
var SESSION_KEY = 'ecommerce_current_user';

var REGEX = {
    name: /^[A-Za-z\u0600-\u06FF]+(?:[ '-][A-Za-z\u0600-\u06FF]+){0,4}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^01[0125][0-9]{8}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
};

// مستخدمين تجريبيين افتراضيين مطابقين لملف users.json لسهولة التجربة
var DEFAULT_USERS = [
    {
        id: 1,
        name: "Ahmed Mohamed",
        email: "test@example.com",
        phone: "01012345678",
        passwordHash: "008c70392e3abfbd0fa47bbc2ed96aa99bd49e159727fcba0f2e6abeb3a9d601" // Password123
    },
    {
        id: 2,
        name: "Sara Ali",
        email: "user@example.com",
        phone: "01123456789",
        passwordHash: "008c70392e3abfbd0fa47bbc2ed96aa99bd49e159727fcba0f2e6abeb3a9d601" // Password123
    }
];

// تهيئة المستخدمين من LocalStorage أو users.json / DEFAULT_USERS
function initUsers() {
    var stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
        if (window.location.protocol.startsWith('http')) {
            fetch('users.json')
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (Array.isArray(data) && data.length > 0 && !localStorage.getItem(USERS_KEY)) {
                        saveUsers(data);
                    }
                })
                .catch(function() {
                    if (!localStorage.getItem(USERS_KEY)) {
                        saveUsers(DEFAULT_USERS);
                    }
                });
        } else {
            saveUsers(DEFAULT_USERS);
        }
    }
}
initUsers();

function getUsers() {
    try {
        var stored = JSON.parse(localStorage.getItem(USERS_KEY));
        if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
}

function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'Login.html';
}

function hashText(text) {
    var encoder = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", encoder).then(function(hashBuffer) {
        return Array.from(new Uint8Array(hashBuffer)).map(function(b) {
            return b.toString(16).padStart(2, '0');
        }).join("");
    });
}

function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    if (message) {
        inputEl.classList.add('invalid');
        errorEl.textContent = message;
    } else {
        inputEl.classList.remove('invalid');
        errorEl.innerHTML = '';
    }
}

// استخراج صفحة الرجوع (مثل checkout.html) من رابط الصفحة أو الـ sessionStorage
function getAuthRedirect() {
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get('redirect');
    if (redirect) return redirect;
    return sessionStorage.getItem('auth_redirect') || null;
}

function setAuthRedirect(url) {
    if (url) {
        sessionStorage.setItem('auth_redirect', url);
    }
}

function clearAuthRedirect() {
    sessionStorage.removeItem('auth_redirect');
}

// تحديث روابط الانتقال بين تسجيل الدخول وإنشاء حساب للحفاظ على صفحة الرجوع
function updateAuthSwitchLinks() {
    var redirect = getAuthRedirect();
    if (!redirect) return;

    var switchLinks = document.querySelectorAll('.switch_auth a');
    switchLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.indexOf('redirect=') === -1) {
            var sep = href.indexOf('?') === -1 ? '?' : '&';
            link.setAttribute('href', href + sep + 'redirect=' + encodeURIComponent(redirect));
        }
    });

    var headerAuthLinks = document.querySelectorAll('.login_signup a');
    headerAuthLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.indexOf('redirect=') === -1 && href !== '#') {
            var sep = href.indexOf('?') === -1 ? '?' : '&';
            link.setAttribute('href', href + sep + 'redirect=' + encodeURIComponent(redirect));
        }
    });
}

// عرض حالة تسجيل الدخول في الهيدر (اسم المستخدم وزر تسجيل الخروج)
function renderAuthState() {
    var box = document.querySelector('.login_signup');
    if (!box) return;

    var user = getCurrentUser();
    if (!user) return;

    box.innerHTML = `
        <span class="btn" style="cursor:default;">
            <i class="fa-solid fa-circle-user"></i> Hi, ${user.name.split(" ")[0]}
        </span>
        <a href="#" id="logoutBtn" class="btn">
            Logout <i class="fa-solid fa-right-from-bracket"></i>
        </a>
    `;

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }
}

renderAuthState();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthSwitchLinks);
} else {
    updateAuthSwitchLinks();
}

// إذا كان المستخدم مسجل بالفعل ودخل صفحة Login أو SignUp، يتم توجيهه مباشرة
var page = document.body.getAttribute('data-page');
if ((page === 'login' || page === 'signup') && getCurrentUser()) {
    var target = getAuthRedirect() || 'index.html';
    clearAuthRedirect();
    window.location.href = target;
}
