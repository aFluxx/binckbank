import Server from './Server';
import Cookies from './Cookies';

class _API {
    constructor() {
        // CSRF-token is optional but highly recommended. You should store the value of this (CSRF) token in the users session to be validated when they return.
        // This should be a random unique per session token and put on the session/cookie/localStorage.
        /** @type {number} */
        this.csrfToken = Math.random();

        /** @type {string} */
        this.realm = 'binckbeapi';

        /** @type {Object} */
        this.configurationFromBackend = null;

        /** @type {string} */
        this.accessToken = "";

        /** @type {string} */
        this.refreshToken = null;

        /** @type {string} */
        this.bearerToken = null;

        /** @type {Date} */
        this.accessTokenExpirationTime = null;

        /** @type {number} */
        this.accessTokenExpirationTimer = 0;  // Show the time left the token is active, for debug purposes.

        /** @type {number} */
        this.accessTokenRefreshTimer = null; // Request a new token just before the token expires.

        /** @type {number} */
        this.nextSessionRefresh = null;

        /** @type {boolean} */
        this.isSignedIn = false;

        this.server = Server;

        this.cookies = Cookies;
    }

    /**
     * This is the function to use for a single page application.
     * The URL is checked. If it contains a code, the token is requested and the user is authenticated.
     * If there is no code yet, the login page will be shown.
     * @return {void}
     */
    checkState() {
        var code = this.getUrlParameterByName("code");
        var error;

        if (code === "") {
            error = this.getUrlParameterByName("error");
            if (error !== "") {
                // An error occurred. User might not have authorized the request.
                console.log("Login failed: \n" + this.getUrlParameterByName("error_description") + " (" + error + ")");
            }
        } else {
            this.verifyCsrfToken();
            this.getAccessToken(code);
        }
    }

    /**
     * Get the state from the redirect URL.
     * @return {*} The object saved in the state parameter.
     */
    getState() {
        var stateString = this.getUrlParameterByName("state");
        var stateStringDecoded = window.atob(stateString);
        try {
            return JSON.parse(stateStringDecoded);
        } catch (ignore) {
            console.error("State returned in the URL parameter is invalid.");
            return null;
        }
    }

    /**
     * If authentication was successful, we validate the response by comparing states. Ideally the state is stored in a cookie or localStorage.
     * @return {void}
     */
    verifyCsrfToken() {
        var csrfTokenBefore = parseFloat(this.getCookie("csrfToken"));
        var csrfTokenAfter = this.getState().csrfToken;
        console.log("Comparing stored CSRF code " + csrfTokenBefore + " with retrieved code " + csrfTokenAfter + "..");
        if (csrfTokenAfter !== csrfTokenBefore) {
            console.log("CSRF error: The state supplied when logging in, is not the same as the state from the response.");
        }
    }

    /**
     * If authentication was successful, the token can be requested using the code supplied by the authentication provider.
     * @param {string} code The code from the URL.
     * @return {void}
     */
    getAccessToken(code) {
        var data = {
            "requestType": "requestToken",
            "code": code
        };

        console.log("Requesting token..");
        this.getToken(data);
    }

    /**
     * Retrieve a new accessToken, if the current one is almost expired.
     * @param {function(string)} errorCallback Callback function to invoke in case of an error.
     * @return {void}
     */
    getRefreshToken() {
        var data = {
            "requestType": "refreshToken",
            "refreshToken": this.refreshToken
        };

        console.log("Requesting token refresh..");
        this.getToken(data);
    }

    /**
     * Retrieve an access token from the server.
     * @param {Object} data Data to be send.
     * @return {void}
     */
    getToken(data) {
        data.realm = this.realm;

        this.server.getDataFromServer(data)
            .then(res => res.json())
            .then(res => {
                if (res.error == 'invalid_grant') {
                    this.navigateToLoginPage();
                } else {
                    this.tokenReceivedCallback(res);
                }
            });
    }

    /**
     * If authentication was successful, the token can be requested using the code supplied by the authentication provider.
     * @param {Object} tokenObject The token object returned.
     * @param {function(string)} errorCallback Callback function to invoke in case of an error.
     * @return {void}
     */
    tokenReceivedCallback(tokenObject) {
        this.nextSessionRefresh = tokenObject.expires_in - 60;  // Refresh one minute before expiration
        let nextSessionRefreshTime = new Date();
        nextSessionRefreshTime.setSeconds(nextSessionRefreshTime.getSeconds() + this.nextSessionRefresh);
        this.accessToken = tokenObject.access_token;
        this.refreshToken = tokenObject.refresh_token;
        console.log("New token received: " + tokenObject.access_token);
        console.log("Received scope: " + tokenObject.scope);
        this.updateTokenExpirationTime(tokenObject.expires_in);
        // Start a timer, to refresh the token before it expires.
        console.log("Session will be refreshed at " + nextSessionRefreshTime.toLocaleString());
        this.accessTokenRefreshTimer = window.setTimeout(
            () => {
                // this.getRefreshToken();
                // This creates an infinite loop, needs fix
            },
            this.nextSessionRefresh * 1000  // Do the refresh just before the token will expire
        );
        this.newTokenCallback(tokenObject);
    }

