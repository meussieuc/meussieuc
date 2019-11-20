importScripts("../linq.js_ver2.2.0.2/linq.js", 
              "main.js", 
              "baseClass.js", 
              "vector.js", 
              "cellDirection.js", 
              "cell.js", 
              "corridor.js", 
              "grid.js", 
              "mazeGenerator.js");

var stopCondition = function(iterCount, traveledCellsCount, gridArea, seedsCount, createdSeedsCount) {
   return traveledCellsCount >= gridArea && seedsCount == 1;
};

function generate(width, height, newSeedProb, corridorMinLength, corridorMaxLength) {
   try {
      var grid = new Grid(width, height);
      var gen = new MazeGenerator(newSeedProb, corridorMinLength, corridorMaxLength);
      
      gen.generate(grid, stopCondition);
      
      var cellSize = 40;
      
      postMessage({ 
         status: "done", 
         renderedGrid: grid.renderHTML(cellSize, cellSize, false), 
         htmlGridWidth: width * cellSize + 10,
         htmlGridHeight: height * cellSize + 10
      });
   } catch(err) {
      if (err instanceof Error) {
         postMessage({ status: "error", error: err.stack });
      }
      else
         postMessage({ status: "error", error: err });
   }
}

onmessage = function(event) {
   if (event.data.msg === "start") {
      var params = event.data.params;
      
      generate(event.data.params.width,
               event.data.params.height,
               event.data.params.newSeedProb,
               event.data.params.corridorMinLength,
               event.data.params.corridorMaxLength);
   }
}

