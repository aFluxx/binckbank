import Request from './Request';

class _Streamer {
    constructor() {
        this.request = Request;
    }
}

const Streamer = new _Streamer();
export default Streamer;