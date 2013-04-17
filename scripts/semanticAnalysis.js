/*  --------------------------------------------------------------------------------------
 *	Filename: semanticAnalysis.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, symbolTableUtils.js, tokenIntrospection.js
 *	Description: Semantic analysis of the AST / symbol table
 *  Note: I hate tree traversals... god bless the soul who trys to make sense of this code
 *	-------------------------------------------------------------------------------------- */

// Function that checks every symbol table entry to ensure all entries have type-value matches
function checkSemantics()
{
	// Reference to the number of errors found
	var errorCount = 0;

	// Function to traverse the tree and check specified cases
	function expand(node)
	{
		switch(node.item)
		{
			case "=": 	  checkAssignmentSemantics(node); break;
			case "print": checkPrintSemantics(node); 	  break
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
		// Get the id
		var id = node.children[0].item["id"];
		// Get the type
		var type = node.children[0].item.symbolTableEntry.type;
		// Current scope in which we are checking semantics
		var scope = node.children[0].item.symbolTableEntry.scope;
		// Move to the value node (right child)
		node = node.children[1];
		// Get the value being assigned to the id
		var value = getExprValueString(type, node);

		_OutputManager.addTraceEvent("Checking semantics of " + type + " assignment statement, '" + id + "=" + value + "'");

		// Determine if the value matches the type
		if(isMatchingType(type, node, scope))
		{
			_OutputManager.addTraceEvent("Value matches type " + type, "green");
		}
		else
		{
			// Send the id, its value, and type to the function in errors-warnings.js
			assignmentTypeMismatchError(id, value, type);
			errorCount++;
		}
	}

	function checkPrintSemantics(valueNode)
	{
		// Move to the actual value node
		valueNode = valueNode.children[0]

		// The only case that can have a semantic error is printing an intExpr
		// All of the other cases cannot fail
		if(isOperator(valueNode.item))
		{
			// Determine type and value
			var type = "int";
			var value = getExprValueString(type, valueNode);

			_OutputManager.addTraceEvent("Checking print statement semantics of " + type + " value '" + value + "'");

			// Determine if the value matches the type
			if(isMatchingType(type, valueNode))
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
	function isMatchingType(type, valueNode, scope)
	{
		switch(type)
		{
			case "int":    return isIntExpr(valueNode, scope); break;
			case "string": return isStringExpr(valueNode);  break;
		}
	}

	// Function that validates our value of type string
	function isStringExpr(valueNode)
	{
		// If the node is not an object, it is being called recursively as just a value, handle accordingly
		// Otherwise, it is an actual node, check if it is an actual string or an Id
		if(typeof valueNode !== "object")
		{
			return isString(valueNode);
		}
		else
		{
			// If it is an Id, recursively call this function to make sure the Id's value is of type string
			// Otherwise it is a literal string, check it
			if(typeof valueNode.item === "object")
			{
				return isStringExpr(valueNode.item["symbolTableEntry"].value);
			}
			else
			{
				return isString(valueNode.item)
			}
		}
	}

	// Function that validates our value of type int
	function isIntExpr(valueNode, scope)
	{
		// If the function is being called by a node object determine what kind of node it is and proceed accordingly
		// Otherwise, the function is being called recursively with just a value, check the value
		if(typeof valueNode === "object")
		{
			// There are two options for type int:
			// 1. It is a single digit OR id- check appropriately and return whether it is of type int
			// 2. It is an IntExpr - get all operands, check each one and return whether it is of type int
			if(!isOperator(valueNode.item))
			{
				// If the value is an id, recursively call isIntExpr() to make sure the id's value is an int
				// Otherwise, make sure the single value is an int
				if(isIdentifier(valueNode.item["id"]))
					return isIntExpr(valueNode.item["symbolTableEntry"].value, scope);
				else
					return isInteger(valueNode.item);
			}
			else
			{
				// Boolean to be returned
				var containsOnlyIntegers = true;

				// Get the individual operands so we can make sure they are all of type int
				var operandList = getIntExprOperands(valueNode);

				for(index in operandList)
				{
					// If the operand is an Id recursively call isIntExpr to make sure the Id's value is an int
					// Otherwise, it is a single int, make sure it is an int
					if(isIdentifier(operandList[index]))
					{
						// Recursively call isIntExpr() to make sure the Id's value is of type int
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
		}
		else
		{
			// If the single value is an id, recursively call isIntExpr() to make sure the id's value is an int
			// Otherwise, make sure the single value is an int
			// We get here when an Id's value is being checked out to make sure it is an int
			// 1. The value is another Id, so recurse again with that Id's value
			// 2. The value is a single int, check it
			// 3. The value is an IntExpr, break it down and handle it similarly to isIntExpr, but without nodes
			if(isIdentifier(valueNode))
			{
				return isIntExpr(getSymbolTableEntry(valueNode, scope).value, scope)
			}
			else if(isInteger(valueNode))
			{
				return true;
			}
			else(valueNode.search(/[+=]/) != -1)
			{
				// Split on the operators
				var operandList = valueNode.split(/[+-]/);
				// Boolean to be returned
				var containsOnlyIntegers = true;

				// Iterate the operands
				for(index in operandList)
				{
					// Ensure all operands (digits & ids) are ints
					if(isIdentifier(operandList[index]))
					{
						// currentSymbolTable is available bc js has function scope, not block scope
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
		}
	}

	// Function that traverses an intExpr portion of the AST and returns a list of all operands in the statement
	function getIntExprOperands(opNode)
	{
		// List containing all operands of the intExpr
		var operandList = [];
		// Initial call
		getOperands(opNode);
		// Return the operands
		return operandList;

		function getOperands(opNode)
		{
			// If the right child is an operator there is more than just 1 op and 2 values, we must keep recursing
			// Otherwise the two children are single digits OR a single digit and Id
			if(isOperator(opNode.children[1].item))
			{
				// The left child must be a single digit, so add it to the operandList
				operandList.push(opNode.children[0].item);
				// Move to the right child (operator node)
				opNode = opNode.children[1];
				// Recursively call this function from the opNode
				getOperands(opNode);
			}
			else
			{
				// Add the left child single digit to the operandList
				operandList.push(opNode.children[0].item);

				// The right child is either a single int or an Id
				// If it is an int, the item is the int value
				// If it is an Id, the item is the Id name and the symbol table entry
				if(isInteger(opNode.children[1].item))
					operandList.push(opNode.children[1].item);
				else
					operandList.push(opNode.children[1].item["id"])
			}
		}
	}

	// Function that traverses an expression in the AST and returns the value in string form
	function getExprValueString(type, valueNode)
	{
		// Two cases:
		// 1. String - the value can either be an acutal string or an id
		// 2. Int    - the value can be a single digit, Id, or IntExpr
		if(type === "string")
		{
			// If it is an actual string return the string, otherwise it is an id
			if(isString(valueNode.item))
				return valueNode.item;
			else
				return valueNode.item["id"];
		}
		else if(type === "int")
		{
			// String value to be returned
			var valueString = "";

			// There are three options for type int:
			// 1. It is a single digit - return the single digit in string form
			// 2. It is an Id - return the id
			// 3. It is an IntExpr - go the recursive route and return the entire expr string
    		if(isInteger(valueNode.item))
    		{
	    		valueString = valueNode.item.toString();
    		}
    		else if(typeof valueNode.item === "object")
    		{
	    		valueString = valueNode.item["id"];
    		}
    		else if(isOperator(valueNode.item))
    		{
    			// This function builds the intExpr value string
    			getIntExpr(valueNode);
    		}

			// Return the value string
			return valueString;

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
}