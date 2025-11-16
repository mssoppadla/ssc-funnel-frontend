document.getElementById("registration-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  console.log("📨 Submitting registration for:", { name, email, phone });

  try {
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
              // Decrease seat count
              const seatCount = document.getElementById("seat-count");
              let currentSeats = parseInt(seatCount.textContent, 10);
              if (currentSeats > 1) {
                seatCount.textContent = currentSeats - 1;
              } else {
                seatCount.textContent = "0";
              }
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

// Countdown timer
const countdownElement = document.getElementById("countdown");
const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

function updateCountdown() {
  const now = new Date();
  const diff = deadline - now;

  if (diff <= 0) {
    countdownElement.textContent = "00:00:00";
    return;
  }

  const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
  const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateCountdown, 1000);
