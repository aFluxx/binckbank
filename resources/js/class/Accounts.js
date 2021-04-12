import Request from './Request';

class _Accounts {
    constructor() {
        /** @type {string} */
        this.accountNumber = null;

        this.request = Request;
    }

    /**
     * Load all the accounts for a relation.
     * @return {void}
     */
    getAccounts() {
        console.log("Requesting accounts..");

        this.request.request("GET", "accounts", {})
            .then(res => console.log(res));
    }

    setUpAccount() {
        console.log("Setting up your account");

        return this.request.request("GET", "accounts", {})
            .then(res => {
                console.log(res);
                this.accountNumber = res.accountsCollection.accounts[0].number;
            });
    }
}

const Accounts = new _Accounts();
export default Accounts;