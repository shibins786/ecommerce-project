// =========================
// FORMAT PRICE (SAFE)
// =========================
export const formatPrice = (price) => {
  const num = Number(price);

  if (!price || isNaN(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

// =========================
// FORMAT DATE (SAFE)
// =========================
export const formatDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "Invalid date";

  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =========================
// FORMAT STATUS TEXT
// =========================
export const formatText = (text) => {
  if (!text) return "";
  return String(text).replaceAll("_", " ").toUpperCase();
};

// =========================
// CAPITALIZE FIRST LETTER
// =========================
export const capitalize = (text) => {
  if (!text) return "";
  const str = String(text);
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// =========================
// CALCULATE TOTAL PRICE (SAFE)
// =========================
export const calculateTotal = (items = []) => {
  return items.reduce((total, item) => {
    const price = Number(item?.product_price || item?.product?.price || 0);
    const qty = Number(item?.quantity || 0);

    return total + price * qty;
  }, 0);
};