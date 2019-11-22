// ----------------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------------

const GenType = Object.freeze({
    "GFYCAT": 0,
    "YOUTUBE": 1,
    "IMGUR": 2
});

const Action = Object.freeze({
    "START": 0
});

// ----------------------------------------------------------------------------
// MESSAGES
// ----------------------------------------------------------------------------

class StartMessage {
    constructor(genType = GenType.GFYCAT, limit = 0) {
        this.action = Action.START;
        this.genType = typeof genType === "string" ? parseInt(genType) : genType;
        this.limit = typeof limit === "string" ? parseInt(limit) : limit;
    }
}

// ----------------------------------------------------------------------------
// PROTOTYPES
// ----------------------------------------------------------------------------

String.prototype.capitalizeFLetter = function () {
    return this[0].toUpperCase() + this.slice(1);
}

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

// ----------------------------------------------------------------------------
// GENERAL FUNCTIONS
// ----------------------------------------------------------------------------

const isNullOrUndefined = function (obj) {
    return obj === undefined || obj === null;
}

const getAsync = function (url, success, failure) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200)
                success(xhr.response);
            else
                failure(xhr.statusText);
        }
    }
    xhr.send();
}

const formatPercent = function (number) {
    return new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 2
    }).format(number);
}

// ----------------------------------------------------------------------------
// GENERAL DOM FUNCTIONS
// ----------------------------------------------------------------------------

// const populateSelect = function (selectId, selectList = [new SelectItem()]) {
//     const select = document.getElementById(selectId);
//     selectList.forEach(function(item) {
//         select.appendChild(createOption(item));
//     });
// }

const populateSelect = function (selectId, enumtype) {
    const select = document.getElementById(selectId);
    for (const [text, value] of Object.entries(enumtype)) {
        select.appendChild(createOption(value, text));
    }
}

function createOption(value = "", text = "") {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// ----------------------------------------------------------------------------
// SPECIFIC DOM FUNCTIONS
// ----------------------------------------------------------------------------

const updateProgressBar = function (progressId, value, max) {
    $(`#${progressId} .bar`).css("width", `${max === 0 ? 100 : value / max * 100}%`)
    $(`#${progressId} .bar .label`).text(`${value} / ${max}`)
}

const renderProgress = function (progress) {
    $("#nbreq").text(progress.requested);
    $("#successRate").text(progress.requested === 0 ? "-" : `${formatPercent(progress.found / progress.requested * 100)}%`);
    updateProgressBar("foundprogress", progress.found, progress.limit);
}

const clearGfys = function () {
    document.getElementById("placeholder").innerHTML = "";
}

const getDOMFromString = function (html) {
    var template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// ----------------------------------------------------------------------------
// TEMPLATE FUNCTIONS
// ----------------------------------------------------------------------------

const getCard = function (genType, id) {
    return getDOMFromString(`
        <div class="gfycard">
            <a target="blank" href="${getVidUrl(genType, id)}">
                ${getImg(genType, id)}
            </a>
        </div>`);
}

const getImg = function (genType, id) {
    return `<img class="thumbnail" src="${getThumbUrl(genType, id)}" />`
}

const getThumbUrl = function (genType, id) {
    switch (genType) {
        case GenType.GFYCAT:
            return `https://thumbs.gfycat.com/${id}-mobile.jpg`;

        case GenType.YOUTUBE:
            return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
            // return `https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2F${id}%2Fmaxresdefault.jpg&f=1&nofb=1`;

        case GenType.IMGUR:
            return `https://i.imgur.com/${id}g.jpg`;

        default:
            return null;
    }

}

const getVidUrl = function (genType, id) {
    switch (genType) {
        case GenType.GFYCAT:
            return `vid.htm?gfy=${id}`

        case GenType.YOUTUBE:
            return `https://youtube.com/embed/${id}`;

        case GenType.IMGUR:
            return `https://i.imgur.com/${id}.jpg`;

        default:
            return null;
    }
}