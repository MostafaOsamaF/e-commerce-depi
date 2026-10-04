let category_nav_list = document.querySelector(".category_nav_list");

function Open_Categ_list(){
    category_nav_list.classList.toggle("active")

}

let nav_links = document.querySelector(".nav_links")

function open_Menu() {
    nav_links.classList.toggle("active")
}


var cart = document.querySelector('.cart');

function open_close_cart() {
    cart.classList.toggle("active")
}

fetch('products.json')
.then(response => response.json())
.then(data => {
    
    const addToCartButtons = document.querySelectorAll(".btn_add_cart")

    addToCartButtons.forEach(button =>{
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute('data-id')
            const selcetedProduct = data.find(product => product.id == productId)
            

            addToCart(selcetedProduct)

            const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)

            allMatchingButtons.forEach(btn =>{
                btn.classList.add("active")
                btn.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> Item in cart`
            })
        })
    })
    
    
})


function addToCart(product) {

    let cart = JSON.parse(localStorage.getItem('cart')) || []

    cart.push({... product , quantity: 1})
    localStorage.setItem('cart' , JSON.stringify(cart))


    updateCart()
}



function updateCart() {
    const cartItemsContainer = document.getElementById("cart_items");
    const checkoutItemsContainer = document.getElementById("checkout_items");
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    var total_Price = 0;
    var total_count = 0;

    if (cartItemsContainer) cartItemsContainer.innerHTML = "";
    if (checkoutItemsContainer) checkoutItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 30px 10px; color: #777;">Your cart is empty.</p>';
        }
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = '<p style="text-align:center; padding: 40px 10px; color: #777; font-size: 16px;">Your cart is empty. <a href="index.html" style="color: var(--main_color); font-weight: bold; text-decoration: underline;">Start Shopping</a></p>';
        }
    }

    cart.forEach((item, index) => {
        let total_Price_item = item.price * item.quantity;
        total_Price += total_Price_item;
        total_count += item.quantity;

        // 1. رسم المنتجات في السلة الجانبية Drawer
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML += `
                <div class="item_cart">
                    <img src="${item.img}" alt="">
                    <div class="content">
                        <h4>${item.name}</h4>
                        <p class="price_cart">$${total_Price_item}</p>
                        <div class="quantity_control">
                            <button class="decrease_quantity" data-index="${index}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="Increase_quantity" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="delete_item" data-inex="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }

        // 2. رسم المنتجات في صفحة Checkout
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML += `
                <div class="item_cart">
                    <div class="image_name">
                        <img src="${item.img}" alt="">
                        <div class="content">
                            <h4>${item.name}</h4>
                            <p class="price_cart">$${item.price}</p>
                            <div class="quantity_control">
                                <button class="decrease_quantity" data-index="${index}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="Increase_quantity" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="delete_item" data-inex="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }
    });

    // تحديث الأرقام والأسعار في الهيدر والسلة
    const price_cart_total = document.querySelectorAll('.price_cart_toral');
    const total_checkout = document.querySelector('.price_cart_total_final');
    const count_item_cart = document.querySelector('.Count_item_cart');
    const count_item_header = document.querySelector('.count_item_header');

    price_cart_total.forEach(el => el.innerHTML = `$${total_Price}`);
    if (total_checkout) total_checkout.innerHTML = `$${total_Price > 0 ? total_Price + 20 : 0}`;
    if (count_item_cart) count_item_cart.innerHTML = total_count;
    if (count_item_header) count_item_header.innerHTML = total_count;

    // إعادة ربط أحداث أزرار الزيادة والنقصان والحذف
    const increaseButtons = document.querySelectorAll(".Increase_quantity");
    const decreaseButtons = document.querySelectorAll(".decrease_quantity");
    const deleteButtons = document.querySelectorAll('.delete_item');

    increaseButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const itemIndex = event.target.getAttribute("data-index");
            increaseQuantity(itemIndex);
        });
    });

    decreaseButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const itemIndex = event.target.getAttribute("data-index");
            decreaseQuantity(itemIndex);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const itemIndex = event.target.closest('button').getAttribute('data-inex');
            removeFromCart(itemIndex);
        });
    });

    // تهيئة حالة تسجيل الدخول وزر الدفع في صفحة Checkout
    setupCheckoutPage();
}

// دالة التحكم في الدفع والتأكد من تسجيل دخول المستخدم في checkout
function setupCheckoutPage() {
    const checkoutAuthStatus = document.getElementById("checkoutAuthStatus");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    if (!placeOrderBtn) return;

    const user = (typeof getCurrentUser === "function") ? getCurrentUser() : null;

    if (checkoutAuthStatus) {
        if (user) {
            checkoutAuthStatus.className = "checkout_auth_banner logged_in";
            checkoutAuthStatus.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <div>
                    <strong>Logged in as ${user.name}</strong> (${user.email})
                    <div style="font-size: 13px; margin-top: 3px; color: #2e7d32;">
                        Your account is verified. You can complete your order now.
                    </div>
                </div>
            `;
            placeOrderBtn.innerHTML = 'Place Order <i class="fa-solid fa-arrow-right"></i>';
        } else {
            checkoutAuthStatus.className = "checkout_auth_banner not_logged_in";
            checkoutAuthStatus.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <div>
                    <strong>You are not logged in!</strong>
                    <div style="font-size: 13px; margin-top: 3px;">
                        Please <a href="Login.html?redirect=checkout.html">Log In</a> or <a href="SignUp.html?redirect=checkout.html">Sign Up</a> to complete your purchase.
                    </div>
                </div>
            `;
            placeOrderBtn.innerHTML = 'Log In to Place Order <i class="fa-solid fa-right-to-bracket"></i>';
        }
    }

    placeOrderBtn.onclick = function (event) {
        event.preventDefault();

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert("Your cart is empty! Please add some products to your cart first.");
            return;
        }

        const currentUser = (typeof getCurrentUser === "function") ? getCurrentUser() : null;

        if (!currentUser) {
            // غير مسجل: حفظ مسار checkout وتوجيهه لتسجيل الدخول
            if (typeof setAuthRedirect === "function") {
                setAuthRedirect("checkout.html");
            } else {
                sessionStorage.setItem("auth_redirect", "checkout.html");
            }
            alert("You need to log in or create an account to complete your checkout. Redirecting to Login...");
            window.location.href = "Login.html?redirect=checkout.html";
            return;
        }

        // مسجل: إكمال الطلب بنجاح والتوجيه لصفحة order_success
        window.location.href = "order_success.html";
    };
}


function increaseQuantity(index){
    let cart = JSON.parse(localStorage.getItem('cart')) || []
    cart[index].quantity += 1
    localStorage.setItem('cart' , JSON.stringify(cart))
    updateCart()
}

function decreaseQuantity(index){
    let cart = JSON.parse(localStorage.getItem('cart')) || []

    if (cart[index].quantity > 1){
        cart[index].quantity -= 1
    }
 
    localStorage.setItem('cart' , JSON.stringify(cart))
    updateCart()
}





function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || []

    const removeProduct = cart.splice(index , 1)[0]
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
    updateButoonsState(removeProduct.id)
}


function updateButoonsState(productId) {
    const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)
    allMatchingButtons.forEach(button =>{
        button.classList.remove('active');
        button.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> add to cart`
    })
}

updateCart()

// إضافة دالة للتحكم في المفضلة
let favDrawer = document.querySelector('.fav_drawer');

function open_close_fav() {
    favDrawer.classList.toggle("active");
}

function setupFavorites(productsData) {
    const favButtons = document.querySelectorAll(".icon_product");
    const countFavHeader = document.querySelector(".count_favourite");
    const countFavDrawer = document.querySelector(".count_favourite_drawer");
    const favItemsContainer = document.getElementById("fav_items");

    // دالة لتحديث عرض منتجات المفضلة داخل الـ Drawer
    const renderFavorites = () => {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        
        if (countFavHeader) countFavHeader.innerHTML = favorites.length;
        if (countFavDrawer) countFavDrawer.innerHTML = favorites.length;

        favItemsContainer.innerHTML = "";

        if (favorites.length === 0) {
            favItemsContainer.innerHTML = `<p style="text-align:center; padding: 20px;">No favorite items yet.</p>`;
            return;
        }

        const favProducts = productsData.filter(product => favorites.includes(product.id.toString()));

        favProducts.forEach(item => {
            favItemsContainer.innerHTML += `
                <div class="item_cart">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="content">
                        <h4>${item.name}</h4>
                        <p class="price_cart">$${item.price}</p>
                    </div>
                    <button class="delete_item remove_fav" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });

        // إتاحة حذف العنصر مباشرة من داخل الـ Drawer
        const removeButtons = favItemsContainer.querySelectorAll(".remove_fav");
        removeButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idToRemove = e.currentTarget.getAttribute("data-id");
                let favs = JSON.parse(localStorage.getItem("favorites")) || [];
                favs = favs.filter(id => id !== idToRemove);
                localStorage.setItem("favorites", JSON.stringify(favs));
                
                // تحديث حالة الأزرار في الصفحة
                const matchingBtn = document.querySelector(`.icon_product[data-id="${idToRemove}"]`);
                if (matchingBtn) {
                    matchingBtn.classList.remove("active");
                    matchingBtn.querySelector("i").className = "fa-regular fa-heart";
                }

                renderFavorites();
            });
        });
    };

    renderFavorites();

    // التبديل عند الضغط على أيقونة القلب على المنتجات
    favButtons.forEach(button => {
        const productId = button.getAttribute("data-id");
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        if (favorites.includes(productId)) {
            button.classList.add("active");
            button.querySelector("i").className = "fa-solid fa-heart";
        }

        button.addEventListener("click", () => {
            let favs = JSON.parse(localStorage.getItem("favorites")) || [];
            const index = favs.indexOf(productId);

            if (index > -1) {
                favs.splice(index, 1);
                button.classList.remove("active");
                button.querySelector("i").className = "fa-regular fa-heart";
            } else {
                favs.push(productId);
                button.classList.add("active");
                button.querySelector("i").className = "fa-solid fa-heart";
            }

            localStorage.setItem("favorites", JSON.stringify(favs));
            renderFavorites();
        });
    });
}

// استدعِ الدالة داخل fetch(products.json) في نهاية الـ then:
fetch('products.json')
.then(response => response.json())
.then(data => {
    // باقي الكود الخاص بك...

    setupFavorites(data);
});

// كود تحويل روابط المنتجات تلقائياً لصفحة التفاصيل بدون تعديل ملف items_home.js
document.addEventListener('click', function (e) {
    // البحث عن أقرب عنصر منتج أو رابط تم الضغط عليه
    const productCard = e.target.closest('.product');
    const clickedLink = e.target.closest('a');
    const isCartBtn = e.target.closest('.btn_add_cart');
    const isHeartBtn = e.target.closest('.icon_product');

    // إذا تم الضغط داخل كارت المنتج ولم يكن الضغط على زر السلة أو المفضلة
    if (productCard && !isCartBtn && !isHeartBtn) {
        // البحث عن id المنتج من زر السلة الموجود داخل الكارت
        const cartBtn = productCard.querySelector('.btn_add_cart');
        if (cartBtn) {
            const productId = cartBtn.getAttribute('data-id');
            if (productId) {
                if (clickedLink) {
                    e.preventDefault(); // إيقاف سلوك الـ # اللي بيطلع لأول الصفحة
                }
                // الانتقال لصفحة التفاصيل مع تمرير id المنتج
                window.location.href = `product_details.html?id=${productId}`;
            }
        }
    }
});

