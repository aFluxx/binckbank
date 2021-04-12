class _Server {
    constructor() {
        this.serverConnection = {
            appServerUrl: "../server/token.php"
        };
    }

    getDataFromServer(data) {
        return fetch(this.serverConnection.appServerUrl, {
            "headers": {
                "Accept": "application/json; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8"
            },
            "body": JSON.stringify(data),
            "method": "POST"
        });
    }
}

const Server = new _Server();
export default Server;