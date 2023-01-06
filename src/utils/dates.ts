import * as moment from 'moment';
import { ShiftStatus } from '../offers_and_shifts/entities/shift.entity';

export function getHoursDiff(startDate, endDate) {
  const msInHour = 1000 * 60 * 60;
  let diff = Math.round(Math.abs(endDate - startDate) / msInHour);
  if (endDate < startDate) {
    diff = diff * -1;
  }
  return diff;
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

export const isActiveByHours = (from, to) => {
  const now: Date = new Date();
  const beforeFrom = moment(from).subtract(1, 'hour');
  // is active 1 hour before the start until the end of the offer
  return moment(beforeFrom).isBefore(now) && moment(now).isBefore(to);
};
export const isWaitingEnding = (shift) => {
  const now: Date = new Date();
  const shiftIsOver = moment(shift.offer.to).isBefore(now);
  return (
    shiftIsOver &&
    (shift.status == ShiftStatus.ACTIVE ||
      shift.status == ShiftStatus.UNCONFIRMED)
  );
};
