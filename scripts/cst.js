/*  ----------------------------------------------------------------------------------
 *	Filename: cst.js
 *	Author: Joey Cabibbo
 *	Requires: tree.js, globals.js, tokenIntrospection.js
 *	Description: Facilitates the creation of a CST using lex's stream of tokens looks
 *				 more or less like a condensed recursive-descent parse
 *	Note: The CST is only created after a successful parse, so we can make assumptions
 *		  about the location of tokens.  This could have been done at the same time as
 *		  parse but it makes the code ugly and adds complexity.
 *	---------------------------------------------------------------------------------- */

function createCST()
{
	// Initialize as a new tree
	_CST = new Tree();
	// Set the root
	_CST.addNode("Program", "branch");

	// Get the tokens from the Lexer
	var tokens = _Lexer.tokenList;
	// Index used for iterating the token list
	var index = 0;

	// Iterate tokens and add every statement
	while(tokens[index].kind !== TOKEN_EOF)
	{
		addStatement();
	}

	// Finish the program/tree by adding the EOF token
	addTokenAndConsume(TOKEN_EOF);

	// Add a statement branch and add the appropriate statement
	function addStatement()
	{
		_CST.addNode("Statement", "branch")

		// We only want additions to the CST when we have an item in First(Statement)
		switch(tokens[index].kind)
		{
			case TOKEN_PRINT:		addPrint(); 		break;
	        case TOKEN_ID:			addAssignment();	break;
	        case TOKEN_TYPE:	 	addVarDecl(); 		break;
	        case TOKEN_WHILE:		addWhile();			break;
	        case TOKEN_IF:			addIf();			break;

	        case TOKEN_OPENBRACKET: addTokenAndConsume(TOKEN_OPENBRACKET);
	        						addStatementList();
	        						addTokenAndConsume(TOKEN_CLOSEBRACKET);
	        						// Finished with statementList
	        						_CST.endChildren();
	        						break;
		}
	}

	// Add a Print production
    // P ( Expr )
    function addPrint()
    {
    	addTokenAndConsume(TOKEN_PRINT);
        addTokenAndConsume(TOKEN_OPENPAREN);
        addExpr();
        addTokenAndConsume(TOKEN_CLOSEPAREN);

        // Finished with print
        _CST.endChildren();
    }

    // Add an Assignment production
    // Id = Expr
    function addAssignment()
    {
	    addTokenAndConsume(TOKEN_ID);
	    addTokenAndConsume(TOKEN_ASSIGN);
	    addExpr();

	    // Finished with assignment
        _CST.endChildren();
    }

    // Add a VarDecl production
    // Type Id
    function addVarDecl()
    {
	    addTokenAndConsume(TOKEN_TYPE);
	    addTokenAndConsume(TOKEN_ID);

	    // Finished with VarDecl
        _CST.endChildren();
    }

    // Add a WhileStatement production
    // while BooleanExpr { StatementList }
    function addWhile()
    {
	    addTokenAndConsume(TOKEN_WHILE);
	    addBooleanExpr();
	    addTokenAndConsume(TOKEN_OPENBRACKET);
	    addStatementList();
	    addTokenAndConsume(TOKEN_CLOSEBRACKET);

	    // Finished with WhileStatement
        _CST.endChildren();
    }

    // Add an IfStatement production
    // if BooleanExpr { StatementList }
    function addIf()
    {
	    addTokenAndConsume(TOKEN_IF);
	    addBooleanExpr();
	    addTokenAndConsume(TOKEN_OPENBRACKET);
	    addStatementList();
	    addTokenAndConsume(TOKEN_CLOSEBRACKET);

	    // Finished with IfStatement
        _CST.endChildren();
    }

    // Add a StatementList production
    // { Statement StatementList }
    // { ε } // aka nothing
    function addStatementList()
    {
	    // Look-ahead to determine which production we need
	    if(isStatement(tokens[index].kind))
	    {
		    addStatement();

		    // Look-ahead to determine if we need to recurse on StatementList (more statements exist)
		    if(isStatement(tokens[index].kind))
	    	{
		    	addStatementList();
	    	}
	    }
	    else(tokens[index].kind === TOKEN_CLOSEBRACKET)
	    {
		    // ε production aka do nothing
	    }
    }

    // Add an Expr production
    // IntExpr
    // StringExpr
    // Id
    function addExpr()
    {
    	// Add an Expr to the cst
    	_CST.addNode("Expr", "branch");

    	// Determine which expr we have and add accordingly
        switch(tokens[index].kind)
        {
	        case TOKEN_INT:		addIntExpr(); 				  break;
	        case TOKEN_STRING:	addStringExpr(); 			  break;
	        case TOKEN_ID:		addTokenAndConsume(TOKEN_ID); break;
	        // BooleanExpr can start with either a ( or a bool value (true | false)
	        case TOKEN_OPENPAREN: addBooleanExpr();	 		  break;
	        case TOKEN_BOOL: 	  addBooleanExpr();	 		  break;
        }

        // Finished with Expr
        _CST.endChildren();
    }

    // Add an IntExpr production
    // int
    // int op Expr
    function addIntExpr()
    {
        addTokenAndConsume(TOKEN_INT);

        // Look-ahead to determine which production we need
        if(tokens[index].kind === TOKEN_OP)
        {
	        addTokenAndConsume(TOKEN_OP)
	        addExpr();
        }
    }

    // Add a StringExpr production
    // " CharList "
    function addStringExpr()
    {
        addTokenAndConsume(TOKEN_STRING);
    }

    // Add a BooleanExpr production
    // ( Expr == Expr )
    // boolVal
    function addBooleanExpr()
    {
	    // Lookahead to determine which production we need
	 	if(tokens[index].kind === TOKEN_OPENPAREN)
	 	{
		 	addTokenAndConsume(TOKEN_OPENPAREN);
		 	addExpr();
		 	addTokenAndConsume(TOKEN_EQUALITY);
		 	addExpr();
		 	addTokenAndConsume(TOKEN_CLOSEPAREN);
	 	}
	 	else
	 	{
		 	addTokenAndConsume(TOKEN_BOOL);
	 	}
    }

    // Add terminals to the CST and increment the index
	function addTokenAndConsume(token)
	{
		// Add the token to the CST
    	// If the token is an Id we want to add its name, otherwise add the value
    	(tokens[index].kind === TOKEN_ID) ? _CST.addNode(tokens[index].name, "leaf") : _CST.addNode(tokens[index].value, "leaf");

    	// Consume token
    	index++;
	}
}