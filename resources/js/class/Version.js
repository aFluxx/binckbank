import Request from './Request';

class _Version {
    constructor() {
        this.request = Request;
    }

    /**
     * Get the version of the API. Since this function works without token, this might be the first call to test development.
     * @return {void}
     */
    getVersion() {
        console.log("Requesting version..");
        // The version request requires parameters nor token. Only GET.

        return this.request.request("GET", "version", {});
    }
}

const Version = new _Version();
export default Version;