"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.standardizeDate = standardizeDate;
exports.newFormattedDate = newFormattedDate;
exports.sameDate = sameDate;
/**
 * Created by Danny on 12/18/16.
 */
function standardizeDate(date) {
  if (!date) return null;else {
    var formattedDate = new Date(date);
    formattedDate.setHours(13, 0, 0, 0);
    return formattedDate;
  }
}

function newFormattedDate(date) {
  return {
    type: String,
    set: function set(value) {
      standardizeDate(value);
    }
  };
}

function sameDate(date1, date2) {
  return date1.date() == date2.date() && date1.month() == date2.month() && date1.year() == date2.year();
}
//# sourceMappingURL=Date.Utils.js.map
