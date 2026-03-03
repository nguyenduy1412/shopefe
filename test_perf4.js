const { formatToICTDateOnly, getICTFractionalHour } = require('./lib/timezone');

console.time('render');
for(let i=0; i<3000; i++) {
  formatToICTDateOnly(new Date());
  getICTFractionalHour(new Date());
}
console.timeEnd('render');
