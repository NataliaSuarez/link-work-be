import * as moment from 'moment';

export function getHoursDiff(startDate, endDate) {
  const msInHour = 1000 * 60 * 60;
  let dif = Math.round(Math.abs(endDate - startDate) / msInHour);
  if (endDate < startDate) {
    dif = dif * -1;
  }
  return dif;
}
export function getDay0(date) {
  const day = new Date(date).getDay();
  const result = new Date(moment(date).subtract(day, 'd').format());
  return result;
}
export function getDay6(date) {
  const day = new Date(date).getDay();
  const add = 6 - day;
  const result = new Date(moment(date).add(add, 'd').format());
  return result;
}
