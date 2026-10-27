async function testResend() {
  const apiKey = (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || "").trim();
  const rawFrom = process.env.EMAIL_FROM || "Daranga Villas <reservations@darangavillas.com>";
  const from = rawFrom.replace(/^["']|["']$/g, "").trim();
  const to = process.env.BOOKING_NOTIFICATION_EMAIL || "Darangavillas@gmail.com";

  console.log("-----------------------------------------");
  console.log("Resend Diagnostic Test");
  console.log("-----------------------------------------");
  console.log("RESEND_API_KEY present:", Boolean(apiKey));
  if (apiKey) {
    console.log("API Key preview:", apiKey.slice(0, 7) + "..." + apiKey.slice(-4));
  } else {
    console.log("⚠️ RESEND_API_KEY is EMPTY in .env.local!");
  }
  console.log("EMAIL_FROM:", from);
  console.log("Target Email (To):", to);
  console.log("-----------------------------------------");

  if (!apiKey) {
    console.error("❌ Cannot send live email: RESEND_API_KEY is not defined in .env.local.");
    process.exit(1);
  }

  try {
    console.log("Sending test email via Resend API...");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Daranga Villa — Email Delivery Test",
        html: "<p>This is a test notification email from Daranga Villa server.</p>",
      }),
    });

    const data = await response.json();
    console.log("HTTP Status:", response.status);
    console.log("Resend Response Body:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ SUCCESS! Test email dispatched successfully. ID:", data.id);
    } else {
      console.error("❌ FAILED! Resend returned an error:", data.message || data);
    }
  } catch (err: unknown) {
    console.error("❌ Network Exception:", err instanceof Error ? err.message : err);
  }
}

testResend();