    /**
     * This callback is triggered when a new token is available.
     * @param {Object} tokenObject Fresh token.
     * @return {void}
     */
    newTokenCallback(tokenObject) {
        /** @type {boolean} */
        var isFirstToken = true;
        $("#idBearerToken").text(tokenObject.access_token);
        this.bearerToken = tokenObject.access_token;

        if (isFirstToken === true) {
            // User is authenticated
            isFirstToken = false;
            $("#idBtnLoginOrLogout").on("click", function (evt) {
                evt.preventDefault();
            }).val("Sign out");
            //displayAccounts();
        } else {
            // streamer.extendSubscriptions();
        }
    }

    /**
     * This function calculates the time until which the token is valid.
     * @param {number} expiresInSeconds Seconds until expiration.
     * @return {void}
     */
    updateTokenExpirationTime(expiresInSeconds) {
        this.accessTokenExpirationTime = new Date();
        this.accessTokenExpirationTime.setSeconds(this.accessTokenExpirationTime.getSeconds() + expiresInSeconds);
        console.log("New token will expire at " + this.accessTokenExpirationTime.toLocaleString());
        // Start a timer once, to log the time until expiration - for debug purposes, not for production.
        if (this.accessTokenExpirationTimer === 0) {
            this.accessTokenExpirationTimer = window.setInterval(
                function () {
                    var difference = this.accessTokenExpirationTime - new Date();
                    var minutesTillExpiration = Math.round(difference / 1000 / 60);
                    if (difference > 0) {
                        expirationCounterCallback(minutesTillExpiration);
                    } else {
                        console.log("Token expired.");
                        window.clearInterval(this.accessTokenExpirationTimer);
                    }
                },
                60 * 1000
            );
        }
    }

    /**
     * Insert a cookie. In order to delete it, make value empty.
     * @param {string} key Name of the cookie.
     * @param {string} value Value to store.
     * @return {void}
     */
    setCookie(key, value) {
        var expires = new Date();
        // Cookie is valid for 360 days.
        expires.setTime(expires.getTime() + 360 * 24 * 60 * 60 * 1000);
        document.cookie = key + "=" + value + ";expires=" + expires.toUTCString();
    }

    /**
     * This function loads the page where the user enters the credentials and agreed to the consent.
     * When authorized, the browser will navigate to the given redirect URL.
     * @return {void}
     */
    navigateToLoginPage() {
        // The login page needs to be a redirect, using GET to supply landing page and client id.
        // Save the state, to compare after the login.
        this.setCookie("csrfToken", this.csrfToken.toString());
        console.log("Loading login or consent page..");

        window.location = this.getLogonUrl();
    }

    /**
     * Construct the URL to navigate to the login dialog.
     * @return {string} URL to redirect to.
     */
    getLogonUrl() {
        var configurationObject = this.getConfiguration();

        return configurationObject.authenticationProviderUrl + "realms/" + encodeURIComponent(this.realm) + "/authorize" + this.convertObjectToQueryParameters({
            "ui_locales": configurationObject.language,
            "client_id": configurationObject.clientId,
            "scope": configurationObject.scope,
            "state": this.createState(configurationObject.accountType, this.realm),
            "response_type": "code",
            "redirect_uri": configurationObject.redirectUrl
        });
    }

    /**
     * Get the configuration for the API, like environment and client.
     * @return {Object} Object with the configuration.
     */
    getConfiguration() {
        return {
            "clientId": this.configurationFromBackend.clientId,  // This is the identifier of your application. Both clientId and secret are available server side.
            "accountType": 'binckComplete',
            "redirectUrl": this.configurationFromBackend.redirectUrl,  // This is the landing URL of your application, after logging in. HTTPS is required for production use.
            "realm": "bincknlapi",
            "authenticationProviderUrl": this.configurationFromBackend.authenticationProviderUrl,  // This is the URL of the authentication provider to be used.
            "apiUrl": this.configurationFromBackend.apiUrl,  // This is the URL to the API of Binck of the local process.
            "language": 'nl-BE',
            "scope": 'read write news quotes',
            "appServerUrl": this.server.serverConnection.appServerUrl
        };
    }


    /**
     * This function constructs query parameters from an object.
     * @param {Object<string, string>} data Key/value pairs to process.
     * @return {string} The query parameter string, of which the first is prefixed with "?".
     */
    convertObjectToQueryParameters(data) {
        var result = "";
        Object.entries(data).forEach(function (entry) {
            result += (result === "" ? "?" : "&") + entry[0] + "=" + encodeURIComponent(entry[1]);
        });

        return result;
    }

    /**
    * Read a cookie.
    * @param {string} key Name of the cookie.
    * @return {string} Value.
    */
    getCookie(key) {
        var name = key + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookieArray = decodedCookie.split(";");
        var i;
        var c;
        for (i = 0; i < cookieArray.length; i += 1) {
            c = cookieArray[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /**
     * Get argument from the URL.
     * @param {string} name Name of query parameter.
     * @return {string} Value.
     */
    getUrlParameterByName(name) {
        // Get an argument of the URL like www.test.org/?arg=value
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&#]" + name + "=([^&#]*)");
        var results = regex.exec(window.location.href);
        return (results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")));
    }

    /**
     * The state is used to validate the response and to add the desired opening account, if multiple accounts are available and if this account type is one of them.
     * @param {string} accountType The requested account type to show.
     * @return {string} The encoded state object, including the CSRF token.
     */
    createState(accountType) {
        var stateObject = {
            // Token is a random number
            "csrfToken": this.csrfToken,
            // Remember realm, to get token
            "realm": this.realm,
            "account": accountType
        };
        // Convert the object to a base64 encoded string:
        var stateString = JSON.stringify(stateObject);
        return window.btoa(stateString);
    }
}

const API = new _API();
export default API;