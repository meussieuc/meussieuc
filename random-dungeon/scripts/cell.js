// -----------------------------------------------------------------------------
// Cell Class
// -----------------------------------------------------------------------------
class Cell extends BaseClass {
	// -----------
	// constructor
	// -----------
   constructor(x, y, grid) {
      super();
      
      var pos = new Vector(x, y);
      
      if (!grid.containsCoord(pos))
         throw new Error("New cell is outside of the grid");
      
		// ---------------
		// Private members
		// ---------------
      this.pos               = pos;
      this.grid              = grid;
      this.seedNr            = null;
      this.parentDungeonPart = null;
      this.directions        = new Array();
      
      this.directions.push(new CellDirection(-1, 0, this.pos, null, grid));
      this.directions.push(new CellDirection(1,  0, this.pos, null, grid));
      this.directions.push(new CellDirection(0, -1, this.pos, null, grid));
      this.directions.push(new CellDirection(0,  1, this.pos, null, grid));
      
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
   // ParentDungeonPart
   // -----------------
   get ParentDungeonPart() { return this.parentDungeonPart; }
   set ParentDungeonPart(val) { 
      if (!(val instanceof DungeonPart))
         throw new Error("ParentDungeonPart must be instance of DungeonPart");
         
      this.parentDungeonPart = val; 
   }
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
   
   // getBorderOnDirection
	// --------------------
   getBorderOnDirection(direction) {
      var cellDirection = null;
      
      // Suppose direction points to a cardinal adjacent cell
      if (direction instanceof CellDirection)
         cellDirection = direction;
      else
         cellDirection = this.getDirection(direction);
      
      if (cellDirection !== null)
         return cellDirection.Border;
         
      // At this point, direction is sure to not point to a cardinal adjacent cell
        
      // Assert the direction points to a diagonal adjacent cell
      if (direction.X == 0 || direction.Y == 0)
         throw new Error("Direction must point to an adjacent cell");
      
      // Check on the border on the X projection
      if (this.getBorderOnDirection(new Vector(direction.X, 0)) !== null)
         return "wall";
      
      // Check on the border on the Y projection
      if (this.getBorderOnDirection(new Vector(0, direction.Y)) !== null)
         return "wall";
      
      var destinationCell = null;
      
      // Check on the X adjacent cell
      cellDirection   = this.getDirection(direction.X, 0);
      destinationCell = cellDirection   === null ? null : cellDirection.DestinationCell;   
      
      if (destinationCell !== null
         && destinationCell.getBorderOnDirection(new Vector(0, direction.Y)) !== null)
         return "wall";
         
      // Check on the Y adjacent cell
      cellDirection   = this.getDirection(0, direction.Y);
      destinationCell = cellDirection === null ? null : cellDirection.DestinationCell;   
      
      if (destinationCell !== null
         && destinationCell.getBorderOnDirection(new Vector(direction.X, 0)) !== null)
         return "wall";
      
      // Check on the diagonal adjacent cell
      destinationCell = this.grid.at(this.Pos.plus(direction));
      
      if (destinationCell === null)
         return null;
      
      // On the X axis
      if (destinationCell.getBorderOnDirection(new Vector(-direction.X, 0)) !== null)
         return "wall";
      
      // On the Y axis
      if (destinationCell.getBorderOnDirection(new Vector(0, -direction.Y)) !== null)
         return "wall";
      
      return null;
   }
   
	// renderHTML
	// ----------
   renderHTML(width, height, fullCell) {
      if (typeof(fullCell) == "undefined")
         fullCell = false;
         
      var showBottom = (fullCell || this.getDirection(0,1).DestinationCell == null);
      var showRight  = (fullCell || this.getDirection(1,0).DestinationCell == null);
      
      var topBorder    = this.getBorderOnDirection(new Vector( 0,-1)) || "";
      var bottomBorder = this.getBorderOnDirection(new Vector( 0, 1)) || "";
      var leftBorder   = this.getBorderOnDirection(new Vector(-1, 0)) || "";
      var rightBorder  = this.getBorderOnDirection(new Vector( 1, 0)) || "";
      
      var topLeftBorder     = this.getBorderOnDirection(new Vector(-1,-1)) || "";
      var topRightBorder    = this.getBorderOnDirection(new Vector( 1,-1)) || "";
      var bottomLeftBorder  = this.getBorderOnDirection(new Vector(-1, 1)) || "";
      var bottomRightBorder = this.getBorderOnDirection(new Vector( 1, 1)) || "";
      
      var light = "";
      var light = light + (topBorder    === "window" ? " light-top"    : "");
      var light = light + (bottomBorder === "window" ? " light-bottom" : "");
      var light = light + (leftBorder   === "window" ? " light-left"   : "");
      var light = light + (rightBorder  === "window" ? " light-right"  : "");
      
      return `<table id="cell-${this.X}-${this.Y}" class="dg-cell" style="top: ${this.Y * height}px; left: ${this.X * width}px;">
         <tr>
            <td class="dg-cell-top-left ${topLeftBorder}"></td>
            <td class="dg-cell-top-center ${topBorder}"></td>
            <td class="dg-cell-top-right ${topRightBorder} ${showRight ? '' : 'hide'}"></td>
         </tr>
         <tr>
            <td class="dg-cell-middle-left ${leftBorder}"></td>
            <td class="dg-cell-middle-center ${light}"></td>
            <td class="dg-cell-middle-right ${rightBorder} ${showRight ? '' : 'hide'}"></td>
         </tr>
         <tr class="${showBottom ? '' : 'hide'}">
            <td class="dg-cell-bottom-left ${bottomLeftBorder}"></td>
            <td class="dg-cell-bottom-center ${bottomBorder}"></td>
            <td class="dg-cell-bottom-right ${bottomRightBorder} ${showRight ? '' : 'hide'}"></td>
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