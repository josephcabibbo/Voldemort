/*  ---------------------------------------------------------------------------
 *	Filename: parser.js
 *	Author: Joey Cabibbo
 *	Requires: globals.js, outputManager.js, tree.js
 *	Description: A recursive-descent parser that creates a concrete syntax tree
 *				 and builds a symbol table per scope
 *  Notes: It should be known that some assumptions are made about the location
 *		   of tokens when building the symbol table.  If there is a parse error
 *		   the assumptions are probably wrong and the symbol table is discarded
 *	--------------------------------------------------------------------------- */

function Parser()
{
	// Stream of tokens
	this.tokens = [];
	// Current token index
	this.currentIndex = 0;
	// Number of errors found
	this.errorCount = 0;
	// Concrete syntax tree we are creating
	this.cst = {};
	// The scope envirentment
	this.scope = 0;

	// General parse call, initializes and starts the recursive descent parse
    this.parse = function()
    {
    	// Reset parse's members
    	this.tokens = [];
    	this.cst = new Tree();
    	this.currentIndex = 0;
    	this.errorCount = 0;
    	this.scope = 0;

    	// Get the stream of tokens from the Lexer
    	this.tokens = _Lexer.tokenList;

    	// Start the parse
        this.parseProgram();

        // Determine if it was a successful parse or a failure
        if(this.errorCount === 0)
        {
	        _OutputManager.addTraceEvent("Parse successful!", "green");
	        // Display the symbol tables
	        _OutputManager.updateSymbolTable();
	        return true;
        }
        else
        {
	        _OutputManager.addTraceEvent("Parse failed!", "red");
	        // Erase the CST and symbol tables because they may be incorrect
	        this.cst = {};
	        _SymbolTableList = [];
	        return false;
        }
    }

    // Parse the Program production
    // Statement $
    this.parseProgram = function()
    {
    	// Add Program to the cst
        this.cst.addNode("Program", "branch");

        this.parseStatement();

        // If there is another statement, the user should be alerted that multiple statements must be in a statement list
	    if(isStatement(this.tokens[this.currentIndex].kind))
	    {
	    	_OutputManager.addError("Multiple statements must be contained in a StatementList...  Please consult the language grammar.");
	    	this.errorCount++;
	    }

    	this.matchToken(TOKEN_EOF);
    }

    // Parse a single Statement production
    // P ( Expr )
    // Id = Expr
    // VarDecl
    // { StatementList }
    this.parseStatement = function()
    {
    	// Add a Statement to the cst
    	this.cst.addNode("Statement", "branch");

    	// Determine which statement we have and parse accordingly
        switch(this.tokens[this.currentIndex].kind)
        {
	        case TOKEN_PRINT:		this.parsePrint();
	        						break;

	        case TOKEN_ID:			this.parseAssignment();
	        						break;

	        case TOKEN_TYPE:	 	this.parseVarDecl();
	        						break;

	        case TOKEN_OPENBRACKET: this.matchToken(TOKEN_OPENBRACKET);
	        						// { indicates we are entering a new scope environment
	        						this.scope++;
	        						this.parseStatementList();
	        						this.matchToken(TOKEN_CLOSEBRACKET);
	        						// } indicates we are leaving the current scope environment
	        						this.scope--;
	        						// Signify the end of a tree "branch"
	        						this.cst.endChildren();
	        						break;

	        // Invalid statement token
	        default: _OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line + ", expecting a print, Id, Type, or {...");
	        		 _OutputManager.addTraceEvent("Expecting token print, Id, Type, or {");
	        		 _OutputManager.addTraceEvent("Expected token, print, Id, Type, or {, not found", "red");
	        		 this.errorCount++;
	        		 this.currentIndex++; // Move to the next token
	        		 break;
        }
    }

    // Parse a Print production
    // P ( Expr )
    this.parsePrint = function()
    {
    	this.matchToken(TOKEN_PRINT);
        this.matchToken(TOKEN_OPENPAREN);
        this.parseExpr();
        this.matchToken(TOKEN_CLOSEPAREN);

        // Signify the end of a tree "branch"
        this.cst.endChildren();
    }

    // Parse an Assignment production
    // Id = Expr
    this.parseAssignment = function()
    {
    	var id = this.tokens[this.currentIndex].name;
    	var line = this.tokens[this.currentIndex].line;

	    this.matchToken(TOKEN_ID);
	    this.matchToken(TOKEN_ASSIGN);
	    // The value of this id will be returned via parseExpr
	    var expr = this.parseExpr();

	    // If the id has been declared in this scope, add the value
	    // Otherwise show the user an erro that this id is not declared
	    if(_SymbolTableList[this.scope] && _SymbolTableList[this.scope].hasOwnProperty(id))
	    {
	    	_SymbolTableList[this.scope][id].value = expr;
	    }
	    else
	    {
		    undeclaredVariableError(id, line); // Helper function below
	    }

	    // Signify the end of a tree "branch"
        this.cst.endChildren();
    }

    // Parse a VarDecl production
    // Type Id
    this.parseVarDecl = function()
    {
	    this.matchToken(TOKEN_TYPE);
	    this.matchToken(TOKEN_ID);

	    // Get the Id and Type tokens we just matched and get the line they are on
	    var id   = this.tokens[this.currentIndex - 1].name;
	    var type = this.tokens[this.currentIndex - 2].value;
	    var line = this.tokens[this.currentIndex - 1].line;

	    // If the current scope object has not been initialized yet, initialize it
	    if(!_SymbolTableList[this.scope])
	    	_SymbolTableList[this.scope] = {};

	    // If a variable of the same id and scope exists already
	    if(_SymbolTableList[this.scope].hasOwnProperty(id))
	    {
	    	redeclaredVariableError(id, line); // Helper function below
 	    }
	    else
	    {
		    // Add all known data to this scope's symbol table (format is id : {information})
		    _SymbolTableList[this.scope][id] = {"type": type, "line": line, "scope": this.scope};
	    }

	    // Signify the end of a tree "branch"
        this.cst.endChildren();
    }

    // Parse a StatementList production (where the recursive magic happens)
    // { Statement StatementList }
    // { ε } // aka nothing
    this.parseStatementList = function()
    {
	    // Look-ahead to determine which production we need
	    if(isStatement(this.tokens[this.currentIndex].kind))
	    {
		    this.parseStatement();

		    // Look-ahead to determine if we need to recurse on StatementList (more statements exist)
		    if(isStatement(this.tokens[this.currentIndex].kind))
	    	{
		    	this.parseStatementList();
	    	}
	    }
	    else if(this.tokens[this.currentIndex].kind === TOKEN_CLOSEBRACKET)
	    {
		    // ε production aka do nothing
	    }
	    else
	    {
		    // Invalid statement
		    _OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line + ", expecting a print, Id, Type, or {...");
	        _OutputManager.addTraceEvent("Expecting token print, Id, Type, or {");
	        _OutputManager.addTraceEvent("Expected token, print, Id, Type, or {, not found", "red");
	        this.errorCount++;
	        this.currentIndex++; // Consume invalid token
	    }
    }

    // Parse an Expr production
    // IntExpr
    // StringExpr
    // Id
    this.parseExpr = function()
    {
    	// Add an Expr to the cst
    	this.cst.addNode("Expr", "branch");

    	// The expression to return to varDecl
    	var expr;

    	// Determine which expr we have and parse accordingly
        switch(this.tokens[this.currentIndex].kind)
        {
	        case TOKEN_INT:		expr = concatenateIntExpr(this.currentIndex); // Must be called before parseIntExpr in order to get the correct index
	        					this.parseIntExpr();
	        					break;

	        case TOKEN_STRING:	this.parseStringExpr();
	        					// Assign the string as the expr value
	        					expr = this.tokens[this.currentIndex - 1].value
	        					break;

	        case TOKEN_ID:		this.matchToken(TOKEN_ID);
	        					// Assign the id as the expr value
	        					expr = this.tokens[this.currentIndex - 1].name;
	        					break;

	        // Invalid expression
	        default: _OutputManager.addError("ParseError: invalid expression on line " + this.tokens[this.currentIndex].line + ", expecting an IntExpr, StringExpr, or Id...");
	        		 _OutputManager.addTraceEvent("Expecting token int, char, or Id");
	        		 _OutputManager.addTraceEvent("Expected token, int, char, or Id, not found", "red");
	        		 this.errorCount++;
	        		 this.currentIndex++; // Consume the invalid token
	        		 break;
        }

        // Signify the end of a tree "branch"
        this.cst.endChildren();

        return expr;
    }

    // Parse an IntExpr production
    // int
    // int op Expr
    this.parseIntExpr = function()
    {
        this.matchToken(TOKEN_INT);

        // Look-ahead to determine which production we need
        if(this.tokens[this.currentIndex].kind === TOKEN_OP)
        {
	        this.matchToken(TOKEN_OP)
	        this.parseExpr();
        }
    }

    // Parse a CharExpr production
    // " CharList "
    this.parseStringExpr = function()
    {
        this.matchToken(TOKEN_STRING);
    }

    // Function to determine if the expected token is a match to the actual token
    // ** Increments the this.currentIndex (consumes the token) **
    this.matchToken = function(expectedTokenKind)
    {
    	// Trace expecting token...
    	_OutputManager.addTraceEvent("Expecting token '" + expectedTokenKind + "'...");

    	// Determine if we have a match
    	if(this.tokens[this.currentIndex].kind === expectedTokenKind)
    	{
        	// Token found
        	_OutputManager.addTraceEvent("Found token '" + expectedTokenKind + "'!", "green");
        	// Add non-terminal to the cst
        	this.cst.addNode(this.tokens[this.currentIndex], "leaf");
        	// Consume token
        	this.currentIndex++;
    	}
    	else
    	{
    		// Token not found
	    	_OutputManager.addTraceEvent("'" + expectedTokenKind + "' not found...", "red");
	    	_OutputManager.addError("Parse Error: token mismatch on line " + this.tokens[this.currentIndex].line + ", expecting token '" + expectedTokenKind + "'");
	    	// Increment the error count
	    	this.errorCount++;
	    	// Consume token
	    	this.currentIndex++;
    	}
    }
}

