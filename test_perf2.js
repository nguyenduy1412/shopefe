const { format, startOfWeek, addDays } = require('date-fns');

function getICTFractionalHour(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const parts = formatter.formatToParts(date);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

  return hour + minute / 60;
}

console.time('render');
for(let i=0; i<3000; i++) {
  getICTFractionalHour(new Date());
}
console.timeEnd('render');
