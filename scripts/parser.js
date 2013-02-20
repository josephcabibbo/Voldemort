/*  -------------------------------------------
 *	Filename: parser.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, tokenIntrospection.js
 *	Description: A recursive-descent parser
 *	------------------------------------------- */

function Parser()
{
	// Stream of tokens
	var tokens;
	// Current token index
	var currentIndex;

	this.errorCount = 0;

    this.parse = function()
    {
    	// Initialize parser components
    	tokens = _Lexer.tokenList;
    	currentIndex = 0;

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
        if(tokens[currentIndex].kind === TOKEN_PRINT || tokens[currentIndex].kind === TOKEN_ID ||
	    	tokens[currentIndex].kind === TOKEN_TYPE || tokens[currentIndex].kind === TOKEN_OPENBRACKET)
	    {
	    	_OutputManager.addError("Multiple statements must be contained in a StatementList.  Please consult the language grammar.");
	    	this.errorCount++;
	    }

    	this.matchToken(TOKEN_EOF);
    }

    this.parseStatement = function()
    {
    	// P( Expr ) ~OR~ Id = Expr ~OR~ VarDecl ~OR~ { StatementList }
        switch(tokens[currentIndex].kind)
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

	        default:				_OutputManager.addError("ParseError: invalid statement on line " + tokens[currentIndex].line);
	        						_OutputManager.addTraceEvent("Expecting token P, Id, Type, or {");
	        						_OutputManager.addTraceEvent("Expected token, P, Id, Type, or {, not found", "red");
	        						this.errorCount++;
	        						currentIndex++;
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
	    if(tokens[currentIndex].kind === TOKEN_PRINT || tokens[currentIndex].kind === TOKEN_ID ||
	    	tokens[currentIndex].kind === TOKEN_TYPE || tokens[currentIndex].kind === TOKEN_OPENBRACKET)
	    {
		    this.parseStatement();

		    // Look-ahead to determine if we need to recurse on StatementList
		    if(tokens[currentIndex].kind === TOKEN_PRINT || tokens[currentIndex].kind === TOKEN_ID ||
	    		tokens[currentIndex].kind === TOKEN_TYPE || tokens[currentIndex].kind === TOKEN_OPENBRACKET)
	    	{
		    	this.parseStatementList();
	    	}
	    }
	    else if(tokens[currentIndex].kind === TOKEN_CLOSEBRACKET)
	    {
		    // ε production aka do nothing
	    }
	    else
	    {
		    // Something invalid
		    _OutputManager.addError("ParseError: invalid statement on line " + tokens[currentIndex].line);
	        _OutputManager.addTraceEvent("Expecting token P, Id, Type, or {");
	        _OutputManager.addTraceEvent("Expected token, P, Id, Type, or {, not found", "red");
	        this.errorCount++;
	        currentIndex++;
	    }
    }

    this.parseExpr = function()
    {
    	// IntExpr ~OR~ CharExpr ~OR~ Id
        switch(tokens[currentIndex].kind)
        {
	        case TOKEN_INT:		this.parseIntExpr(); 		break;
	        case TOKEN_CHAR:	this.parseCharExpr();		break;
	        case TOKEN_ID:		this.matchToken(TOKEN_ID);	break;

	        default:			_OutputManager.addError("ParseError: invalid statement on line " + tokens[currentIndex].line);
	        					_OutputManager.addTraceEvent("Expecting token int, char, or Id");
	        					_OutputManager.addTraceEvent("Expected token, int, char, or Id, not found", "red");
	        					this.errorCount++;
	        					currentIndex++;
	        					break;
        }
    }

    this.parseIntExpr = function()
    {
    	// int ~OR~ int op Expr
        this.matchToken(TOKEN_INT);

        // Look-ahead to determine which production we need
        if(tokens[currentIndex].kind === TOKEN_INTOP)
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
    // ** Increments the currentIndex (consumes the token) **
    this.matchToken = function(expectedTokenKind)
    {
    	// Trace expecting token...
    	_OutputManager.addTraceEvent("Expecting token '" + expectedTokenKind + "'...");
    	// Determine if we have a match
    	if(tokens[currentIndex].kind === expectedTokenKind)
    	{
        	// Trace found token..
        	_OutputManager.addTraceEvent("Found token '" + expectedTokenKind + "'!", "green");
        	// Consume token
        	currentIndex++;
    	}
    	else
    	{
    		// Trace token not found
	    	_OutputManager.addTraceEvent("'" + expectedTokenKind + "' not found...", "red");
	    	// Parse error
	    	_OutputManager.addError("Parse Error: token mismatch on line " + tokens[currentIndex].line + ", expecting token '" + expectedTokenKind + "'");
	    	this.errorCount++;
	    	currentIndex++;
    	}
    }
}