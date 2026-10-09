const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  reviewed: "تمت المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export function requestStatusLabel(status: string) {
  return STATUS_LABELS[status] || status;
}

export function formatRequestDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Damascus",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function cell(value: string) {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

/** Excel SpreadsheetML. Excel opens it directly, with no extra packages. */
export function buildRequestsWorkbook(
  sheetName: string,
  headers: string[],
  rows: string[][]
) {
  const tableRows = [headers, ...rows]
    .map((row) => `<Row>${row.map(cell).join("")}</Row>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="${escapeXml(sheetName)}">
<Table>${tableRows}</Table>
</Worksheet>
</Workbook>`;
}
