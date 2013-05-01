/*  --------------------------------------------------------------------------------------
 *	Filename: semanticAnalysis.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, symbolTableUtils.js, tokenIntrospection.js
 *	Description: Semantic analysis of the AST / symbol table
 *	-------------------------------------------------------------------------------------- */

// Function that checks every symbol table entry to ensure all entries have type-value matches
function checkSemantics()
{
	// Check for declared but uninitialized variables (found in symbolTableUtils.js)
    checkForUninitializedVariables();
    // Check for variables that have not been unused (found in symbolTableUtils.js)
    checkForUnusedVariables();

    //
    // Type Checking
    //

    // Reference to the number of errors found
	var errorCount = 0;

	// Function to traverse the tree and check specific cases
	function expand(node)
	{
		switch(node.item)
		{
			case "=": 	  checkAssignmentSemantics(node); break;
			case "print": checkPrintSemantics(node); 	  break;
		}

		// Recursively expand the branch's children
		for(var i = 0; i < node.children.length; i++)
		{
			expand(node.children[i])
		}
	}

	// Make the inital call to expand from the root node
	expand(_AST.root, 0);

	// Determine if it was a successful semantic analysis or a failure
	if(errorCount === 0)
	{
	    _OutputManager.addTraceEvent("Semantic analysis successful!", "green");
	    return true;
	}
	else
	{
	    _OutputManager.addTraceEvent("Semantic analysis failed!", "red");
	    // Should I erase the incorrect symbol table?
	    return false;
	}

	// Function that makes sure the value of an assignment statement matches the type of variable
	function checkAssignmentSemantics(node)
	{
		// Get the Id being assigned
		var id = node.children[0].item["id"];
		// Get the type of the id
		var type = node.children[0].item["symbolTableEntry"].type;
		// Current scope in which we are checking semantics
		var scope = node.children[0].item["symbolTableEntry"].scope;
		// Move to the value node (right child)
		node = node.children[1];
		// Get the value being assigned to the Id
		var value = getValue(node);

		_OutputManager.addTraceEvent("Checking semantics of " + type + " assignment statement, '" + id + "=" + value + "'");

		// Determine if the value matches the type
		if(isMatchingType(type, value, scope))
		{
			_OutputManager.addTraceEvent("Value matches type " + type, "green");
		}
		else
		{
			// Send the id, value, and type to the function in errors-warnings.js
			assignmentTypeMismatchError(id, value, type);
			errorCount++;
		}
	}

	function checkPrintSemantics(node)
	{
		// Move to the actual value node
		node = node.children[0];

		// The only case that can have a semantic error for print is an intExpr
		// All of the other cases cannot fail
		if(isOperator(node.item))
		{
			// Determine type and value
			var type = "int";
			var value = getValue(node);

			_OutputManager.addTraceEvent("Checking print statement semantics of " + type + " value '" + value + "'");

			// Determine if the value matches the type
			if(isMatchingType(type, node))
			{
				_OutputManager.addTraceEvent("Value matches type " + type, "green");
			}
			else
			{
				// Send the value and type to the function in errors-warnings.js
				printTypeMismatchError(value, type);
				errorCount++;
			}
		}
	}

	// Function that sends a value node of specified type to the correct validation function
	// This function gets the value node instead of just the value, bc for intExprs, the node
	// is important for getting all of the operands.  Scope is sent in order to look up ids
	function isMatchingType(type, value, scope)
	{
		switch(type)
		{
			case "int":    return isIntExpr(value, scope); break;
			case "string": return isStringExpr(value, scope);  break;

			// Should never happen, but you know how those heisenbugs work
			default: return false; break;
		}
	}

	// Function that validates a string value
	function isStringExpr(value, scope)
	{
		// Two cases:
		// 1. String
		// 2. Id
		if(isString(value))
			return true
		else if(isIdentifier(value))
		{
			/// Get the symbol table entry for the Id
			var entry = getSymbolTableEntry(value, scope);

			// If the entry exists get the value of the Id
			if(entry !== undefined)
				var idValue = entry.value;

			// Make a recursive call with the value of the Id
			return isStringExpr(idValue);
		}
		else
			return false;
	}

	// Function that validates an intExpr value
	function isIntExpr(value, scope)
	{
		// Three cases:
		// 1. Integer
		// 2. Id
		// 3. IntExpr
		if(isInteger(value))
			return true;
		else if(isIdentifier(value))
		{
			// Get the symbol table entry for the Id
			var entry = getSymbolTableEntry(value, scope);

			// If the entry exists get the value of the Id
			if(entry !== undefined)
				var idValue = entry.value;

			// Make a recursive call with the value of the Id
			return isIntExpr(idValue, scope);
		}
		else if(value !== undefined && value.search(/[+=]/) != -1)
		{
			// Split on the operators
			var operandList = value.split(/[+-]/);
			// Boolean to be returned
			var containsOnlyIntegers = true;

			// Iterate the operands
			for(index in operandList)
			{
				// Ensure all operands are ints
				if(isIdentifier(operandList[index]))
				{
					if(!isIntExpr(operandList[index], scope))
						containsOnlyIntegers = false;
				}
				else if(!isInteger(operandList[index]))
				{
					containsOnlyIntegers = false;
				}
			}

			return containsOnlyIntegers;
		}
		else
			return false;
	}

	// Function that gets the value from the AST and returns it in string form
	function getValue(valueNode)
	{
		// Four cases:
		// 1. String - return the string
		// 2. Id - return the Id
		// 3. Integer - return the integer
		// 4. IntExpr - traverse the nodes concatenating an intExpr string

		if(isString(valueNode.item))
			return valueNode.item;
		else if(typeof valueNode.item === "object")
			return valueNode.item["id"];
		else if(isInteger(valueNode.item))
			return valueNode.item;
		else
		{
			var valueString = "";
			// Build the value string
			getIntExpr(valueNode);
			return valueString;
		}

		// Internal function that traverses the AST, building an intExpr value string
		function getIntExpr(opNode)
		{
			// If the right child is an operator there is more than just 1 op and 2 values), we must keep recursing
			// Otherwise the two children are single digits OR a single digit and Id
			if(isOperator(opNode.children[1].item))
			{
				// The left child must be a single digit, so add it to the value string
				valueString += opNode.children[0].item;
				// Add the operator to the valueString
				valueString += opNode.item;
				// Move to the right child (operator node)
				opNode = opNode.children[1];
				// Recursively call this function from the opNode
				getIntExpr(opNode);
			}
			else
			{
				// Add the left child single digit to the valueString
				valueString += opNode.children[0].item;
				// Add the operator to the valueString
				valueString += opNode.item;

				// Determine if we have a single digit or Id right child
				if(isInteger(opNode.children[1].item))
					valueString += opNode.children[1].item;
				else
					valueString += opNode.children[1].item["id"];
			}
		}
	}
}
