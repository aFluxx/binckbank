import Request from './Request';

class _Instruments {
    constructor() {
        this.request = Request;
    }

    getInstrumentList(instrumentListId, accountNumber, range) {
        var data = {
            "accountNumber": accountNumber
        };
        if (range !== null) {
            data.range = range;
        }
        console.log("Requesting instrument list " + instrumentListId + "..");
        requestCallback("GET", "instruments/lists/" + instrumentListId, data);
    }

    /**
    * This function tries to find a stock by (part of) its name.
    * @param {string} q The search text.
    * @param {null|string} instrumentType The type of instrument (eg. equity, option, tracker, or index).
    * @param {number} count The maximum number of instruments in the response.
    * @param {string} accountNumber The account number.
    * @param {boolean} includeTickSizeTable Add tickSize table to the response, to lookup the minimum price movement for order limits.
    * @return {void}
    */
    findByName(q, instrumentType, count, accountNumber, includeTickSizeTable) {
        var data = {
            "searchText": encodeURIComponent(q),
            "accountNumber": accountNumber,
            "includeTickSizes": includeTickSizeTable,
            "range": "0-" + (count - 1)
        };

        console.log("Searching " + count + " result for instrument '" + q + "' with account number " + accountNumber + "..");

        if (instrumentType !== null) {
            data.instrumentType = instrumentType;
        }

        return this.request.request("GET", "instruments", data);
    }


    /**
     * This function tries to find a stock by ISIN and MIC.
     * @param {string} isin The ISIN code.
     * @param {null|string} mic The MIC (Market Identification Code).
     * @param {null|string} instrumentType The type of instrument (eg. equity, option, tracker, or index).
     * @param {string} accountNumber The account number.
     * @return {void}
     */
    findByIsin(isin, mic, instrumentType, accountNumber) {
        console.log("Searching for instrument '" + isin + "' of account number " + accountNumber + "..");

        var data = {
            "isin": isin,
            "accountNumber": accountNumber
        };

        if (mic !== null) {
            data.mic = mic;
        }

        if (instrumentType !== null) {
            data.instrumentType = instrumentType;
        }

        return this.request.request("GET", "instruments", data);
    }
}

const Instruments = new _Instruments();
export default Instruments;