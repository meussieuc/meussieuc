importScripts("utils.js", "gfy-const.js", "imgur-const.js");

// ----------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------

class Progress {
    constructor(limit) {
        this.found = 0;
        this.requested = 0;
        this.limit = limit;
        this.newId = null;
    }

    isDone() {
        return this.found >= this.limit;
    }
}

// ----------------------------------------------------------------------------
// GLOBAL VARS
// ----------------------------------------------------------------------------

const NB_ASYNC = 100;

var progress = null;

// ----------------------------------------------------------------------------
// GENERATOR FUNCTIONS
// ----------------------------------------------------------------------------

const notifProgress = function (id) {
    progress.newId = id === undefined ? null : id;
    postMessage(JSON.stringify(progress));
}

const addRandoms = function (nb, genType) {
    progress = new Progress(nb);
    notifProgress(null);

    for (i = 0; i < NB_ASYNC; i++) {
        addRandom(genType);
    }

    console.info("All %i asyncs started", NB_ASYNC);
}

const addRandom = function (genType) {
    const id = getId(genType);

    if (id === null)
        return;

    var thumbUrl = getThumbUrl(genType, id);

    getAsync(thumbUrl,
        isImgurFailure,
        thumb => {
            progress.found++;
            progress.requested++;
            console.info("Requests: %s, Found: %s/%s", progress.requested, progress.found, progress.limit);
            notifProgress(id);
            continueOrClose(genType);
        },
        e => {
            progress.requested++;
            notifProgress();
            continueOrClose(genType);
        });
}

const isImgurFailure = function (response) {
    return failureResponseLengths.includes(response.length);
}

const getId = function (genType) {
    switch (genType) {
        case GenType.GFYCAT:
            // AdjectiveAdjectiveAnimal
            // return "HandmadeFewBrontosaurus";
            return `${adjectives.random().capitalizeFLetter()}${adjectives.random().capitalizeFLetter()}${animals.random().capitalizeFLetter()}`;

        case GenType.YOUTUBE:
            // [a-z|A-Z|0-9|-|_]^11
            return "_M_WQotsW9E";

        case GenType.IMGUR:
            // [a-z|A-Z|0-9]^7
            // return "DEflzeC";
            // var length = Math.random() < .98 ? 7 : 6;
            var length = Math.random() < .5 ? 7 : 6;
            return idChars.randoms(length).join('');

        default:
            return null;
    }
}

const continueOrClose = function (genType) {
    if (progress.isDone()) {
        console.info("Done!");
        self.close();
    } else {
        addRandom(genType);
    }
}

// GFY URL Generator - Adjective-Adjective-Animal
const getRandomGfyAnimal = function () {
    // return "HandmadeFewBrontosaurus";
    return `${adjectives.random().capitalizeFLetter()}${adjectives.random().capitalizeFLetter()}${animals.random().capitalizeFLetter()}`;
};

const getRandomYtId = function () {
    return "_M_WQotsW9E";
}

// ----------------------------------------------------------------------------
// WEB WORKER EVENTS
// ----------------------------------------------------------------------------

const handleStartMessage = function (message) {
    var startMessage = Object.assign(new StartMessage(), message);

    if (!isNullOrUndefined(progress)) {
        this.console.warn("Worker is already started");
        return;
    }

    this.console.info("Starting worker");
    this.console.info(" - Type: %s", startMessage.genType);
    this.console.info(" - Limit: %i", startMessage.limit);

    addRandoms(startMessage.limit, startMessage.genType);
}

onmessage = function (event) {
    var message = JSON.parse(event.data);

    switch (message.action) {
        case Action.START:
            handleStartMessage(message);
            break;

        default:
            this.console.error("Unknown action: %s", message.action);
            break;
    }
}