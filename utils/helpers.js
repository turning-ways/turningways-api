const moment = require("moment");

exports.capitalize = (str) => {
  if (typeof str !== "string") {
    throw new TypeError("Expected a string");
  }

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

exports.getDataRange = (dateParam) => {
  const now = moment();
  const dateRanges = {
    lastWeek: {
      start: moment().subtract(1, "weeks").startOf("isoWeek").toDate(),
      end: moment().subtract(1, "weeks").endOf("isoWeek").toDate(),
    },
    lastMonth: {
      start: moment().subtract(1, "months").startOf("month").toDate(),
      end: moment().subtract(1, "months").endOf("month").toDate(),
    },
    lastQuarter: {
      start: moment().subtract(1, "quarters").startOf("quarter").toDate(),
      end: moment().subtract(1, "quarters").endOf("quarter").toDate(),
    },
    today: {
      start: moment().startOf("day").toDate(),
      end: now.toDate(),
    },
  };

  return dateRanges[dateParam] || dateRanges.today;
};
