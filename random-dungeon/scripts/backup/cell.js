var cellScriptLoaded = true;
// Check for scripts dependencies
if (typeof(baseClassScriptLoaded) == "undefined") { console.error("baseClass.js include is missing before cell.js include"); }
if (typeof(cellDirectionScriptLoaded) == "undefined") { console.error("cellDirection.js include is missing before cell.js include"); }

// -----------------------------------------------------------------------------
// Cell Class
// -----------------------------------------------------------------------------
class Cell extends BaseClass {
	// -----------
	// constructor
	// -----------
   constructor(x, y, grid) {
      super();
      
		// ---------------
		// Private members
		// ---------------
      this.pos  = new Vector(x, y);
      this.grid = grid;
      
      this.directions = new Array();
      
      this.directions.push(new CellDirection(-1, 0, this.pos, null, grid));
      this.directions.push(new CellDirection(1,  0, this.pos, null, grid));
      this.directions.push(new CellDirection(0, -1, this.pos, null, grid));
      this.directions.push(new CellDirection(0,  1, this.pos, null, grid));
      
      this.seedNr    = null;
      
		// ---------------
		// Private methods
		// ---------------
      
      
   }
   
	// ---------
	// Accessors
	// ---------
   // Pos
   // ---
   get Pos() { return this.pos; }
   // X
   // -
   get X() { return this.pos.X; }
   // Y
   // -
   get Y() { return this.pos.Y; }
   // Directions
   // ----------
   get Directions() { return this.directions; }
   // AvailableDirections
   // -------------------
   get AvailableDirections() {
      var grid   = this.grid;
      var seedNr = this.SeedNr;
      return Enumerable.From(this.Directions)
               .Where(function (d) { 
                     return grid.containsCoord(d.Destination) 
                        && (d.DestinationCell === null || d.DestinationCell.SeedNr != seedNr) 
                  })
               .ToArray();
   }
   // SeedNr
   // ------
   get SeedNr() { return this.seedNr; }
   set SeedNr(val) { this.seedNr = val; }
   // Available
   // ---------
   get Available() { 
      for (var i in this.Directions) {
         var direction = this.Directions[i];
         var dest = this.pos.plus(direction);
         
         if (!this.grid.containsCoord(dest))
            continue;
            
         if (direction.DestinationCell === null || direction.DestinationCell.SeedNr != this.SeedNr)
            return true;
      }
      
      return false;
   }
   
	// ----------------
	// Method overrides
	// ----------------
	// toString
	// --------
   toString() {
      return super.toString(false);
   }
   
	// --------------
	// Public methods
	// --------------
   // getDirection
   // ------------ 
   getDirection(arg1, arg2) {
      var ret = getXYFromMixedArgs(arg1, arg2);
      var x = ret.x;
      var y = ret.y;
      
      return Enumerable.From(this.directions).Where(function(d) { return d.X == x && d.Y == y }).FirstOrDefault(null);
   }
   
	// renderHTML
	// ----------
   renderHTML(width, height, fullCell) {
      if (typeof(fullCell) == "undefined")
         fullCell = false;
         
      var showBottom = (fullCell || this.getDirection(0,1).DestinationCell == null);
      var showRight  = (fullCell || this.getDirection(1,0).DestinationCell == null);
      
      var topBorder    = this.getDirection(0,-1).Border || "";
      var bottomBorder = this.getDirection(0, 1).Border || "";
      var leftBorder   = this.getDirection(-1,0).Border || "";
      var rightBorder  = this.getDirection(1, 0).Border || "";
      
      return `<table id="cell-${this.X}-${this.Y}" class="dg-cell" style="top: ${this.Y * height}px; left: ${this.X * width}px;">
         <tr>
            <td class="dg-cell-top-left wall"></td>
            <td class="dg-cell-top-center ${topBorder}"></td>
            <td class="dg-cell-top-right wall ${showRight ? '' : 'hide'}"></td>
         </tr>
         <tr>
            <td class="dg-cell-middle-left ${leftBorder}"></td>
            <td class="dg-cell-middle-center"></td>
            <td class="dg-cell-middle-right ${rightBorder} ${showRight ? '' : 'hide'}"></td>
         </tr>
         <tr class="${showBottom ? '' : 'hide'}">
            <td class="dg-cell-bottom-left wall"></td>
            <td class="dg-cell-bottom-center ${bottomBorder}"></td>
            <td class="dg-cell-bottom-right wall ${showRight ? '' : 'hide'}"></td>
         </tr>
      </table>`;
   }
   
	// renderASCIITop
	// --------------
   renderASCIITop() {
      var topBorder = this.getDirection(0,-1).Border;
      
      return (topBorder == "wall" ? "+---+" : (topBorder == "window" ? "+-.-+" : (topBorder == "door" ? "+- -+" : "+   +")));
   }
   
	// renderASCIIMiddle1
	// ------------------
   renderASCIIMiddle1() {
      var leftBorder   = this.getDirection(-1,0).Border;
      var rightBorder  = this.getDirection(1, 0).Border;
      
      var ascii = "";
      
      ascii = ascii + (leftBorder == "wall" ? "|" : (leftBorder == "window" ? "|" : (leftBorder == "door" ? "|" : " ")));
      ascii = ascii + "   ";
      ascii = ascii + (rightBorder == "wall" ? "|" : (rightBorder == "window" ? "|" : (rightBorder == "door" ? "|" : " ")));
      
      return ascii;
   }
   
	// renderASCIIMiddle2
	// ------------------
   renderASCIIMiddle2() {
      var leftBorder   = this.getDirection(-1,0).Border;
      var rightBorder  = this.getDirection(1, 0).Border;
      
      var ascii = "";
      
      ascii = ascii + (leftBorder == "wall" ? "|" : (leftBorder == "window" ? "." : (leftBorder == "door" ? " " : " ")));
      ascii = ascii + (this.SeedNr < 100 ? " " : "") + this.SeedNr + (this.SeedNr < 10 ? " " : "");
      ascii = ascii + (rightBorder == "wall" ? "|" : (rightBorder == "window" ? "." : (rightBorder == "door" ? " " : " ")));
      
      return ascii;
   }
   
	// renderASCIIMiddle3
	// ------------------
   renderASCIIMiddle3() {
      var leftBorder   = this.getDirection(-1,0).Border;
      var rightBorder  = this.getDirection(1, 0).Border;
      
      var ascii = "";
      
      ascii = ascii + (leftBorder == "wall" ? "|" : (leftBorder == "window" ? "|" : (leftBorder == "door" ? "|" : " ")));
      ascii = ascii + "   ";
      ascii = ascii + (rightBorder == "wall" ? "|" : (rightBorder == "window" ? "|" : (rightBorder == "door" ? "|" : " ")));
      
      return ascii;
   }
   
	// renderASCIIBottom
	// -----------------
   renderASCIIBottom() {
      var bottomBorder = this.getDirection(0, 1).Border;
      
      return (bottomBorder == "wall" ? "+---+" : (bottomBorder == "window" ? "+-.-+" : (bottomBorder == "door" ? "+- -+" : "+   +")));
   }
}