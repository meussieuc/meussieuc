var corridorScriptLoaded = true;// Check for scripts dependenciesif (typeof(baseClassScriptLoaded) == "undefined") { console.error("baseClass.js include is missing before corridor.js include"); }if (typeof(cellScriptLoaded)      == "undefined") { console.error("cell.js include is missing before corridor.js include"); }if (typeof(mainScriptLoaded)      == "undefined") { console.error("main.js include is missing before corridor.js include"); }// -----------------------------------------------------------------------------// Corridor Class// -----------------------------------------------------------------------------class Corridor extends BaseClass {	// -----------	// constructor	// -----------   constructor(pos, dir, length, seedNr, startingBorder, endingBorder, grid) {      super();            if (dir === null)         throw new Error("Direction can't be null");               if (length < 1)         throw new Error("Corridor length must be at least 1");      		// ---------------		// Private members		// ---------------      this.pos            = pos.toVector();      this.dir            = dir.toVector();      this.length         = length;      this.startingBorder = startingBorder;      this.endingBorder   = endingBorder;      this.grid           = grid;      this.cells          = new Array();      		// ---------------		// Private methods		// ---------------      // adjustBorders      // -------------      this.adjustBorders = function(cell, originDir) {         // Surround the cell by walls         for (var i in cell.Directions)            cell.Directions[i].Border = "wall";                     // Remove the wall from the origin direction         if (originDir !== null)            cell.getDirection(originDir).Border = null;                     // Set the starting border         if (objValsEqual(cell.Pos, this.StartPos))            cell.getDirection(this.Dir.mult(-1)).Border = this.StartingBorder;                     // Set the ending border         if (objValsEqual(cell.Pos, this.EndPos))            cell.getDirection(this.Dir).Border = this.EndingBorder;      }            // createMissingCells      // ------------------      this.createMissingCells = function(seedNr) {                  var startingIndex = this.cells.length;         var endingIndex   = this.Length - 1;                  // Check if all the cells are free         for (var i = startingIndex; i <= endingIndex; i++) {            var cellPos = this.Pos.plus(this.Dir.mult(i));                        if (!this.grid.containsCoord(cellPos))               throw new Error("Corridor is outside of the grid");                           if (this.grid.at(cellPos) !== null)               throw new Error("Not all cells are free");         }                  // Create them         for (var i = startingIndex; i <= endingIndex; i++) {            var cell    = this.grid.createCellAt(this.Pos.plus(this.Dir.mult(i)));            cell.SeedNr = seedNr;                        this.adjustBorders(cell, this.Dir.mult(-1));                           this.cells.push(cell);         }      }            this.createMissingCells(seedNr);   }		// ---------	// Accessors	// ---------   // Pos   // ---   get Pos() { return this.pos; }   // Dir   // ---   get Dir() { return this.dir; }   set Dir(val) {       if (dir === null)         throw new Error("Direction can't be null");               if (this.Length > 1)         throw new Error("Cannot change corridor direction");               if (!val.isNormal()) {         val.normalize();         console.warn("Direction set was not normal. It has been normalized");      }               this.dir = val;             this.adjustBorders(this.cells[0], direction.mult(-1));   }   // Length   // ------   get Length() { return this.length; }   set Length(val) {       var lastLength = this.length;      var newLength  = val;            if (val == this.length)         return;               if (val < this.length)         throw new Error("Cannot shorten corridor");            this.length = val;                this.createMissingCells(this.SeedNr);   }   // SeedNr   // ------   get SeedNr() { return this.cells[0].seedNr; }   set SeedNr(val) {       for (var i in this.cells)         this.cells[i].seedNr = val;   }   // StartingBorder   // --------------   get StartingBorder() { return this.startingBorder; }   set StartingBorder(val) {       this.startingBorder = val;      this.adjustBorders(this.cells[0], this.Dir.mult(-1));   }   // EndingBorder   // ------------   get EndingBorder() { return this.endingBorder; }   set EndingBorder(val) {       this.endingBorder = val;      this.adjustBorders(this.cells[this.cells.length-1], this.Dir.mult(-1));   }   // StartPos   // --------   get StartPos() { return this.Pos; }   // EndPos   // ------   get EndPos() { return this.Pos.plus(this.Dir.mult(this.Length - 1)); }   	// ----------------	// Method overrides	// ----------------   	// --------------	// Public methods	// --------------      // expandTo   // --------   expandTo(desiredLength) {      var pos = this.EndPos;            while (this.Length < desiredLength) {         var pos = pos.plus(this.Dir);                  // check if we hit the grid borders (stop here if so)         if (!this.grid.containsCoord(pos))            return { hit: true, hitGridLimit: true, cellHit: null };                  // check if we hit an other cell         var targetCell = this.grid.at(pos);         if (targetCell !== null)            return { hit: true, hitGridLimit: false, cellHit: targetCell };                     // No hit: Expand corridor by 1         this.Length++;      }            return { hit: false, hitGridLimit: false, cellHit: null };   }}