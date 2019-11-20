// -----------------------------------------------------------------------------
// RoomsGenerator Class
// -----------------------------------------------------------------------------
class RoomsGenerator extends BaseGenerator {
	// -----------
	// constructor
	// -----------
   constructor(newSeedProb, genTypeProbs, 
               minRoomWidth, maxRoomWidth, minRoomHeight, maxRoomHeight, 
               windowsOnlyOutside, windowProb,
               corridorMinLength, corridorMaxLength, 
               mergeOnCorridorHitProb, loopProb) {
      super();
         
      if (newSeedProb < 0 || newSeedProb > 1)
         throw new Error("New seed probability must be between 0 and 1");
      
		if (Enumerable.From(genTypeProbs).Sum(function(g) { return g.prob }) != 1)
         throw new Error("Sum of probs must be equal to 1");
         
      if (minRoomWidth < 1 || minRoomHeight < 1)
         throw new Error("Rooms minimum size must be greater than 0");
         
      if (maxRoomWidth < minRoomWidth || maxRoomHeight < minRoomHeight)
         throw new Error("Rooms maximum size must not be lower than its minimum");
         
      if (windowProb < 0 || windowProb > 1)
         throw new Error("Window probability must be between 0 and 1");
         
      if (corridorMinLength < 1)
         throw new Error("Corridors minimum length must be greater than 0");
         
      if (corridorMaxLength < corridorMinLength)
         throw new Error("Corridors maximum length must not be lower than its minimum");
         
      if (mergeOnCorridorHitProb < 0 || mergeOnCorridorHitProb > 1)
         throw new Error("Merge probability must be between 0 and 1");
         
      if (loopProb < 0 || loopProb > 1)
         throw new Error("Loop probability must be between 0 and 1");
		
      this.newSeedProb            = newSeedProb;
		this.genTypeProbs           = genTypeProbs;
      this.minRoomWidth           = minRoomWidth;
      this.maxRoomWidth           = maxRoomWidth;
      this.minRoomHeight          = minRoomHeight;
      this.maxRoomHeight          = maxRoomHeight;
      this.windowsOnlyOutside     = windowsOnlyOutside;
      this.windowProb             = windowProb;
      this.corridorMinLength      = corridorMinLength;
      this.corridorMaxLength      = corridorMaxLength;
      this.mergeOnCorridorHitProb = mergeOnCorridorHitProb;
      this.loopProb               = loopProb;
      
		// ---------------
		// Private methods
		// ---------------
		// initGen
		// -------
      this.initGen = function() {
      
      }
            
      // genRandomRoomAtDoorPos
      // ----------------------
      this.genRandomRoomAtPos = function(grid, doorDesiredPos, roomDir, seedNr, createEntrance) {
         // Set random room properties
         var roomDesiredWidth  = getRandomInt(this.minRoomWidth,  this.maxRoomWidth);
         var roomDesiredHeight = getRandomInt(this.minRoomHeight, this.maxRoomHeight);
         
         var doorNormal  = roomDir.normalize();
         var doorTangent = doorNormal.getClockwise();
         var roomAnchor  = doorDesiredPos;
         
         var roomOffSet = new Vector(
            Math.min(
               doorNormal.X * (roomDesiredWidth  - 1), 
               -Math.abs(doorTangent.X) * (getRandomInt(0, roomDesiredWidth - 1)),
               0
            ),
            Math.min(
               doorNormal.Y * (roomDesiredHeight - 1),
               -Math.abs(doorTangent.Y) * (getRandomInt(0, roomDesiredHeight - 1),
               0)
            )
         );
         
         var roomDesiredPos = doorDesiredPos.plus(roomOffSet);
         
         // Adjust the room to fit on the grid 
         // keeping its properties the closest to what they initially were
         var bestFit = Room.getBestFit(grid, 
                                       roomDesiredPos, 
                                       roomDesiredWidth, 
                                       roomDesiredHeight, 
                                       roomAnchor);
         
         // Try to create the room by asserting all generator constraints are met
         var room = this.tryToCreateRoom(grid, 
                                         bestFit.pos, 
                                         bestFit.width, 
                                         bestFit.height, 
                                         seedNr);
         
         if (room === null)
            return null;
            
         // Add some windows
         room.addRandomWindows(this.windowsOnlyOutside, this.windowProb);
         if (!createEntrance)
            return null;
         // Set the entrance (door, or empty)
         var doorTransDir  = doorNormal.mult(-1);
         
         var doorTransNorm = 0;
         if (doorNormal.X > 0)
            doorTransNorm = Math.abs(doorDesiredPos.X - room.MinCorner.X);
         else if (doorNormal.X < 0)
            doorTransNorm = Math.abs(doorDesiredPos.X - room.MaxCorner.X);
         else if (doorNormal.Y > 0)
            doorTransNorm = Math.abs(doorDesiredPos.Y - room.MinCorner.Y);
         else if (doorNormal.Y < 0)
            doorTransNorm = Math.abs(doorDesiredPos.Y - room.MaxCorner.Y);
            
         var doorTrans      = doorTransDir.mult(doorTransNorm);
         var doorPos        = doorDesiredPos.plus(doorTrans);
         var entranceDir    = grid.at(doorPos).getDirection(doorNormal.mult(-1));
         entranceDir.Border = getRandomElement(["door", null]);
      }
      
      // genRoom
      // -------
      this.genRoom = function(grid) {
         var pos = getRandomElement(grid.EmptyCoords);
         
         var room = this.genRandomRoomAtPos(grid,
                                            pos,
                                            getRandomElement(Grid.CardinalDirections),
                                            grid.getNewSeedNr(),
                                            false);
         
         if (room === null)
            return;
            
         this.createdSeedsCount++;
      }
      
      // genRoomRoom
      // -----------
      this.genRoomRoom = function(grid) {
         var startingCell = getRandomElement(grid.getAvailableCellsInRooms());
         var roomDir      = getRandomElement(startingCell.AvailableDirections);
         var roomPos      = roomDir.Destination;
         roomDir          = roomDir.toVector(); 
      
         this.genRandomRoomAtPos(
            grid,
            roomPos,
            roomDir,
            startingCell.SeedNr,
            true
         );
      }
      
      // genRoomCorridorRoom
      // -------------------
      this.genRoomCorridorRoom = function(grid) {
         var startingCell          = getRandomElement(grid.getAvailableCellsInRooms());
         var newCorridorDir        = getRandomElement(startingCell.AvailableDirections);
         var newCorridorPos        = newCorridorDir.Destination;
         var corridorDesiredLength = getRandomInt(this.corridorMinLength, this.corridorMaxLength);
         
         var doorOrEmpty = ["door", null];
         
         // Check available space on corridor path
         var corridorTest = Corridor.checkAvailableSpace(
            grid, 
            newCorridorPos, 
            newCorridorDir,
            corridorDesiredLength
         );
         
         // Get random merging options
         var mergeOnCorridorHit = getRandomBool(this.mergeOnCorridorHitProb);
         var loopAccepted       = getRandomBool(this.loopProb);
         
         // Check if we merge before instead of creating the room
         if (mergeOnCorridorHit
            && corridorTest.cellHit !== null
            && (corridorTest.cellHit.SeedNr != startingCell.SeedNr
               || loopAccepted)) {
            var possibleBorders = new Array();
            
            possibleBorders.push(null);
            
            if (corridorTest.cellHit.ParentDungeonPart instanceof Room)
               possibleBorders.push("door");
               
            newCorridorDir.Border = getRandomElement(possibleBorders);  
            
            // Check if we merge right away without creating the corridor
            if (corridorTest.length == 0)
               newCorridorDir.Border = getRandomElement(possibleBorders);
            else
               var newCorridor = grid.createCorridor(
                  newCorridorPos, 
                  newCorridorDir, 
                  corridorTest.length, 
                  startingCell.SeedNr, 
                  getRandomElement(doorOrEmpty), 
                  possibleBorders
               );
            
            // Check if seeds need to be merged
            if (corridorTest.cellHit.SeedNr != startingCell.SeedNr)
               grid.mergeSeeds(startingCell.SeedNr, corridorTest.cellHit.SeedNr);
               
            return;
         }
         
         var newRoomPos = newCorridorPos.plus(newCorridorDir.mult(corridorTest.length));
         var newRoomDir = newCorridorDir;
         
         var newRoom = this.genRandomRoomAtPos(
            grid,
            newRoomPos,
            newRoomDir,
            startingCell.SeedNr,
            true
         );
         
         if (newRoom === null)
            return;
            
         // Check if there is still place for the corridor after the room creation
         if (grid.at(newCorridorPos) !== null)
            return;
            
         // Create the corridor with a length of 1
         var corridor = grid.createCorridor(
            newCorridorPos, 
            newCorridorDir, 
            1, 
            startingCell.SeedNr, 
            getRandomElement(doorOrEmpty), 
            getRandomElement(doorOrEmpty)
         );
         
         // Try to expand it to the length originally tested
         corridor.expandTo(corridorTest.length);
      }
      
      // genCorridorRoom
      // ---------------
      this.genCorridorRoom = function(grid) {
         var availableCells = grid.getAvailableCellsInCorridors();
         
         if (availableCells.length === 0)
            return;
            
         var startingCell = getRandomElement(availableCells);
         var roomDir      = getRandomElement(startingCell.AvailableDirections);
         var roomPos      = roomDir.Destination;
         roomDir          = roomDir.toVector(); 
      
         this.genRandomRoomAtPos(
            grid,
            roomPos,
            roomDir,
            startingCell.SeedNr,
            true
         );
      }
      
      // genCorridorCorridorRoom
      // -----------------------
      this.genCorridorCorridorRoom = function(grid) {
         throw new Error("Undeveloped method");
      }
      
      // tryToCreateRoom
      // ---------------
      this.tryToCreateRoom = function(grid, pos, width, height, seedNr) {
         if (  width >= this.minRoomWidth 
            && width <= this.maxRoomWidth
            && height >= this.minRoomHeight 
            && height <= this.maxRoomHeight)
            return grid.createRoom(pos, width, height, seedNr);                  return null;
      }
   }
	
   // ---------
	// Accessors
	// ---------

   
	// ----------------
	// Method overrides
	// ----------------

   
	// -------------
	// Public method
	// -------------
	// generate
	// --------
   generate(grid, stopCheck, stopParams) {
      this.initGen();
      
      var i        = 0;
      
      while (!stopCheck(this.getGenState(grid, i), stopParams)) {
         var newSeed  = getRandomBool(this.newSeedProb);
         var genType  = getRandomElementWithProb(this.genTypeProbs);
         
         if (grid.RoomsCount === 0 || newSeed)
            this.genRoom(grid);
         else {
            switch (genType) {
               case "room-room":
                  this.genRoomRoom(grid);
                  break;
               case "room-corridor-room":
                  this.genRoomCorridorRoom(grid);
                  break;
               case "corridor-room":
                  this.genCorridorRoom(grid);
                  break;
               case "corridor-corridor-room":
                  this.genCorridorCorridorRoom(grid);
                  break;
               default:
                  console.warn(`Unexpected generation type: ${getType}`);
            }
         }
         
         i++;
      }
      console.log("Generation done! (nbr iterations: " + i + ")");
   }
}