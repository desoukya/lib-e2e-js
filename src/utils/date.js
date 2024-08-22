const _ = require('date-fns');

const ISO_DATE_FORMAT = 'yyyy-mm-dd';
const ISO_DATE_TIME_FORMAT = 'yyyy-mm-ddThh:mm:ss';

const DATE_TODAY = _.format(new Date(), ISO_DATE_FORMAT);
const DATE_TIME_TODAY = _.format(new Date(), ISO_DATE_TIME_FORMAT);

const DATE_TOMORROW = _.format(_.addDays(new Date(), 1), ISO_DATE_FORMAT);
const DATE_TIME_TOMORROW = _.format(_.addDays(new Date(), 1), ISO_DATE_TIME_FORMAT);

const N_DAYS_FROM_TODAY = (n, dateFormat) => _.format(_.addDays(new Date(), n), dateFormat || ISO_DATE_FORMAT)
const N_DAYS_TIME_FROM_TODAY = (n, dateFormat) => _.format(_.addDays(new Date(), n), dateFormat || ISO_DATE_TIME_FORMAT)

const N_WEEKS_FROM_TODAY = (n, dateFormat) => _.format(_.addWeeks(new Date(), n), dateFormat || ISO_DATE_FORMAT)
const N_WEEKS_TIME_FROM_TODAY = (n, dateFormat) => _.format(_.addWeeks(new Date(), n), dateFormat || ISO_DATE_TIME_FORMAT)

const N_MONTHS_FROM_TODAY = (n, dateFormat) => _.format(_.addMonths(new Date(), n), dateFormat || ISO_DATE_FORMAT)
const N_MONTHS_TIME_FROM_TODAY = (n, dateFormat) => _.format(_.addMonths(new Date(), n), dateFormat || ISO_DATE_TIME_FORMAT)

const N_YEARS_FROM_TODAY = (n, dateFormat) => _.format(_.addYears(new Date(), n), dateFormat || ISO_DATE_FORMAT)
const N_YEARS_TIME_FROM_TODAY = (n, dateFormat) => _.format(_.addYears(new Date(), n), dateFormat || ISO_DATE_TIME_FORMAT)

module.exports = {
  DATE_TODAY,
  DATE_TIME_TODAY,
  DATE_TOMORROW,
  DATE_TIME_TOMORROW,
  N_DAYS_FROM_TODAY,
  N_DAYS_TIME_FROM_TODAY,
  N_WEEKS_FROM_TODAY,
  N_WEEKS_TIME_FROM_TODAY,
  N_MONTHS_FROM_TODAY,
  N_MONTHS_TIME_FROM_TODAY,
  N_YEARS_FROM_TODAY,
  N_YEARS_TIME_FROM_TODAY,
}