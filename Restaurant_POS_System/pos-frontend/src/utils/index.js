export const getBgColor = () => {
  const bgarr = [
    "#b73e3e",
    "#5b45b0",
    "#7f167f",
    "#735f32",
    "#1d2569",
    "#285430",
    "#f6b100",
    "#025cca",
    "#be3e3f",
    "#02ca3a",
  ];
  const randomBg = Math.floor(Math.random() * bgarr.length);
  const color = bgarr[randomBg];
  return color;
};

// Read the logged-in shop's details (saved at login) for report/receipt headers.
export const getShopDetails = () => {
  try {
    return JSON.parse(localStorage.getItem("shopDetails")) || {};
  } catch {
    return {};
  }
};

// Open a print window with a professional restaurant header + styled report.
// (title, optional subtitle, inner HTML — usually a <table>.)
export const printReport = (title, subtitle, innerHtml) => {
  const win = window.open("", "", "width=1000,height=700");
  if (!win) {
    alert("Please allow pop-ups for this site to print.");
    return;
  }
  const shop = getShopDetails();
  const header = `
    <div class="shop">
      <h1 class="shop-name">${shop.name || "Restaurant"}</h1>
      ${shop.address ? `<p>${shop.address}</p>` : ""}
      <p>${[shop.phone ? `Tel: ${shop.phone}` : "", shop.email || ""].filter(Boolean).join(" &middot; ")}</p>
      ${shop.ownerName ? `<p>Owner: ${shop.ownerName}</p>` : ""}
    </div>`;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .shop { text-align: center; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 14px; }
          .shop-name { font-size: 22px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
          .shop p { margin: 2px 0; font-size: 12px; color: #444; }
          h2 { font-size: 16px; margin: 0 0 4px; }
          .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .right { text-align: right; }
          .center { text-align: center; }
          .powered { text-align: center; margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        ${header}
        <h2>${title}</h2>
        <div class="meta">${subtitle || ""} &middot; Printed ${new Date().toLocaleString()}</div>
        ${innerHtml}
        <div class="powered">Powered by <strong>SoftTech</strong> &middot; Contact: 0333 9777676</div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  // Print once the content is ready, and close only after the print dialog
  // is dismissed (so the window doesn't vanish before the user can print).
  win.onafterprint = () => win.close();
  setTimeout(() => win.print(), 400);
};

// Tolerant parser for order items. New orders store clean JSON arrays; some old
// rows were saved as Postgres array literals ({"{...}","{...}"}). Handle both.
export const parseItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
  } catch {
    // fall through to Postgres-array recovery
  }
  const items = [];
  const unescaped = raw.replace(/\\"/g, '"');
  const matches = unescaped.match(/\{[^{}]*\}/g);
  if (matches) {
    for (const m of matches) {
      try {
        items.push(JSON.parse(m));
      } catch {
        // skip
      }
    }
  }
  return items;
};

// Order JSON fields (customerDetails, bills, items) are stored as strings in
// the DB. Safely parse them into objects/arrays.
export const parseJSON = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getAvatarName = (name) => {
  if(!name) return "";

  return name.split(" ").map(word => word[0]).join("").toUpperCase();

}

export const formatDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
};

export const formatDateAndTime = (date) => {
  const dateAndTime = new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  })

  return dateAndTime;
}