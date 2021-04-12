import Request from './Request';

class _Quotes {
    constructor() {
        this.request = Request;
    }

    /**
     * Load trade or book prices for a list of instruments - if level in "none", only the subscriptions are retrieved
     * @param {string} accountNumber The identifier of the account.
     * @param {Array<string>} instrumentIds The identifier of the instrument(s).
     * @param {string} level Get full book (bid1-bid5 and ask1-ask5) with "tradesBidAsk", or only trades (last, high, low, etc) with "tradesOnly". Can be "none" to get subscriptions.
     * @return {void}
     */
    getLatestQuotes(accountNumber, instrumentIds, level) {
        var data = {
            "accountNumber": accountNumber,
            "level": level,
            "instrumentIds": instrumentIds.join()
        };

        console.log("Requesting quotes for instrument " + instrumentIds.join(" and ") + "..");

        return this.request.request("GET", "quotes", data);
    }


    /**
     * Load historical quotes for an instrument, in intervals - each of the intervals have different period max. lengths
     * @param {string} accountNumber The identifier of the account.
     * @param {string} instrumentId The identifier of the instrument.
     * @param {Date} fromDateTime The date of the first quotes. Can be today.
     * @param {null|Date} toDateTime The date of the last quotes. Can be today.
     * @param {string} interval The frequency of the quotes (OneMinute, FiveMinutes, TenMinutes, FifteenMinutes, OneHour, OneDay, OneWeek, OneMonth), to save bandwidth.
     * @return {void}
     */
    getHistoricalQuotes(accountNumber, instrumentId, fromDateTime, toDateTime, interval) {
        var data = {
            "accountNumber": accountNumber,
            "fromDateTime": fromDateTime.toJSON(),
            "interval": interval
        };

        console.log("Requesting historical quotes for instrument " + instrumentId + "..");

        if (toDateTime !== null) {
            data.toDateTime = toDateTime.toJSON();
        }

        return this.request.request("GET", "quotes/" + instrumentId + "/history", data);
    }
}

const Quotes = new _Quotes();
export default Quotes;