/*  ---------------------------------------------------------------------------
 *	Filename: parser.js
 *	Author: Joey Cabibbo
 *	Requires: globals.js, outputManager.js, tree.js
 *	Description: A recursive-descent parser that takes the token list to check
 *				 that we have correct statements and creates the symbol table
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
	// Reference to the number of errors found
	this.errorCount = 0;
	// The scope manager
	this.scopeManager = new ScopeManager();

	// General parse call, initializes and starts the recursive descent parse
    this.parse = function()
    {
    	// Reset parse's members
    	this.tokens = [];
    	this.currentIndex = 0;
    	this.errorCount = 0;
    	this.scopeManager = new ScopeManager();

    	// Get the stream of tokens from the Lexer
    	this.tokens = _Lexer.tokenList;

    	// Start the parse
        this.parseProgram();

        // Check for declared but uninitialized variables
        checkForUninitializedVariables();
        // Check for variables that have not been unused
        checkForUnusedVariables();

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
	        // Erase the symbol tables because they may be incorrect
	        _SymbolTableList = [];
	        return false;
        }
    }

    // Parse the Program production
    // Statement $
    this.parseProgram = function()
    {
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
    	// Determine which statement we have and parse accordingly
        switch(this.tokens[this.currentIndex].kind)
        {
	        case TOKEN_PRINT:		this.parsePrint();
	        						break;

	        case TOKEN_ID:			this.parseAssignment();
	        						break;

	        case TOKEN_TYPE:	 	this.parseVarDecl();
	        						break;

	        case TOKEN_OPENBRACKET: this.matchToken(TOKEN_OPENBRACKET); // Entering a new scope environment
	        						this.scopeManager.initializeNewScope();
	        						this.parseStatementList();
	        						this.matchToken(TOKEN_CLOSEBRACKET); // Leaving the current scope environment
	        						this.scopeManager.leaveCurrentScope();
	        						break;

	        // Invalid statement token
	        default: invalidStatementError(); // Found in errors-warnings.js
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

	    // Get the current scope
	    var scope = this.scopeManager.currentScope;

	    // If the id has been declared in this scope, add the value and mark as "used"
	    // Otherwise it is an undeclared variable
	    if(_SymbolTableList[scope] && _SymbolTableList[scope].hasOwnProperty(id))
	    {
	    	_SymbolTableList[scope][id].value  = expr;
	    	_SymbolTableList[scope][id].isUsed = true;
	    }
	    else
	    {
		    undeclaredVariableError(id, line); // Found in errors-warnings.js
	    }
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

	    // Get the current scope
	    var scope = this.scopeManager.currentScope;

	    // If the current scope object has not been initialized yet, initialize it.
	    // This would only be the case when this varDecl is not in a statement list
	    if(!_SymbolTableList[scope])
	    	_SymbolTableList[scope] = {};

	    // If a variable of the same id and scope exists already it is being redeclared (error)
	    if(_SymbolTableList[scope].hasOwnProperty(id))
	    {
	    	redeclaredVariableError(id, line); // Found in errors-warnings.js
 	    }
	    else
	    {
		    // Add all data known at this point to this scope's symbol table (format is id : {information})
		    _SymbolTableList[scope][id] = {"type": type, "line": line, "scope": scope, "isUsed": false};
		    // Display it in the trace
		    _OutputManager.addTraceEvent("Added identifier '" + id + "' to the symbol table in scope " + scope);
	    }
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
		    // Invalid statement token
		    invalidStatementError(); // Found in errors-warnings.js
	    }
    }

    // Parse an Expr production
    // IntExpr
    // StringExpr
    // Id
    this.parseExpr = function()
    {
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
	        					// Get the id we just matched
	        					var id = this.tokens[this.currentIndex - 1].name
	        					// Assign the id as the expr value
	        					expr = id;
	        					// Mark the id as used (if not done so already)
	        					_SymbolTableList[this.scopeManager.currentScope][id].isUsed = true;
	        					break;

	        // Invalid expression
	        default: invalidExprError(); // Found in errors-warnings.js
	        		 break;
        }

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

    // Parse a StringExpr production
    // " CharList "
    this.parseStringExpr = function()
    {
        this.matchToken(TOKEN_STRING);
    }

    // Function to determine if the expected token is a match to the actual token
    // ** Increments the currentIndex (consumes the token) **
    this.matchToken = function(expectedTokenKind)
    {
    	// Trace expecting token...
    	_OutputManager.addTraceEvent("Expecting token '" + expectedTokenKind + "'...");

    	// Determine if we have a match
    	if(this.tokens[this.currentIndex].kind === expectedTokenKind)
    	{
        	// Token found
        	_OutputManager.addTraceEvent("Found token '" + expectedTokenKind + "'!", "green");

        	// Consume token
        	this.currentIndex++;
    	}
    	else
    	{
    		// Token not found
	    	tokenMismatchError(expectedTokenKind); // Found in errors-warnings.js
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

// Helper function that takes the first index of an arbitrarily long IntExpr and concatenates it for value assignment
function concatenateIntExpr(index)
{
	// The string int expression return value
	var exprString = "";

	// Get the first token of the IntExpr
	var currentToken = _Parser.tokens[index];

	// The first token has to be an int so append and increment
	appendToken(currentToken);

	// At this point we can only append the pair of and op and something that follows so keep looping until that format fails
	while(currentToken.kind === TOKEN_OP)
	{
		// Append the op
		appendToken(currentToken);
		// Append whatever follows the op
		appendToken(currentToken);
	}

	// Internal function to append tokens to the exprString as long as they follow the
	// format [int] [op] [whatever, but hopefully and int or id or else its a semantic error]
	function appendToken(token)
	{
		// We want the name of an id not its value
		if(currentToken.kind === TOKEN_ID)
			exprString += currentToken.name;  // Id
		else
			exprString += currentToken.value;  // Integers, ops, and anything else

		// Increment to get the next token
		currentToken = _Parser.tokens[++index];
	}

	 // Return the expression
	 return exprString;
}

// Helper function to check the symbol table for declared but uninitialized variables
function checkForUninitializedVariables()
{
	// Iterate each scope's symbol table
	for(var i = 0; i < _SymbolTableList.length; i++)
	{
		// Iterate each symbol in the scope's symbol table
		for(symbol in _SymbolTableList[i])
		{
			// If the symbol table entry exists and has no value, it is uninitialized.  Warn the user and initialized it to a default value.
			if(_SymbolTableList[i][symbol].value === undefined)
			{
				uninitializedVariableWarning(symbol, i);
				initializeToDefaultValue(symbol, i)
			}
		}
	}
}

// Function called by checkForUninitializedVariables() to initialize uninitialized variables to default values
function initializeToDefaultValue(symbol, scope)
{
	// Get the symbol table entry in the current scope
	var symbolTableEntry = _SymbolTableList[scope][symbol];

	// Set the value to a default value corresponding to its type
	switch(symbolTableEntry.type)
	{
		case "int":    symbolTableEntry.value = "0"; break;
		case "string": symbolTableEntry.value = "\"\"";  break;
	}

	// Display a trace event
	_OutputManager.addTraceEvent("Initialized identifier '" + symbol + "' to a default " + symbolTableEntry.type + " value")
}

// Helper function to check the symbol table for unused variables
function checkForUnusedVariables()
{
	// Iterate each scope's symbol table
	for(var i = 0; i < _SymbolTableList.length; i++)
	{
		// Iterate each symbol in the scope's symbol table
		for(symbol in _SymbolTableList[i])
		{
			// If the symbol table entry's "isUsed" property is false it is not used.  Warn the user.
			if(_SymbolTableList[i][symbol].isUsed === false)
				unusedVariableWarning(symbol, i);
		}
	}
}