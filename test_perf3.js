const { format, startOfWeek, addDays } = require('date-fns');

function formatToICTDateOnly(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value || "01";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const year = parts.find((p) => p.type === "year")?.value || "1970";

  return `${year}-${month}-${day}`;
}

console.time('render');
for(let i=0; i<3000; i++) {
  formatToICTDateOnly(new Date());
}
console.timeEnd('render');
