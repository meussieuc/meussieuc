importScripts("../linq.js_ver2.2.0.2/linq.js", 
              "main.js", 
              "baseClass.js", 
              "vector.js", 
              "rectangle.js", 
              "cellDirection.js", 
              "cell.js", 
              "dungeonPart.js", 
              "corridor.js", 
              "room.js", 
              "grid.js", 
              "baseGenerator.js",
              "mazeGenerator.js", 
              "roomsGenerator.js");

// ---------
// stopCheck
// ---------
var stopCheck = function(genState, stopParams) {
   if (stopParams === null 
      || (stopParams.gridArea === null 
         && stopParams.seedsCount === null 
         && stopParams.createdSeeds === null))
      throw new Error("Stop condition not defined");
      
   if (stopParams.maxIterations !== null && genState.iterCount >= stopParams.maxIterations)
      return true;
      
   return (stopParams.gridArea === null 
         || genState.traveledCellsCount / genState.gridArea >= stopParams.gridArea)
      && (stopParams.seedsCount === null 
         || genState.seedsCount == stopParams.seedsCount)
      && (stopParams.createdSeeds === null 
         || genState.createdSeedsCount >= stopParams.createdSeeds);
};

// --------
// generate
// --------
function generate(type, 
                  width, height, 
                  corridorMinLength, corridorMaxLength,
                  roomMinWidth, roomMaxWidth, roomMinHeight, roomMaxHeight,
                  windowsOnlyOutside, windowProb,
                  mazeNewSeedProb,
                  mazeGenStopParams,
                  roomsNewSeedProb,
                  genTypeProbs,
                  mergeOnCorridorHitProb, loopProb,
                  roomsGenStopParams) {
   try {
      if (type !== "maze" && type !== "rooms" && type !== "mixed")
         throw new Error(`Unknown generator type: ${type}`);
         
      var grid = new Grid(width, height);
      
      var mazeGen  = null;
      var roomsGen = null;
      
      if (type === "maze" || type === "mixed")
         mazeGen = new MazeGenerator(
            mazeNewSeedProb, 
            corridorMinLength, 
            corridorMaxLength
         );
      
      if (type === "rooms" || type === "mixed")
         roomsGen = new RoomsGenerator(
            roomsNewSeedProb,
            genTypeProbs, 
            roomMinWidth, 
            roomMaxWidth, 
            roomMinHeight, 
            roomMaxHeight,
            windowsOnlyOutside, 
            windowProb,
            corridorMinLength, corridorMaxLength,
            mergeOnCorridorHitProb, 
            loopProb
         );
      
      if (roomsGen !== null)
         roomsGen.generate(grid, stopCheck, roomsGenStopParams);
      if (mazeGen !== null)
         mazeGen.generate(grid, stopCheck, mazeGenStopParams);
      
      var cellSize = 40;
      
      postMessage({ 
         status: "done", 
         renderedGrid: grid.renderHTML(cellSize, cellSize, false), 
         htmlGridWidth: width * cellSize + 10,
         htmlGridHeight: height * cellSize + 10
      });
   } catch(err) {
      if (err instanceof Error)
         postMessage({ 
            status: "error", 
            error: err.message + "\r\n" + err.stack 
         });
      else
         postMessage({ 
            status: "error", 
            error: err 
         });
   }
}

// ---------
// onmessage
// ---------
onmessage = function(event) {
   if (event.data.msg === "start") {
      var params = event.data.params;
      
      generate(
         params.type,
         params.width,
         params.height,
         params.corridorMinLength,
         params.corridorMaxLength,
         params.roomMinWidth, 
         params.roomMaxWidth, 
         params.roomMinHeight, 
         params.roomMaxHeight,
         params.windowsOnlyOutside, 
         params.windowProb,
         params.mazeGen.newSeedProb,
         params.mazeGen.stopCondition,
         params.roomsGen.newSeedProb,
         params.roomsGen.typeProbs,
         params.roomsGen.mergeCorridors, 
         params.roomsGen.loopProb,
         params.roomsGen.stopCondition
      );
   }
}