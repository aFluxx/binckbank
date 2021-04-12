import Api from './Api';

class _Request {
    constructor() {
        /** @type {Object} */
        this.data = null;

        this.api = Api;

        this.accessToken = "";
    }

    /**
     * This function is used to do the calls.
     * @param {string} data Specify the endpoint, like 'version'.
     * @return {void}
     */
    request(method, urlParams, data) {
        var url = this.api.configurationFromBackend.apiUrl + "/" + urlParams;
        var fetchInitOptions = {
            "headers": this.getAccessHeaders(method),
            "method": method
        };

        if (this.isPostBodyRequired(method)) {
            // Put parameters as json in the body of the request
            fetchInitOptions.body = JSON.stringify(data);
        } else {
            // Add parameters as query parameters
            url += this.api.convertObjectToQueryParameters(data);
        }

        return fetch(url, fetchInitOptions)
            .then(res => res.json())
            .then(res => {
                return res;
            }).catch(error => {
                return error.toString();
            });
    }

    /**
     * Return the authorization header with the Bearer token.
     * If the token is expired, the login page will be shown instead.
     * @return {Object} The constructed header, to be sent with a request.
     */
    getAccessHeaders(method) {
        var header = {
            "Accept": "application/json; charset=utf-8"
        };

        if (this.data === "version") {
            return header;
        }

        if (this.api.accessToken === "") {
            throw "Not logged in.";
        }

        if (new Date() > this.api.accessTokenExpirationTime) {
            console.log("Token has been expired.");
            window.clearInterval(this.api.accessTokenExpirationTimer);
            window.clearTimeout(this.api.accessTokenRefreshTimer);
            this.api.navigateToLoginPage('binckapi');
        }

        header.Authorization = "Bearer " + this.api.accessToken;

        if (this.isPostBodyRequired(method)) {
            // We are sending JSON if using POST or PATCH. API is not accepting www-form-urlencoded.
            header["Content-Type"] = "application/json; charset=utf-8";
        }

        return header;
    }

    /**
     * If an error was returned from a fetch, this function translates the response error object to a "human readable" error text.
     * @param {Object} errorObject The returned error object.
     * @return {void}
     */
    getExtendedErrorInfo(errorObject) {
        var textToDisplay = "Error with " + method + " /" + this.data + " - status " + errorObject.status + " " + errorObject.statusText;
        console.error(textToDisplay);
        // Some errors have a JSON-response, containing explanation of what went wrong.
        errorObject.json().then(function (errorObjectJson) {
            if (errorObjectJson.hasOwnProperty("endUserMessage") && errorObjectJson.endUserMessage !== "") {
                // EndUserMessage is translated and meant to be shown to the customer.
                console.log(errorObjectJson.endUserMessage);
            } else if (errorObjectJson.hasOwnProperty("developerMessage")) {
                // DeveloperMessages shouldn't be shown to the customer. They are English and should only appear during development (for example Bad Request).
                console.log(errorObjectJson.developerMessage + " (" + textToDisplay + ")");
            } else if (errorObjectJson.hasOwnProperty("message")) {
                // In rare cases a developerMessage is just called "message".
                console.log(errorObjectJson.message + " (" + textToDisplay + ")");
            } else {
                console.log(JSON.stringify(errorObjectJson) + " (" + textToDisplay + ")");
            }
        }).catch(function () {
            // Typically 401 (Unauthorized) has an empty response, this generates a SyntaxError.
            console.log(textToDisplay);
        });
    }

    /**
    * If data is posted then a content header is required, as well as different parameter handling.
    * @return {boolean} True for POST, PUT of PATCH.
    */
    isPostBodyRequired(method) {
        return method.toUpperCase() !== "GET" && method.toUpperCase() !== "DELETE";
    }
}

const Request = new _Request();
export default Request;