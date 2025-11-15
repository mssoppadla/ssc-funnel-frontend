document.getElementById("registration-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const response = await fetch("https://your-backend-domain.com/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 499 }),
  });

  const order = await response.json();

  const options = {
    key: "YOUR_PUBLIC_RAZORPAY_KEY", // Replace with your Razorpay public key
    amount: order.amount,
    currency: order.currency,
    name: "SSC Exam Registration",
    description: "Secure your SSC exam seat",
    order_id: order.id,
    handler: function (response) {
      alert("Payment successful! Razorpay ID: " + response.razorpay_payment_id);
    },
    prefill: { name, email, contact: phone },
    theme: { color: "#004080" },
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
