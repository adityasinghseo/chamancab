export async function sendBookingConfirmationSMS(phone, referenceId) {
  if (!phone || phone.length < 10) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  try {
    const textToMatchDLT = `Thank you for your ordering from Chaman Cab. Your order id #${referenceId} has been confirmed successfully. -Smsindiahub`;
    const apiKey = "XM6YRLPJck6zJSxot6mZMg";
    
    const url = new URL("https://cloud.smsindiahub.in/api/mt/SendSMS");
    url.searchParams.append("APIKey", apiKey);
    url.searchParams.append("senderid", "SMSHUB");
    url.searchParams.append("channel", "Trans");
    url.searchParams.append("DCS", "0");
    url.searchParams.append("flashsms", "0");
    url.searchParams.append("number", formattedPhone);
    url.searchParams.append("text", textToMatchDLT);
    url.searchParams.append("DLTTemplateId", "1007886012910188821");
    url.searchParams.append("route", "0");
    url.searchParams.append("PEId", "1701158019630577568");

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      console.error("SMS API Error with status:", response.status);
    }
  } catch (error) {
    console.error("sendBookingConfirmationSMS error:", error);
  }
}
