/*  -------------------------------------------
 *	Filename: parser.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, tokenIntrospection.js
 *	Description: A recursive-descent parser
 *	------------------------------------------- */

 // TODO: Comment each parse step

function Parser()
{
	// Stream of tokens
	this.tokens = [];
	// Current token index
	this.currentIndex = 0;

	this.errorCount = 0;

    this.parse = function()
    {
    	// Initialize parser components
    	this.tokens = _Lexer.tokenList;
    	this.currentIndex = 0;

        this.parseProgram();

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

    this.parseProgram = function()
    {
    	// Statement $
        this.parseStatement();

        // If there is another statement, the user should be alerted that multiple statements must be in a statement list
        if(this.tokens[this.currentIndex].kind === TOKEN_PRINT || this.tokens[this.currentIndex].kind === TOKEN_ID ||
	    	this.tokens[this.currentIndex].kind === TOKEN_TYPE || this.tokens[this.currentIndex].kind === TOKEN_OPENBRACKET)
	    {
	    	_OutputManager.addError("Multiple statements must be contained in a StatementList.  Please consult the language grammar.");
	    	this.errorCount++;
	    }

    	this.matchToken(TOKEN_EOF);
    }

    this.parseStatement = function()
    {
    	// P( Expr ) ~OR~ Id = Expr ~OR~ VarDecl ~OR~ { StatementList }
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

	        default:				_OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line);
	        						_OutputManager.addTraceEvent("Expecting token P, Id, Type, or {");
	        						_OutputManager.addTraceEvent("Expected token, P, Id, Type, or {, not found", "red");
	        						this.errorCount++;
	        						this.currentIndex++;
	        						break;
        }
    }

    this.parsePrint = function()
    {
    	// P ( Expr )
    	this.matchToken(TOKEN_PRINT);
        this.matchToken(TOKEN_OPENPAREN);
        this.parseExpr();
        this.matchToken(TOKEN_CLOSEPAREN);
    }

    this.parseAssignment = function()
    {
    	// Id = Expr
	    this.matchToken(TOKEN_ID);
	    this.matchToken(TOKEN_ASSIGN);
	    this.parseExpr();
    }

    this.parseVarDecl = function()
    {
    	// Type Id
	    this.matchToken(TOKEN_TYPE);
	    this.matchToken(TOKEN_ID);
    }

    this.parseStatementList = function()
    {
	    // { Statement StatementList } ~OR~ { ε }
	    // Look-ahead to determine which production we need
	    if(this.tokens[this.currentIndex].kind === TOKEN_PRINT || this.tokens[this.currentIndex].kind === TOKEN_ID ||
	    	this.tokens[this.currentIndex].kind === TOKEN_TYPE || this.tokens[this.currentIndex].kind === TOKEN_OPENBRACKET)
	    {
		    this.parseStatement();

		    // Look-ahead to determine if we need to recurse on StatementList
		    if(this.tokens[this.currentIndex].kind === TOKEN_PRINT || this.tokens[this.currentIndex].kind === TOKEN_ID ||
	    		this.tokens[this.currentIndex].kind === TOKEN_TYPE || this.tokens[this.currentIndex].kind === TOKEN_OPENBRACKET)
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
		    // Something invalid
		    _OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line);
	        _OutputManager.addTraceEvent("Expecting token P, Id, Type, or {");
	        _OutputManager.addTraceEvent("Expected token, P, Id, Type, or {, not found", "red");
	        this.errorCount++;
	        this.currentIndex++;
	    }
    }

    this.parseExpr = function()
    {
    	// IntExpr ~OR~ CharExpr ~OR~ Id
        switch(this.tokens[this.currentIndex].kind)
        {
	        case TOKEN_INT:		this.parseIntExpr(); 		break;
	        case TOKEN_CHAR:	this.parseCharExpr();		break;
	        case TOKEN_ID:		this.matchToken(TOKEN_ID);	break;

	        default:			_OutputManager.addError("ParseError: invalid statement on line " + this.tokens[this.currentIndex].line);
	        					_OutputManager.addTraceEvent("Expecting token int, char, or Id");
	        					_OutputManager.addTraceEvent("Expected token, int, char, or Id, not found", "red");
	        					this.errorCount++;
	        					this.currentIndex++;
	        					break;
        }
    }

    this.parseIntExpr = function()
    {
    	// int ~OR~ int op Expr
        this.matchToken(TOKEN_INT);

        // Look-ahead to determine which production we need
        if(this.tokens[this.currentIndex].kind === TOKEN_INTOP)
        {
	        this.matchToken(TOKEN_INTOP)
	        this.parseExpr();
        }
    }

    this.parseCharExpr = function()
    {
    	// " CharList "
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
        	// Trace found token..
        	_OutputManager.addTraceEvent("Found token '" + expectedTokenKind + "'!", "green");
        	// Consume token
        	this.currentIndex++;
    	}
    	else
    	{
    		// Trace token not found
	    	_OutputManager.addTraceEvent("'" + expectedTokenKind + "' not found...", "red");
	    	// Parse error
	    	_OutputManager.addError("Parse Error: token mismatch on line " + this.tokens[this.currentIndex].line + ", expecting token '" + expectedTokenKind + "'");
	    	this.errorCount++;
	    	this.currentIndex++;
    	}
    }
}