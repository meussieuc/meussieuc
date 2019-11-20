var mainScriptLoaded = true;

// -----------------------------------------------------------------------------
// Global functions
// -----------------------------------------------------------------------------
// JSON object wrapper
// -------------------
function $W(param) {
    var obj = {};

    //set data
    obj.data = param;

    //augment the object with a remove function
    obj.remove = function(key, val) {
        var i = 0;
        //loop through data
        while (this.data[i]) {
            if (this.data[i][key] === val) {
                //if we have that data, splice it
                //splice changes the array length so we don't increment
                this.data.splice(i, 1);
            } else {
                //else move on to the next item
                i++;
            }
        }
        //be sure to return the object so that the chain continues
        return this;
    }

    //return object for operation
    return obj
}

// callFunctionOnParent
// --------------------
function callFunctionOnParent(functionName, params) {
   if (params === undefined || params === null)
      params = [];
      
   parent.postMessage({
      "func": functionName, "params": params
   }, "*");
}

// receiveMessage
// --------------
function receiveMessage(event) {
    var data = event.data;
    if (typeof(window[data.func]) == "function") {
        window[data.func].apply(null, Array.prototype.slice.call(data.params, 0));
    }
}

// addDebugLine
// ------------
function addDebugLine(line) {
   var debug = $("#debug");
   
   if (debug.length == 0)
      console.log(line);
   else {
      debug.text(debug.text() + line + "\r\n");
      scrollToBottomOf(debug);
   }
}

// scrollToBottomOf
// ----------------
function scrollToBottomOf(jqElement) {
   if (jqElement.length > 0)
      jqElement.scrollTop(jqElement[0].scrollHeight);
}

// addLoadingOver
// --------------
function addLoadingOver(selector) {
   var underlay = $(selector);
   
   underlay.addClass("loading-underlay");
   
   if ($(".loading-overlay", underlay).length > 0)
      return;
   
   var loadingOverlayHTML = `
         <div class="loading-overlay">
            <img class="loading-img" src="images/loading.gif" />
            <span class="loading-txt"></span>
         </div>`;
      
   underlay.html(underlay.html() + loadingOverlayHTML);
}

// removeLoadingOver
// -----------------
function removeLoadingOver(selector) {
   var underlay = $(selector);
   underlay.removeClass("loading-underlay");
   $(".loading-overlay", underlay).remove();
}

// getRandomInt
// ------------
function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max) + 1;
   return Math.floor(Math.random() * (max - min)) + min;
}

// getRandomBool
// -------------
function getRandomBool(trueProb) {
   if (typeof(trueProb) == "undefined")
      trueProb = .5;
      
   return Math.random() < trueProb ? true : false;
}

// getRandomBorder
// ---------------
function getRandomBorder() {
   var rnd = getRandomInt(0, 3);
   
   if (rnd == 0)
      return null;
   if (rnd == 1)
      return "wall";
   if (rnd == 2)
      return "window";
   if (rnd == 3)
      return "door";
}

// getRandomElement
// ----------------
function getRandomElement(container) {
   return container.length == 0 ? null : container[getRandomInt(0, container.length - 1)];
}

// getRandomElementWithProb
// ------------------------
function getRandomElementWithProb(container) {
   // container must be an array of {prob, value} element
   var rnd           = Math.random();
   var lastCumulProb = 0;
   var cumulProb     = 0;
   
   for (var i in container) {
      if (container[i].prob === undefined)
         throw new Error("Prob is not defined in the array element");
      
      if (container[i].value === undefined)
         throw new Error("Value is not defined in the array element");
         
      cumulProb += container[i].prob;
      
      if (rnd >= lastCumulProb && rnd < cumulProb)
         return container[i].value;
      
      lastCumulProb = cumulProb;
   }
   
   // If it goes here, that means the prob sum in the container is less than 1
   return null;
}

// arrayToString
// -------------
function arrayToString(array, detailArrays) {
   detailArrays = (typeof(detailArrays) == "undefined" ? true : detailArrays);
   
   if (detailArrays) {
      var strElems = "";
      
      for (var index in array) {
         if (Number(index) > 0) 
            strElems = `${strElems}, `;
            
         var elem    = array[index];
         var isArray = Array.isArray(elem);
         
         strElems = `${strElems}${isArray ? arrayToString(elem, detailArrays) : elem}`;
      }
      
      return `[ ${strElems} ]`;
   }
   else {
      return `{ length: ${array.length} }`;
   }
}

// getObjectType
// -------------
function getObjectType(obj) {
   if (obj === null)
      return null;
      
   var objType = typeof(obj);
   
   if (objType != "object")
      return objType;
   
   return obj.constructor.name;
}

// getXYFromMixedArgs
// ------------------
function getXYFromMixedArgs(arg1, arg2) {
   var arg1Type = getObjectType(arg1);
   var arg2Type = getObjectType(arg2);
   var x, y;
   
   if (arg1Type == "number" && arg2Type == "number") {
      x = arg1;
      y = arg2;
   }
   // else if (arg1Type == "Vector") {
   else if (arg1 instanceof Vector) {
      x = arg1.X;
      y = arg1.Y;
   }
   else
      throw "Arguments exception";
   
   return { "x": x, "y": y };
}

// objValsEqual
// ------------
function objValsEqual(obj1, obj2) {
   return (JSON.stringify(obj1) === JSON.stringify(obj2));
}

// -----------------------------------------------------------------------------
// Prototype addons
// -----------------------------------------------------------------------------
// Array.first
//------------
Object.defineProperty(Array.prototype, "first", {
   enumerable: false,
   value: function() {
      for (var i in this)
         return this[i];
   }
});
// Array.prototype.first = function() {
   // for (var i in this)
      // return this[i];
// };

// Array.last
//-----------
Object.defineProperty(Array.prototype, "last", {
   enumerable: false,
   value: function() {
      var lastElement;
      for (var i in this)
         lastElement = this[i];
      return lastElement;
   }
});
// Array.prototype.last = function() {
   // var lastElement;
   // for (var i in this)
      // lastElement = this[i];
   // return lastElement;
// };

// -----------------------------------------------------------------------------
// General Inits
// -----------------------------------------------------------------------------
if (typeof(window) !== "undefined")
   window.addEventListener ("message", receiveMessage, false);