/*  ----------------------------------------------------------------------------------
 *	Filename: ast-symbolTable.js
 *	Author: Joey Cabibbo
 *	Requires: tree.js, scopeManager.js, errors-warning.js, symbolTableUtils.js
 *	Description: Facilitates the creation of an AST and symbol table using lexs stream
 *				 of tokens looks more or less like a condensed recursive-descent parse
 *	Note: The AST and symbol table is only created after a successful parse, so we can
 *		  make assumptionsabout the location of tokens.  This could have been done at
 *		  the same time as parse but it makes the code ugly and adds complexity.
 *	---------------------------------------------------------------------------------- */

function createSymbolTableAndAST()
{
	// Initialize as a new tree
	_AST = new Tree();
	// Set the root
	_AST.addNode("Program", "branch");

	// The scope manager to be used when creating the symbol table
	var scopeManager = new ScopeManager();

	// Get the tokens from the Lexer
	var tokens = _Lexer.tokenList;
	// Index used for iterating the token list
	var index = 0;

	// Iterate tokens
	while(getToken().kind !== TOKEN_EOF)
	{
		// We only want additions to the AST when we have an item in First(Statement)
		switch(getToken().kind)
		{
			case TOKEN_PRINT:		 addPrint(); 		 break;
	        case TOKEN_ID:		 	 addAssignment(); 	 break;
	        case TOKEN_TYPE:	 	 addVarDecl();		 break;
	        case TOKEN_OPENBRACKET:  addStatementList(); break;
	        // This is not part of First(Statement), but we need it in order to end the statementList (scope)
	        case TOKEN_CLOSEBRACKET: endStatementList(); break;

	        // Should never occur because our parse was successful, but it's here just to avoid an infinite
	        // loop when we get a heisenbug (which of course will happen), so just move to the next token
	        default: index++; break;
		}
	}

	//
	// Post creation...
	//

	// Check for declared but uninitialized variables (found in symbolTableUtils.js)
    checkForUninitializedVariables();
    // Check for variables that have not been unused (found in symbolTableUtils.js)
    checkForUnusedVariables();
    // Display the symbolTable(s)
	_OutputManager.updateSymbolTable();

	//
	// AST and Symbol Table creation methods
	//

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
			// If the token is an Id we want to add its name to the AST and its symbol table entry in an object
			// Otherwise (single digit or string) just add the value
			if(getToken(+2).kind === TOKEN_ID)
			{
				// Get the id and current scope
				var id = getToken(+2).name;
				var scope = scopeManager.currentScope;

				// Set the identifier as "used" if not done so already
				setIdentifierAsUsed(id, scope);

				// Add the id and its symbol table entry to the AST in an object
				_AST.addNode({"id": id, "symbolTableEntry": getSymbolTableEntry(id, scope)}, "leaf");
			}
			else
			{
				_AST.addNode(getToken(+2).value, "leaf");
			}

			// Move to the next statement
			index += 4;
		}

		// Finished with print
		_AST.endChildren();
	}

	// Function to add an assignment production to the AST and its value to the symbol table
	function addAssignment()
	{
		// =
		_AST.addNode(getToken(+1).value, "branch");

		// Get the id, current scope, and line
	    var scope = scopeManager.currentScope;
	    var id = getToken().name;
	    var line = getToken().line;

		// Add the id and its symbol table entry to the AST in an object
		_AST.addNode({"id": id, "symbolTableEntry": getSymbolTableEntry(id, scope)}, "leaf");

		// The value to be assigned
	    var value;

		// Look ahead to determine if we need to add an intExpr or just a single digit, string, or id
		if(getToken(+3).kind === TOKEN_OP)
		{
			// Get the intExpr value for the symbol table
			value = concatenateIntExpr(index + 2);
			// Move to the op
			index += 3;
			addIntExpr();
		}
		else
		{
			// If the token is an Id we want to add its name to the AST and its symbol table entry
			// Otherwise (single digit or string) just add the value
			if(getToken(+2).kind === TOKEN_ID)
			{
				// Add the id and its symbol table entry to the AST in an object
				_AST.addNode({"id": getToken(+2).name, "symbolTableEntry": getSymbolTableEntry(getToken(+2).name, scope)}, "leaf");

				// Set the identifier value as "used" if not done so already
				setIdentifierAsUsed(getToken(+2).name, scope);

				// The value is an id
				value = getToken(+2).name;
			}
			else
			{
				_AST.addNode(getToken(+2).value, "leaf");

				// The value is a single digit or string
				value = getToken(+2).value;
			}

			// Move to the next statement
			index += 3;
		}

	    // If the id has been declared in this scope, add the value and mark as "used"
	    // Otherwise it is an undeclared variable
	    if(_SymbolTableList[scope] && _SymbolTableList[scope].hasOwnProperty(id))
	    {
	    	_SymbolTableList[scope][id].value  = value;
	    	setIdentifierAsUsed(id, scope);
	    }
	    else
	    {
		    undeclaredVariableError(id, line); // Found in errors-warnings.js
	    }

		// Finished with assignment
		_AST.endChildren();
	}

	// Function to add a VarDecl production to the AST
	// Add a symbol table entry for this id
	function addVarDecl()
	{
		// Type (int | string)
		_AST.addNode(getToken().value, "branch");

		// Get the Id, Type, and the line they are on
	    var type = getToken().value;
	    var id   = getToken(+1).name;
	    var line = getToken(+1).line;

	    // If the current scope is -1 it has not been initialized yet, initialize it.
	    // This would only be the case when this varDecl is not in a statement list
	    if(scopeManager.currentScope === -1)
	    	scopeManager.initializeNewScope();

	    // Get the current scope environment
	    var scope = scopeManager.currentScope;

	    // If a variable of the same id and scope exists already, it is being redeclared (error)
	    if(_SymbolTableList[scope].hasOwnProperty(id))
	    {
	    	redeclaredVariableError(id, line); // Found in errors-warnings.js
 	    }
	    else
	    {
		    // Add all data known at this point to this scope's symbol table entry(format is id : {information})
		    _SymbolTableList[scope][id] = {"type": type, "line": line, "scope": scope, "isUsed": false};
		    // Display it in the trace
		    _OutputManager.addTraceEvent("Added identifier '" + id + "' to the symbol table in scope " + scope);
	    }

		// Add the id and its symbol table entry to the AST in an object
		_AST.addNode({"id": id, "symbolTableEntry": getSymbolTableEntry(id, scope)}, "leaf");

		// Move to the next statement
		index += 2;

		// Finished with VarDecl
		_AST.endChildren();
	}

	// Function to add an IntExpr production
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
			// If the token is an Id we want to add its name to the AST and its symbol table entry
			// Otherwise (single digit or string) just add the value
			if(getToken(+1).kind === TOKEN_ID)
			{
				// Ge the id and current scope
				var id = getToken(+1).name;
				var scope = scopeManager.currentScope;

				// Set the identifier as "used" if not done so already
				setIdentifierAsUsed(id, scope);

				// Add the id and its symbol table entry to the AST in an object
				_AST.addNode({"id": id, "symbolTableEntry": getSymbolTableEntry(id, scope)}, "leaf");

			}
			else
			{
				_AST.addNode(getToken(+1).value, "leaf");
			}

			// Move to the next statement
			index += 2;
		}

		// Finished with IntExpr
		_AST.endChildren();
	}

	// Function to start a statementList production
	function addStatementList()
	{
		// Add a StatementList branch
		// Adding this meta-symbol has given me more OCD anxiety than I care to admit...
		_AST.addNode("StatementList", "branch");

		// Enter a new scope environment
		scopeManager.initializeNewScope();

		// Move to the next statement
		index++;
	}

	// Function to end a statementList production
	function endStatementList()
	{
		// Finished with statementList
		_AST.endChildren();

		// Leave the current scope environment
		scopeManager.leaveCurrentScope();

		// Move to the next statement
		index++;
	}

	//
	// Helper functions
	//

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
		// No number or 0 provided, return the current token
		else
			return tokens[index];
	}

	// Function that takes the first index of an arbitrarily long IntExpr and concatenates it for value assignment
	function concatenateIntExpr(index)
	{
		// The string int expression return value
		var exprString = "";

		// Get the first token of the IntExpr
		var currentToken = tokens[index];

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
			currentToken = tokens[++index];
		}

		 // Return the expression
		 return exprString;
	}
}