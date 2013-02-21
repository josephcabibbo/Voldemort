/*  -------------------------------------------
 *	Filename: parser.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js
 *	Description: A recursive-descent parser
 *	------------------------------------------- */

function Parser()
{
	// Stream of tokens
	this.tokens = [];
	// Current token index
	this.currentIndex = 0;
	// Number of errors found
	this.errorCount = 0;

	// General parse call, initializes and starts the recursive descent parse
    this.parse = function()
    {
    	// Get the stream of tokens from the Lexer
    	this.tokens = _Lexer.tokenList;

    	// Start the parse
        this.parseProgram();

        // Determine if it was a successful parse or a failure
        if(this.errorCount === 0)
        {
	        _OutputManager.addTraceEvent("Parse successful!", "green");
	        return true;
        }
        else
        {
	        _OutputManager.addTraceEvent("Parse failed!", "red");
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
	        case TOKEN_OPENBRACKET: this.matchToken(TOKEN_OPENBRACKET);
	        						this.parseStatementList();
	        						this.matchToken(TOKEN_CLOSEBRACKET);
	        						break;

	        // Invalid statement token
	        default: _OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line + ", expecting a P, Id, Type, or {...");
	        		 _OutputManager.addTraceEvent("Expecting token P, Id, Type, or {");
	        		 _OutputManager.addTraceEvent("Expected token, P, Id, Type, or {, not found", "red");
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
    }

    // Parse an Assignment production
    // Id = Expr
    this.parseAssignment = function()
    {
	    this.matchToken(TOKEN_ID);
	    this.matchToken(TOKEN_ASSIGN);
	    this.parseExpr();
    }

    // Parse a VarDecl production
    // Type Id
    this.parseVarDecl = function()
    {
	    this.matchToken(TOKEN_TYPE);
	    this.matchToken(TOKEN_ID);
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
		    _OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line + ", expecting a P, Id, Type, or {...");
	        _OutputManager.addTraceEvent("Expecting token P, Id, Type, or {");
	        _OutputManager.addTraceEvent("Expected token, P, Id, Type, or {, not found", "red");
	        this.errorCount++;
	        this.currentIndex++; // Consume invalid token
	    }
    }

    // Parse an Expr production
    // IntExpr
    // CharExpr
    // Id
    this.parseExpr = function()
    {
    	// Determine which expr we have and parse accordingly
        switch(this.tokens[this.currentIndex].kind)
        {
	        case TOKEN_INT:		this.parseIntExpr(); 		break;
	        case TOKEN_CHAR:	this.parseCharExpr();		break;
	        case TOKEN_ID:		this.matchToken(TOKEN_ID);	break;

	        // Invalid expression
	        default: _OutputManager.addError("ParseError: invalid expression on line " + this.tokens[this.currentIndex].line + ", expecting an IntExpr, CharExpr, or Id...");
	        		 _OutputManager.addTraceEvent("Expecting token int, char, or Id");
	        		 _OutputManager.addTraceEvent("Expected token, int, char, or Id, not found", "red");
	        		 this.errorCount++;
	        		 this.currentIndex++; // Consume the invalid token
	        		 break;
        }
    }

    // Parse an IntExpr production
    // int
    // int op Expr
    this.parseIntExpr = function()
    {
        this.matchToken(TOKEN_INT);

        // Look-ahead to determine which production we need
        if(this.tokens[this.currentIndex].kind === TOKEN_INTOP)
        {
	        this.matchToken(TOKEN_INTOP)
	        this.parseExpr();
        }
    }

    // Parse a CharExpr production
    // " CharList "
    this.parseCharExpr = function()
    {
        this.matchToken(TOKEN_CHAR);
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