//
//	Helper Functions
//

// Helper function to determine if the next token is the start of a statement
function isStatement(tokenKind)
{
	return tokenKind === TOKEN_PRINT 		||
		   tokenKind === TOKEN_ID	 		||
		   tokenKind === TOKEN_TYPE  		||
		   tokenKind === TOKEN_OPENBRACKET;
}

// Helper function to perform necessary tasks when an undeclared variable error occurs
// Take the undeclared variable and the line it is on as parameters to report to the user
function undeclaredVariableError(undeclaredVar, line)
{
	_OutputManager.addError("ParseError: assignment attempted on undeclared variable, " + undeclaredVar + ", found on line " + line);
	_OutputManager.addTraceEvent("Found undeclared variable in assignment statement", "red");
	this.errorCount++;
}

// Helper function to perform necessary tasks when an redeclared variable error occurs
// Take the redeclard variable and the line it is on as parameters to report to the user
function redeclaredVariableError(redeclaredVar, line)
{
	_OutputManager.addError("ParseError: attempted redeclaration of variable, " + redeclaredVar + ", on line " + line);
	_OutputManager.addTraceEvent("Found redeclared variable in VarDecl statement", "red");
	this.errorCount++;
}

// Helper function that taked the first index of an arbitrarily long IntExpr and concatenates it for value assignment
function concatenateIntExpr(index)
{
	// The string int expression return value
	var exprString = "";

	// Get the first token of the IntExpr
	var currentToken = _Parser.tokens[index];

	// If the token is an int, op, or id, concatenate it as one string
	while(currentToken.kind === TOKEN_INT || currentToken.kind === TOKEN_OP || currentToken.kind === TOKEN_ID)
	{
		// Integers and Ops have immediate values, ids have names (values determined at runtime)
		if(currentToken.kind === TOKEN_INT || currentToken.kind === TOKEN_OP)
			exprString += currentToken.value; // Int or Op
		else
			exprString += currentToken.name;  // Id
		// Increment to get the next token
		currentToken = _Parser.tokens[++index];
	}

	// Not very crazy about all the madness in this helper function, so it may be temporary
	// Make sure we did not catch any additional tokens part of the next statement that matched our case (int, op, or Id) by mistake
	// a = 5 b = 5 would result in a having a value of 5b without this regex match
	exprString = exprString.match(/[0-9]{1}([+-]{1}[a-z0-9]{1})*/)[0];
	/*
	 * [0-9]{1} 			 - we know an IntExpr must start with one digit
	 * ([+-]{1}[a-z0-9]{1})* - an IntExpr can optionally be followed by an op(+|-) and either a digit or id
	 */

	 // If the exprString is only digits and ops (no Ids), we can evaluate it and return an int representation rather than returning a long string expression
	if(/^[0-9+-]+$/.test(exprString))
		return eval(exprString).toString();

	return exprString;
}