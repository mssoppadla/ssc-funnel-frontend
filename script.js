document.getElementById("registration-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  console.log("📨 Submitting registration for:", { name, email, phone });

  try {
    // 🔁 Run both requests in parallel
    const [registerResult, orderResult] = await Promise.allSettled([
      fetch("https://ssc-funnel-backend-1.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      }),
      fetch("https://ssc-funnel-backend-1.onrender.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 12999 }),
      }),
    ]);

    // ✅ Handle /register (non-blocking)
    if (registerResult.status === "fulfilled") {
      console.log("✅ /register response:", registerResult.value.status);
      if (!registerResult.value.ok) {
        const errorText = await registerResult.value.text();
        console.warn("⚠️ Registration failed (email may not be sent):", errorText);
      }
    } else {
      console.warn("⚠️ /register request failed:", registerResult.reason);
    }

    // ❌ Block if order creation failed
    if (orderResult.status !== "fulfilled" || !orderResult.value.ok) {
      const errorText = orderResult.status === "fulfilled"
        ? await orderResult.value.text()
        : orderResult.reason;
      console.error("❌ Order creation failed:", errorText);
      alert("Unable to create payment order. Please try again.");
      return;
    }

    const order = await orderResult.value.json();
    console.log("✅ Razorpay order created:", order);

    const options = {
      key: "rzp_test_Rfwa4UUvpKaJad",
      amount: order.amount,
      currency: order.currency,
      name: "SSC Exam Coaching Registration",
      description: "Secure your SSC exam Coaching seat",
      order_id: order.id,
      handler: function (response) {
        console.log("💸 Payment successful:", response);

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
              const seatCount = document.getElementById("seat-count");
              let currentSeats = parseInt(seatCount.textContent, 10);
              seatCount.textContent = currentSeats > 1 ? currentSeats - 1 : "0";
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
