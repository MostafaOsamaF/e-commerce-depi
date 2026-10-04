document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const alertMsg = document.getElementById('alertMsg');

    // إظهار رسالة النجاح
    alertMsg.style.display = 'block';
    alertMsg.innerText = `Thank you ${name}, your message has been sent successfully!`;

    // تفريغ النموذج
    this.reset();

    // إخفاء الرسالة بعد 4 ثوانٍ
    setTimeout(() => {
        alertMsg.style.display = 'none';
    }, 4000);
});