/*  ----------------------------------------------------------------------------
 *	Filename: ast.js
 *	Author: Joey Cabibbo
 *	Requires: tree.js
 *	Description: Facilitates the creation of an AST using lex's stream of tokens
 *	Note: The AST is only created after a successful parse, so we can make assumptions
 *		  about the location of tokens.
 *	---------------------------------------------------------------------------- */

function createAST()
{
	// Initialize as a new tree
	_AST = new Tree();
	// Set the root
	_AST.addNode("Program", "branch");

	// Get the tokens from the Lexer
	var tokens = _Lexer.tokenList;
	// Index used for iterating the token list
	var index = 0;

	// Maybe switch to a while not EOF

	// Iterate tokens
	while(getToken().kind !== TOKEN_EOF)
	{
		// We only want additions to the AST when we have an item in First(Statement) (excluding })
		switch(getToken().kind)
		{
			case TOKEN_PRINT:		 addPrint(); 		 break;
	        case TOKEN_ID:		 	 addAssignment(); 	 break;
	        case TOKEN_TYPE:	 	 addVarDecl();		 break;
	        case TOKEN_OPENBRACKET:  addStatementList(); break;
	        case TOKEN_CLOSEBRACKET: endStatementList(); break;
		}
	}

	// Function to add a print production to the AST
	function addPrint()
	{
		// print
		_AST.addNode(getToken().kind, "branch");

		// Look ahead to determine if we need to add an intExpr or just a single digit, string, or id
		if(getToken(+3).kind === TOKEN_OP)
		{
			// Move to the op
			index += 3;
			addIntExpr();
			// Move to the next statement
			index++;
		}
		else
		{
			// If the token is an Id we want to add its name to the AST, otherwise (single digit or string) add the value
			(getToken(+2).kind === TOKEN_ID) ? _AST.addNode(getToken(+2).name, "leaf") : _AST.addNode(getToken(+2).value, "leaf");
			// Move to the next statement
			index += 4;
		}

		// Finished with print
		_AST.endChildren();
	}

	// Function to add an assignment production to the AST
	// a = 5
	function addAssignment()
	{
		// =
		_AST.addNode(getToken(+1).value, "branch");
		// Id
		_AST.addNode(getToken().name, "leaf");

		// Look ahead to determine if we need to add an intExpr or just a single digit, string, or id
		if(getToken(+3).kind === TOKEN_OP)
		{
			// Move to the op
			index += 3;
			addIntExpr();
		}
		else
		{
			// If the token is an Id we want to add its name to the AST, otherwise (single digit or string) add the value
			(getToken(+2).kind === TOKEN_ID) ? _AST.addNode(getToken(+2).name, "leaf") : _AST.addNode(getToken(+2).value, "leaf");
			// Move to the next statement
			index += 3;
		}

		// Finished with assignment
		_AST.endChildren();
	}

	// Function to add a VarDecl production to the AST
	function addVarDecl()
	{
		// Type (int | string)
		_AST.addNode(getToken().value, "branch");
		// Id
		_AST.addNode(getToken(+1).name, "leaf");

		// Move to the next statement
		index += 2;

		// Finished with VarDecl
		_AST.endChildren();
	}

	// Function to add an IntExpr production 5 + 5
	function addIntExpr()
	{
		// op
		_AST.addNode(getToken().value, "branch");
		// pre op digit
		_AST.addNode(getToken(-1).value, "leaf");

		// Look ahead to determine if we need to add another intExpr or just a single digit or id
		if(getToken(+2).kind === TOKEN_OP)
		{
			// Move to the op
			index += 2;
			// Handle an additional intExpr
			addIntExpr();
		}
		else
		{
			// If the token is an Id we want to add its name to the AST, otherwise (single digit) add the value
			(getToken(+1).kind === TOKEN_ID) ? _AST.addNode(getToken(+1).name, "leaf") : _AST.addNode(getToken(+1).value, "leaf");
			// Move to the next statement
			index += 2;
		}

		// Finished with IntExpr
		_AST.endChildren();
	}

	// Function to start a statementList production to the AST
	function addStatementList()
	{
		// Add a StatementList branch
		_AST.addNode("StatementList", "branch");
		// Move to the next statement
		index++;
	}

	// Function to end a statementList production
	function endStatementList()
	{
		// Jump up a level in the ast (leave the current scope)
		_AST.endChildren();
		// Move to the next statement
		index++;
	}

	// Function that gets a token a specified number of indexes away from the current index (does not modify the index)
	// Positive values for distanceFromCurrentIndex get tokens ahead of the current index in the token list (use +n notation)
	// Negative values for distanceFromCurrentIndex get tokens behind the current index in the token list (use -n notation)
	function getToken(distanceFromCurrentIndex)
	{
		// I could have just added a negative value but it is more explicit to subtract the absolute value

		// Positive values (look ahead)
		if(distanceFromCurrentIndex > 0)
			return tokens[index + distanceFromCurrentIndex];
		// Negative values (look behind)
		else if(distanceFromCurrentIndex < 0)
			return tokens[index - Math.abs(distanceFromCurrentIndex)];

		// No number provided, return the current token
		return tokens[index];
	}
}