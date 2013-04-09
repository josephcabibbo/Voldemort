/*  ---------------------------------------------------------
 *	Filename: semanticAnalysis.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, tokenIntrospection.js
 *	Description: Semantic analysis of the symbol table
 *	--------------------------------------------------------- */

// Function that checks every symbol table entry to ensure all entries have type-value matches
function checkSemantics()
{
   // Reference to the number of errors found
   var errorCount = 0;

   // Iterate symbol tables by scope
   for(var i = 0; i < _SymbolTableList.length; i++)
   {
		// Get the scope's corresponding symbol table
		var currentSymbolTable = _SymbolTableList[i];

		// Iterate symbols
		for(var symbol in currentSymbolTable)
		{
			// Filter out keys from the Object.prototype (if any)
			if(currentSymbolTable.hasOwnProperty(symbol))
			{
				// Get the type and value of the symbol
				var type = currentSymbolTable[symbol].type;
				var value = currentSymbolTable[symbol].value;

				_OutputManager.addTraceEvent("Checking the semantics of " + type + " value " + value);

				// Determine if the type matches the value
				if(isMatchingType(type, value))
				{
					_OutputManager.addTraceEvent("Value matches type " + type, "green");
				}
				else
				{
					// Send the symbol and its scope to the function in errors-warnings.js
					typeMismatchError(symbol, i);
					errorCount++;
				}
			}
		}
   }

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

   // Function that sends a value of specified type to the correct validation function
   function isMatchingType(type, value)
   {
      switch(type)
	  {
		  case "int": 	 return isIntExpr(value);    break;
		  case "string": return isString(value); break;
	  }
   }

   // Function that takes an int expr, breaks it down (if necessary), and validates that all operands are of type int
   function isIntExpr(value)
   {
   	  // If the expr is not a single value, split it up
  	  if(value.search(/[+-]/) != -1)
  	  {
	  	  // Split on the operators
		  var operandList = value.split(/[+-]/);
		  // Boolean to be returned
		  var containsOnlyIntegers = true;

		  // Iterate the operands
		  for(index in operandList)
		  {
		  	  // Replace each operand with a trimmed version of itself just in case there are spaces
			  operandList.splice(index, 1, $.trim(operandList[index]));

			  // Ensure all operands (digits & ids) are ints
			  if(isIdentifier(operandList[index]))
			  {
			  	  // currentSymbolTable is available bc js has function scope, not block scope
			  	  if(!isIntExpr(currentSymbolTable[operandList[index]].value))
			  	      containsOnlyIntegers = false;
			  }
			  else if(!isInteger(operandList[index]))
			  {
			      containsOnlyIntegers = false;
			  }
		  }

		  // Return the boolean when all recursion is done
		  return containsOnlyIntegers;
	  }
	  else
	  {
	  	  // If the single value is an id, recursively call isIntExpr() to make sure the id's value is an int
	  	  // Otherwise, make sure the single value is an int
	  	  if(isIdentifier(value))
	  	      return isIntExpr(currentSymbolTable[value].value)
	  	  else
	      	  return isInteger(value);
	  }
   }
}