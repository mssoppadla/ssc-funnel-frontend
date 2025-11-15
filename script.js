const API_BASE = "https://ssc-funnel-backend.onrender.com";

document.getElementById("leadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const planId = document.getElementById("plan").value;

  try {
    // Step 1: Create lead
    const resp = await fetch('${API_BASE}/api/lead', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, planId })
    });
    const leadData = await resp.json();

    // Step 2: Create order
    const orderResp = await fetch('${API_BASE}/api/create-order', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: leadData.leadId, planId })
    });
    const orderData = await orderResp.json();

    // Step 3: Razorpay checkout
    const options = {
      key: "rzp_test_Rfwa4UUvpKaJad", // replace with your Razorpay test key
      amount: orderData.amount,
      currency: "INR",
      name: "SSC Funnel",
      description: 'Plan: ${planId}',
      order_id: orderData.id,
      handler: function (response) {
        alert("Payment successful! Payment ID: " + response.razorpaypaymentid);
      },
      prefill: { name, email, contact: phone },
      theme: { color: "#3399cc" }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong. Please try again.");
  }
});
