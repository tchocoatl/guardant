function normalizeAffirmativeList_(value, noSentinels) {
  // value can be array, string, null/undefined
  var arr = Array.isArray(value) ? value : (value ? [String(value)] : []);
  var sentinels = (noSentinels || []).map(function(s) { return String(s).trim().toLowerCase(); });

  return arr
    .map(function(x) { return String(x || "").trim(); })
    .filter(function(x) { return x.length > 0; })
    .filter(function(x) {
      var lower = x.toLowerCase();
      // filter out "no/none" sentinel entries
      return sentinels.indexOf(lower) === -1;
    });
}

function buildPlainTextEmail_(data, displayTime) {
  var flavors = normalizeAffirmativeList_(data.flavors, [
    "No Flavors or Add-ons",
    "No Flavors",
    "None"
  ]);

  var toppings = normalizeAffirmativeList_(data.toppings, [
    "No Toppings",
    "None"
  ]);

  var body = "Hello " + (data.name || "") + ",\n\n"
    + "Your order is being prepared and will be ready at the time you selected. See you soon!\n\n"
    + "Order Details:\n"
    + "- Temperature: " + (data.temperature || "") + "\n"
    + "- Caffeination: " + (data.caffeination || "") + "\n"
    + "- Beverage: " + (data.beverage || "") + "\n"
    + "- Style: " + (data.style || "") + "\n"
    + "- Item: " + (data.item || "") + "\n"
    + "- Milk: " + (data.milk || "");

  if (flavors.length) {
    body += "\n- Flavors: " + flavors.join(", ");
  }
  if (toppings.length) {
    body += "\n- Toppings: " + toppings.join(", ");
  }
  if (data.specialInstructions) {
    body += "\n- Special Instructions: " + data.specialInstructions;
  }

  body += "\n\nPick-up Time: " + (displayTime || "") + "\n\nGoldfish Coffee";
  return body;
}

function buildHtmlEmail_(data, displayTime) {
  var flavors = normalizeAffirmativeList_(data.flavors, [
    "No Flavors or Add-ons",
    "No Flavors",
    "None"
  ]);

  var toppings = normalizeAffirmativeList_(data.toppings, [
    "No Toppings",
    "None"
  ]);

  var flavorsHtml = flavors.length
    ? "<div class=\"detail-item\"><span class=\"label\">Flavors:</span> " + escapeHtml_(flavors.join(", ")) + "</div>"
    : "";

  var toppingsHtml = toppings.length
    ? "<div class=\"detail-item\"><span class=\"label\">Toppings:</span> " + escapeHtml_(toppings.join(", ")) + "</div>"
    : "";

  var specialHtml = data.specialInstructions
    ? "<div class=\"detail-item\"><span class=\"label\">Special Instructions:</span> " + escapeHtml_(data.specialInstructions) + "</div>"
    : "";

  return ""
    + "<html>"
    + "  <head>"
    + "    <style>"
    + "      body { font-family: Arial, sans-serif; color: #333; }"
    + "      .container { max-width: 600px; margin: 0 auto; padding: 20px; }"
    + "      .header { background-color: #8B4513; color: white; padding: 20px; border-radius: 8px; text-align: center; }"
    + "      .content { margin: 20px 0; }"
    + "      .order-details { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #D2691E; margin: 15px 0; }"
    + "      .detail-item { margin: 8px 0; }"
    + "      .label { font-weight: bold; color: #8B4513; }"
    + "      .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }"
    + "    </style>"
    + "  </head>"
    + "  <body>"
    + "    <div class=\"container\">"
    + "      <div class=\"header\">"
    + "        <h1>\u2615 Order Confirmation</h1>"
    + "      </div>"
    + "      <div class=\"content\">"
    + "        <p>Hello <strong>" + escapeHtml_(data.name || "") + "</strong>,</p>"
    + "        <p>Your order is being prepared and will be ready at the time you selected. See you soon!</p>"
    + "        <div class=\"order-details\">"
    + "          <div class=\"detail-item\"><span class=\"label\">Temperature:</span> " + escapeHtml_(data.temperature || "") + "</div>"
    + "          <div class=\"detail-item\"><span class=\"label\">Caffeination:</span> " + escapeHtml_(data.caffeination || "") + "</div>"
    + "          <div class=\"detail-item\"><span class=\"label\">Beverage:</span> " + escapeHtml_(data.beverage || "") + "</div>"
    + "          <div class=\"detail-item\"><span class=\"label\">Style:</span> " + escapeHtml_(data.style || "") + "</div>"
    + "          <div class=\"detail-item\"><span class=\"label\">Item:</span> " + escapeHtml_(data.item || "") + "</div>"
    + "          <div class=\"detail-item\"><span class=\"label\">Milk:</span> " + escapeHtml_(data.milk || "") + "</div>"
    +            flavorsHtml
    +            toppingsHtml
    +            specialHtml
    + "          <div class=\"detail-item\"><span class=\"label\">Pick-up Time:</span> <strong>" + escapeHtml_(displayTime || "") + "</strong></div>"
    + "        </div>"
    + "      </div>"
    + "      <div class=\"footer\">"
    + "        <p>Goldfish Coffee | Questions? Reply to this email</p>"
    + "      </div>"
    + "    </div>"
    + "  </body>"
    + "</html>";
}