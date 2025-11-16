document.getElementById("registration-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  console.log("📨 Submitting registration for:", { name, email, phone });

  try {
    // ✅ Step 1: Register user (non-blocking email trigger)
    const registerRes = await fetch("https://ssc-funnel-backend-1.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });

    console.log("✅ /register response:", registerRes.status);
    if (!registerRes.ok) {
      const errorText = await registerRes.text();
      console.error("❌ Registration failed:", errorText);
      alert("Registration failed. Please try again.");
      return;
    }

    // ✅ Step 2: Create Razorpay order
    console.log("💰 Creating Razorpay order...");
    const orderResponse = await fetch("https://ssc-funnel-backend-1.onrender.com/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 499 }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("❌ Order creation failed:", errorText);
      alert("Unable to create payment order. Please try again.");
      return;
    }

    const order = await orderResponse.json();
    console.log("✅ Razorpay order created:", order);

    // ✅ Step 3: Launch Razorpay
    const options = {
      key: "rzp_test_Rfwa4UUvpKaJad",
      amount: order.amount,
      currency: order.currency,
      name: "SSC Exam Coaching Registration",
      description: "Secure your SSC exam Coaching seat",
      order_id: order.id,
      handler: function (response) {
        console.log("💸 Payment successful:", response);

        // ✅ Step 4: Confirm payment to backend
        fetch("https://ssc-funnel-backend-1.onrender.com/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            name,
            email,
          }),
        })
          .then((res) => {
            if (res.ok) {
              console.log("✅ Payment verification sent to backend");
            } else {
              console.error("❌ Payment verification failed:", res.status);
            }
          })
          .catch((err) => {
            console.error("❌ Error sending payment verification:", err);
          });

        alert("Payment successful! Razorpay ID: " + response.razorpay_payment_id);
      },
      prefill: { name, email, contact: phone },
      theme: { color: "#004080" },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("❌ Unexpected error during registration/payment:", err);
    alert("Something went wrong. Please try again.");
  }
});
