const { format, startOfWeek, addDays } = require('date-fns');

function formatICTDateToLocalString(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
}

console.time('render');
for(let i=0; i<3000; i++) {
  formatICTDateToLocalString(new Date());
}
console.timeEnd('render');
