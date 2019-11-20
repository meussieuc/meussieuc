var vectorScriptLoaded = true;// Check for scripts dependenciesif (typeof(baseClassScriptLoaded) == "undefined") { console.error("baseClass.js include is missing before vector.js include"); }// -----------------------------------------------------------------------------// Vector Class// -----------------------------------------------------------------------------class Vector extends BaseClass {	// -----------	// constructor	// -----------   constructor(x, y) {      super();      		// ---------------		// Private members		// ---------------      this.x = x;      this.y = y;      		// ---------------		// Private methods		// ---------------         }		// ---------	// Accessors	// ---------   // X   // -   get X() { return this.x; }   // Y   // -   get Y() { return this.y; }   // Norm   // ----   get Norm() { return Math.sqrt(Math.pow(this.X, 2) + Math.pow(this.X, 2)); }   	// ----------------	// Method overrides	// ----------------   	// --------------	// Public methods	// --------------   // toVector   // --------   toVector() {      return new Vector(this.X, this.Y);   }   // plus   // ----   plus(vector) {      return new Vector(this.X + vector.X, this.Y + vector.Y);   }      // minus   // -----   minus(vector) {      return new Vector(this.X - vector.X, this.Y - vector.Y);   }      // mult   // ----   mult(scalar) {      return new Vector(this.X * scalar, this.Y * scalar);   }      // div   // ---   div(scalar) {      return new Vector(this.X / scalar, this.Y / scalar);   }      // isNormal   // --------   isNormal() {      return (this.Norm == 1);   }      // normalize   // ---------   normalize() {      return this.div(this.Norm);   }}