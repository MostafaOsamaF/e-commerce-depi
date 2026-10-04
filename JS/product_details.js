// قراءة ID المنتج من الـ URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// جلب البيانات من products.json
fetch('products.json')
    .then(response => response.json())
    .then(products => {
        const product = products.find(p => p.id == productId);
        const container = document.getElementById('product-detail-content');

        if (product) {
            // حساب السعر القديم والخصم لو موجودين
            const oldPrice = product.old_price ? `<span style="text-decoration: line-through; color: #888; font-size: 18px; margin-left: 10px;">$${product.old_price}</span>` : '';
            const discountBadge = product.old_price ? `<span style="background: #cc0c39; color: white; padding: 4px 8px; font-size: 12px; font-weight: bold; border-radius: 3px;">Save ${Math.floor((product.old_price - product.price) / product.old_price * 100)}%</span>` : '';

            container.innerHTML = `
                <!-- قسم الصورة -->
                <div style="flex: 1; min-width: 320px; max-width: 450px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; border: 1px solid #eee;">
                    <img src="${product.img}" alt="${product.name}" style="width: 100%; max-height: 380px; object-fit: contain; border-radius: 8px;">
                </div>

                <!-- قسم التفاصيل -->
                <div style="flex: 1.2; min-width: 320px; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee;">
                    
                    <span style="background: #e7f4f5; color: #007185; padding: 4px 10px; border-radius: 15px; font-size: 13px; font-weight: bold; text-transform: uppercase;">
                        ${product.catetory || 'Electronics'}
                    </span>

                    <h1 style="font-size: 26px; font-weight: 700; color: #0f1111; margin: 12px 0 8px 0; line-height: 1.3;">
                        ${product.name}
                    </h1>

                    <!-- النجوم والتقييم -->
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                        <div style="color: #ffa41c; font-size: 15px;">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star-half-stroke"></i>
                        </div>
                        <span style="color: #007185; font-size: 14px; font-weight: 500;">4.5 (128 reviews)</span>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #e7e7e7; margin: 15px 0;">

                    <!-- السعر والخصم -->
                    <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 15px;">
                        <span style="font-size: 32px; color: #0f1111; font-weight: 800;">$${product.price}</span>
                        ${oldPrice}
                        ${discountBadge}
                    </div>

                    <p style="color: #333; line-height: 1.6; font-size: 15px; margin-bottom: 20px;">
                        ${product.description || 'High performance printer with reliable speed and high efficiency, designed for homes, retail, and office setups.'}
                    </p>

                    <!-- مميزات سريعة -->
                    <ul style="list-style: none; padding: 0; margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; color: #565959;">
                        <li><i class="fa-solid fa-circle-check" style="color: #007185; margin-right: 6px;"></i> Fast Printing Speed</li>
                        <li><i class="fa-solid fa-truck-fast" style="color: #007185; margin-right: 6px;"></i> Free Shipping</li>
                        <li><i class="fa-solid fa-shield-halved" style="color: #007185; margin-right: 6px;"></i> 1 Year Warranty</li>
                        <li><i class="fa-solid fa-rotate-left" style="color: #007185; margin-right: 6px;"></i> 30-Day Return</li>
                    </ul>

                    <!-- تفعيل الأزرار -->
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <button onclick="addToCart(${product.id})" style="flex: 1; min-width: 180px; padding: 14px; background: #ffd814; border: 1px solid #fcd200; border-radius: 25px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 15px; color: #0f1111; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                        </button>
                        
                        <button onclick="buyNow(${product.id})" style="padding: 14px 20px; background: #ffa41c; border: 1px solid #ff8f00; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 15px; color: #0f1111;">
                            Buy Now
                        </button>
                    </div>

                </div>
            `;
        } else {
            container.innerHTML = '<h2 style="text-align: center; width: 100%;">Product not found!</h2>';
        }
    })
    .catch(error => console.error('Error loading product details:', error));

// 1. دالة إضافة المنتج إلى السلة مع حفظ البيانات كاملة
function addToCart(id) {
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == id);
            if (!product) return;

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingIndex = cart.findIndex(item => item.id == id);

            if (existingIndex !== -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
            } else {
                // حفظ كائن المنتج كاملاً لحل مشكلة undefined
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    img: product.img,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            // تغيير شكل الزرار لتأكيد الإضافة
            const cartBtn = document.querySelector('button[onclick^="addToCart"]');
            if (cartBtn) {
                cartBtn.style.background = '#28a745';
                cartBtn.style.color = '#ffffff';
                cartBtn.style.borderColor = '#28a745';
                cartBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added to Cart!';
                
                setTimeout(() => {
                    cartBtn.style.background = '#ffd814';
                    cartBtn.style.color = '#0f1111';
                    cartBtn.style.borderColor = '#fcd200';
                    cartBtn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Add to Cart';
                }, 2000);
            }
        });
}

// 2. دالة Buy Now لإضافة المنتج والتوجيه الفوري لصفحة checkout.html
function buyNow(id) {
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == id);
            if (!product) return;

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingIndex = cart.findIndex(item => item.id == id);

            if (existingIndex === -1) {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    img: product.img,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        });
}