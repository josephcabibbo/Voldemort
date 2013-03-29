/*  -------------------------------------------------------------------------------------
 *	Filename: errors-warnings.js
 *	Author: Joey Cabibbo
 *	Requires: parser.js, outputManager.js
 *	Description: A collection of common errors and warnings for use throughout compilation
 *	-------------------------------------------------------------------------------------- */

//
// Warnings
//

//
// Parse Warnings
//

function unusedVariableWarning(symbol, scope)
{
	// Get the scope specific symbol table entry
	var symbolTableEntry = _SymbolTableList[scope][symbol];

	// Warn user
	_OutputManager.addWarning("Variable, " + symbol + ", on line " + symbolTableEntry.line + " is declared but unused.")
}

//
// Errors
//

//
// Parse Errors
//

// Helper function to perform necessary tasks when an invalid statement error occurs
function invalidStatementError()
{
	_OutputManager.addError("Parse Error: invalid statement on line " + _Parser.tokens[_Parser.currentIndex].line + ", expecting a print, Id, Type, or {...");
    _OutputManager.addTraceEvent("Expecting token print, Id, Type, or {");
    _OutputManager.addTraceEvent("Expected token, print, Id, Type, or {, not found", "red");
    _Parser.errorCount++;
    _Parser.currentIndex++; // Consume invalid token
}

// Helper function to perform necessary tasks when an invalid expr error occurs
function invalidExprError()
{
	_OutputManager.addError("Parse Error: invalid expression on line " + _Parser.tokens[_Parser.currentIndex].line + ", expecting an IntExpr, StringExpr, or Id...");
	_OutputManager.addTraceEvent("Expecting token int, char, or Id");
	_OutputManager.addTraceEvent("Expected token, int, char, or Id, not found", "red");
	_Parser.errorCount++;
	_Parser.currentIndex++; // Consume invalid token
}

// Helper function to perform necessary tasks when a token mismatch error occurs
function tokenMismatchError(expectedTokenKind)
{
	_OutputManager.addTraceEvent("'" + expectedTokenKind + "' not found...", "red");
	_OutputManager.addError("Parse Error: token mismatch on line " + _Parser.tokens[_Parser.currentIndex].line + ", expecting token '" + expectedTokenKind + "'");
	_Parser.errorCount++;
	_Parser.currentIndex++; // Consume invalid token
}

// Helper function to perform necessary tasks when an undeclared variable error occurs
// Take the undeclared variable and the line it is on as parameters to report to the user
function undeclaredVariableError(undeclaredVar, line)
{
	_OutputManager.addError("Parse Error: assignment attempted on undeclared variable, " + undeclaredVar + ", found on line " + line);
	_OutputManager.addTraceEvent("Found undeclared variable in assignment statement", "red");
	_Parser.errorCount++;
}

// Helper function to perform necessary tasks when an redeclared variable error occurs
// Take the redeclard variable and the line it is on as parameters to report to the user
function redeclaredVariableError(redeclaredVar, line)
{
	_OutputManager.addError("Parse Error: attempted redeclaration of variable, " + redeclaredVar + ", on line " + line);
	_OutputManager.addTraceEvent("Found redeclared variable in VarDecl statement", "red");
	_Parser.errorCount++;
}