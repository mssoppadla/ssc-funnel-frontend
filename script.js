document.getElementById("registration-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  // ✅ Step 1: Register user (send email + log details)
  await fetch("https://ssc-funnel-backend-1.onrender.com/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone }),
  });

  // ✅ Step 2: Create Razorpay order
  const response = await fetch("https://ssc-funnel-backend-1.onrender.com/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 499 }),
  });

  const order = await response.json();

  const options = {
    key: "rzp_test_Rfwa4UUvpKaJad",
    amount: order.amount,
    currency: order.currency,
    name: "SSC Exam Coaching Registration",
    description: "Secure your SSC exam Coaching seat",
    order_id: order.id,
    handler: function (response) {
      alert("Payment successful! Razorpay ID: " + response.razorpay_payment_id);

      // ✅ Step 3: Confirm payment to backend
      fetch("https://ssc-funnel-backend-1.onrender.com/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: response.razorpay_payment_id,
          name,
          email,
          phone,
        }),
      });
    },
    prefill: { name, email, contact: phone },
    theme: { color: "#004080" },
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
