/*  -----------------------------------------------------------------
 *	Filename: codeGen.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js, symbolTableUtils.js, tokenIntrospection.js
 *	Description: Code generation from the AST into 6502a bytecode
 *	Note: throughout codeGen I use 00 as the location for temp
 *		  static variable computation.
 *	----------------------------------------------------------------- */

function generateCode()
{
	// The list containing the generated 6502a bytecode
	_ByteCodeList = [];
	// The temporary variable table
	var referenceTable = {};
	// The jump reference table
	var jumpTable = {};

	// Start code generation
	generateProgram();
	// Backpatch and replace all temp reference and jump values with actual memory locations or values (jumps)
	performBackpatching();
	// Display the generated output
	_OutputManager.displayOutput();
	_OutputManager.addTraceEvent("Code generation successful!", "green");

	//
	// Code Gen Functions
	//

	// Function to generate necessary code for the program
	function generateProgram()
	{
		// Start code generation from the root
		generateStatement(_AST.root);
		// Place a break statement after the program to pad the static data
		_ByteCodeList.push("00");
	}

	// Function to generate the neccessary code for a given statement
	function generateStatement(node)
	{
		// Determine which statement to generate
		switch(node.item)
		{
			case "{}": 		generateStatementList(node); break;
			case "int": 	generateStaticDecl(node); 	 break;
			case "boolean": generateStaticDecl(node); 	 break;
			case "string":	generateStringDecl(node); 	 break;
			case "=":		generateAssignment(node); 	 break;
			case "print":	generatePrint(node); 	  	 break;
			case "while":	generateWhile(node);	  	 break;
			case "if":		generateIf(node);		  	 break;
		}
	}

	// Function to generate necessary code for a given statement list
	function generateStatementList(node)
	{
		for(var i = 0; i < node.children.length; i++)
		{
			generateStatement(node.children[i]);
		}
	}

	// Function to generate code for a static variable declaration (ints and booleans)
	function generateStaticDecl(node)
	{
		// Get the Id object
		var idObject = node.children[0].item;

		// LDA #00 - Load the ACC with 00
		_ByteCodeList.push("A9", "00");
		// STA $T_ 00 - Store the contents of the ACC in the temp address until backpatching
		_ByteCodeList.push("8D", getReferenceTableKey(idObject), "00");
	}

	// Function to generate code for a heap variable declaration (strings)
	function generateStringDecl(node)
	{
		// Get the Id object
		var idObject = node.children[0].item;

		// No declaration necessary, but we must make a table entry
		getReferenceTableKey(idObject);
	}

	// Function to generate code for variable assignments
	function generateAssignment(node)
	{
		// Get all necessary information from the node
		var idObject = node.children[0].item;
		var valueNode = node.children[1];
		var scope = idObject["symbolTableEntry"].scope;
		var type = idObject["symbolTableEntry"].type;

		// Get the temporary table key associated with this assignment
		var tempKey = getReferenceTableKey(idObject);

		// Get the value(s) and generate the necessary bytecode
		if(type === "int")
		{
			// Get the converted int values in an array
			var valueList = getIntHexValues(valueNode, scope);
			// LDA #__ - Load the ACC with the first value
			_ByteCodeList.push("A9", valueList[0]);
			// STA T_ 00 - Store the contents of the ACC in the temp address until backpatching
			_ByteCodeList.push("8D", tempKey, "00");

			// Process any additional ints that were part of the intExpr (start at 1 bc we added index 0 already)
			for(var i = 1; i < valueList.length; i++)
			{
				// LDA #__ - Load the ACC with the current int being processed
				_ByteCodeList.push("A9", valueList[i]);
				// ADC $T_ 00 - Add the contents of this memory address to the ACC and keep the result in the ACC
				_ByteCodeList.push("6D", tempKey, "00");
				// STA $T_ 00 - Store the contents of the ACC in the temp address until backpatching
				_ByteCodeList.push("8D", tempKey, "00");
			}
		}
		else if(type === "boolean")
		{
			// Get the boolean value in hex form
			var boolValue = getBooleanHexValue(valueNode, scope);
			// LDA #__ - Load the ACC with the boolean value (00 | 01)
			_ByteCodeList.push("A9", boolValue);
			// STA $T_ 00 - Store the contents of the ACC in the temp address until backpatching
			_ByteCodeList.push("8D", tempKey, "00");
		}
		else if(type === "string")
		{
			// Get the converted ascii values in an array
			var asciiList = getStringHexValues(valueNode.item, scope);

			// The total offset of all strings in the heap
			var totalOffset = 0
			// Iterate the referenceTable and figure out the total offset already placed in the heap to figure out the next available index
			for(entry in referenceTable)
			{
				if(referenceTable[entry]["type"] === "string" && referenceTable[entry]["offset"] !== undefined)
				{
					totalOffset += referenceTable[entry]["offset"];
				}
			}

			// Note: using the code4data method

			// The next open index in the heap is the total offset subtracted from the total size of memory (256) bc the heap starts from the bottom
			var firstOpenIndex = 256 - totalOffset;
			// The startingIndex of this string in the heap is the number of ascii bytes subtracted from the first open index in the heap
			var startingIndex = firstOpenIndex - asciiList.length;
			// Assign the offset to the string entry
			referenceTable[tempKey]["offset"] = 256 - startingIndex;
			// Now that we know the starting address, we can create a permanent tableEntry in the reference table
			referenceTable[startingIndex.toString(16).toUpperCase()] = referenceTable[tempKey];
			// Delete the temp entry
			delete referenceTable[tempKey];

			// Add the ascii characters to the bytecode list
			for(var i = 0; i < asciiList.length; i++)
			{
				// LDA #__ - Load the ACC with the current character being processed
				_ByteCodeList.push("A9", asciiList[i]);
				// STA $__ __ - Store the contents of the ACC in the current heap address being worked with
				_ByteCodeList.push("8D", (startingIndex + i).toString(16).toUpperCase(), "00");
			}
		}
	}

	// Function to generate code for printing
	function generatePrint(node)
	{
		// Get the node containing the value we want to print
		var valueNode = node.children[0];

		// Three cases:
		// 1. Id - determine whether the Id's value is a static or heap value and handle appropriately
		// 2. String - get the ascii values representing the string and use JustPutItThere method
		// 3. IntExpr OR Boolean - use
		if(typeof valueNode.item === "object")
		{
			// Get the Id Object and all necessary information from it
			var idObject = valueNode.item;
			var type = idObject["symbolTableEntry"].type;

			// Determine whether we are printing an Id representing a static (int | boolean) or heap (string) variable
			if(type === "int" || type === "boolean")
			{
				// Get the temp entry key in the reference table
				var tempKey = getReferenceTableKey(idObject);

				// LDX #01 - Load the X register with the constant "01" to signify we want to print a static var
				_ByteCodeList.push("A2", "01");
				// LDY $T_ 00 - Load the Y register with the contents of the memory location containing the integer
				_ByteCodeList.push("AC", tempKey, "00");
				// FF - System call
				_ByteCodeList.push("FF");
			}
			else
			{
				// Get the hex start location of the string
				var tableEntryKey = getReferenceTableKey(idObject);

				// LDX #02 - Load the X register with the constant "02" to signify we want to print a heap var
				_ByteCodeList.push("A2", "02");
				// LDY #__ - Load the Y register with the memory location containing the start of the string
				_ByteCodeList.push("A0", tableEntryKey);
				// FF - System call
				_ByteCodeList.push("FF");
			}
		}
		else if(isString(valueNode.item))
		{
			// Get the converted ascii values in an array (no scope supplied bc we know it is not an Id)
			var asciiList = getStringHexValues(valueNode.item);

			// Note: using justPutItThere method when printing a string literal (i.e. print ( "hello" ))

			// LDX #02 - Load the X register with the constant "02" to signify we want to print a heap var
			_ByteCodeList.push("A2", "02");
			// LDY #__ - Load the Y register with the memory location 21 locations away from the current location (thats where the string starts)
			_ByteCodeList.push("A0", getMemoryLocation(+21));
			// FF - System call
			_ByteCodeList.push("FF");

			// After the system call, force a false comparison so we can jump past the string
			addFalseComparisonCode();

			// Calculate the length on the string in hex, this is our jump value
			var jumpValue = asciiList.length.toString(16).toUpperCase();
			// Make sure the jump value is two hex digits
			if(jumpValue.length === 1)
				jumpValue = "0" + jumpValue;

			// BNE - branch past the string
			_ByteCodeList.push("D0", jumpValue);

			// Add the ascii characters to the bytecode list
			for(var i = 0; i < asciiList.length; i++)
			{
				// Add the current ascii character to the bytecode list
				_ByteCodeList.push(asciiList[i]);
			}
		}
		else
		{
			// Note: for ints and bools, just use address 00 as the temp location for literals when printing

			// Two cases:
			// 1. IntExpr - get the value and store it in the first memory address (00)
			// 2. Boolean - get the value and store it in the first memory address (00)
			if(isInteger(valueNode.item) || isOperator(valueNode.item))
			{
				// Get the converted int values in an array
				var valueList = getIntHexValues(valueNode);
				// LDA #__ - Load the ACC with the first value
				_ByteCodeList.push("A9", valueList[0]);
				// STA $00 00 - Store the contents of the ACC in the first memory address (00)
				_ByteCodeList.push("8D", "00", "00");

				// Process any additional ints that were part of the intExpr (start at 1 bc we added index 0 already)
				for(var i = 1; i < valueList.length; i++)
				{
					// LDA #__ - Load the ACC with the current int being processed
					_ByteCodeList.push("A9", valueList[i]);
					// ADC $00 00 - Add the contents of memory location 00 to the ACC and keep the result in the ACC
					_ByteCodeList.push("6D", "00", "00");
					// STA $00 00 - Store the contents of the ACC in memory location 00
					_ByteCodeList.push("8D", "00", "00");
				}
			}
			else
			{
				// Get the boolean value in hex form
				var boolValue = getBooleanHexValue(valueNode);
				// LDA #__ - Load the ACC with the boolean value (00 | 01)
				_ByteCodeList.push("A9", boolValue);
				// STA $00 00 - Store the contents of the ACC in the first memory address (00)
				_ByteCodeList.push("8D", "00", "00");
			}

			// LDX #01 - Load the X register with the constant "01" to signify we want to print a static var
			_ByteCodeList.push("A2", "01");
			// LDY $T_ 00 - Load the Y register with the contents of memory location 00 containing the integer or boolean
			_ByteCodeList.push("AC", "00", "00");
			// FF - System call
			_ByteCodeList.push("FF");
		}
	}

	// Function to generate code for an if block
	function generateIf(node)
	{
		// Grab both parts of the if statement
		var equalityNode = node.children[0];
		var blockNode	 = node.children[1];

		// Process both exprs in the equality statement
		// Calculate the first expr in location 00 and place it in the X register
		// Calculate the second expr in location 00 and leave it there
		for(var i = 0; i < 2; i++)
		{
			// Two cases:
			// 1. Id
			// 2. IntExpr OR Boolean
			if(typeof equalityNode.children[i].item === "object")
			{
				// Get the Id Object and all necessary information from it
				var idObject = equalityNode.children[i].item;
				//var type = idObject["symbolTableEntry"].type;

				// Get the temp entry key in the reference table
				var tempKey = getReferenceTableKey(idObject);

				// If we are processing the first expr, store it in the X register when finished
				// Otherwise store it in memory location 00 for the comparison
				if(i == 0)
				{
					// LDX $T_ 00 - Store the value into the temp address until backpatching
					_ByteCodeList.push("AE", tempKey, "00");
				}
				else
				{
					// LDA $T_ 00 - Load the ACC with the contents of the temp memory address until backpatching
					_ByteCodeList.push("AD", tempKey, "00");
					// STA $00 00 - Store the ACC in memory address 00 for the comparison
					_ByteCodeList.push("8D", "00", "00");
				}
			}
			else
			{
				if(isInteger(equalityNode.children[i].item) || isOperator(equalityNode.children[i].item))
				{
					// Get the converted int values in an array
					var valueList = getIntHexValues(equalityNode.children[i]);
					// LDA #__ - Load the ACC with the first value
					_ByteCodeList.push("A9", valueList[0]);
					// STA $00 00 - Store the contents of the ACC in the first memory address (00)
					_ByteCodeList.push("8D", "00", "00");

					// Process any additional ints that were part of the intExpr (start at 1 bc we added index 0 already)
					for(var x = 1; x < valueList.length; x++)
					{
						// LDA #__ - Load the ACC with the current int being processed
						_ByteCodeList.push("A9", valueList[x]);
						// ADC $00 00 - Add the contents of memory location 00 to the ACC and keep the result in the ACC
						_ByteCodeList.push("6D", "00", "00");
						// STA $00 00 - Store the contents of the ACC in memory location 00
						_ByteCodeList.push("8D", "00", "00");
					}

					// If we are processing the first expr, store it in the X register when finished
					if(i == 0)
					{
						// LDX $00 00 - When all processing is finished, store the value in the X register
						_ByteCodeList.push("AE", "00", "00");
					}
				}
				else if(isBoolean(equalityNode.children[i].item))
				{
					// Get the boolean value in hex form
					var boolValue = getBooleanHexValue(equalityNode.children[i]);
					// LDA #__ - Load the ACC with the boolean value (00 | 01)
					_ByteCodeList.push("A9", boolValue);
					// STA $00 00 - Store the contents of the ACC in the first memory address (00)
					_ByteCodeList.push("8D", "00", "00");

					// If we are processing the first expr, store it in the X register when finished
					if(i == 0)
					{
						// LDX $00 00 - When all processing is finished, store the value in the X register
						_ByteCodeList.push("AE", "00", "00");
					}
				}
			}
		}

		// CPX $00 00 - Compare the first expr in the X register to the second expr in memory location 00
		_ByteCodeList.push("EC", "00", "00");

		// BNE
		_ByteCodeList.push("D0", getJumpTableKey());

		// Process the statementList portion of the if statement
		generateStatementList(blockNode);

		// Place a No Op after the statement list ends to aid in backpatching the jump
		_ByteCodeList.push("EA");
	}

	// Function to generate code for a while block
	function generateWhile(node)
	{
		// Grab both parts of the while statement
		var equalityNode = node.children[0];
		var blockNode	 = node.children[1];

		// Before anything is processed, get the address of the first byte of the condition
		var conditionalLocation = _ByteCodeList.length;

		// Process both exprs in the equality statement
		// Calculate the first expr in location 00 and place it in the X register
		// Calculate the second expr in location 00 and leave it there
		for(var i = 0; i < 2; i++)
		{
			// Two cases:
			// 1. Id
			// 2. IntExpr OR Boolean
			if(typeof equalityNode.children[i].item === "object")
			{
				// Get the Id Object and all necessary information from it
				var idObject = equalityNode.children[i].item;
				//var type = idObject["symbolTableEntry"].type;

				// Get the temp entry key in the reference table
				var tempKey = getReferenceTableKey(idObject);

				// If we are processing the first expr, store it in the X register when finished
				// Otherwise store it in memory location 00 for the comparison
				if(i == 0)
				{
					// LDX $T_ 00 - Store the value into the temp address until backpatching
					_ByteCodeList.push("AE", tempKey, "00");
				}
				else
				{
					// LDA $T_ 00 - Load the ACC with the contents of the temp memory address until backpatching
					_ByteCodeList.push("AD", tempKey, "00");
					// STA $00 00 - Store the ACC in memory address 00 for the comparison
					_ByteCodeList.push("8D", "00", "00");
				}
			}
			else
			{
				if(isInteger(equalityNode.children[i].item) || isOperator(equalityNode.children[i].item))
				{
					// Get the converted int values in an array
					var valueList = getIntHexValues(equalityNode.children[i]);
					// LDA #__ - Load the ACC with the first value
					_ByteCodeList.push("A9", valueList[0]);
					// STA $00 00 - Store the contents of the ACC in the first memory address (00)
					_ByteCodeList.push("8D", "00", "00");

					// Process any additional ints that were part of the intExpr (start at 1 bc we added index 0 already)
					for(var x = 1; x < valueList.length; x++)
					{
						// LDA #__ - Load the ACC with the current int being processed
						_ByteCodeList.push("A9", valueList[x]);
						// ADC $00 00 - Add the contents of memory location 00 to the ACC and keep the result in the ACC
						_ByteCodeList.push("6D", "00", "00");
						// STA $00 00 - Store the contents of the ACC in memory location 00
						_ByteCodeList.push("8D", "00", "00");
					}

					// If we are processing the first expr, store it in the X register when finished
					if(i == 0)
					{
						// LDX $00 00 - When all processing is finished, store the value in the X register
						_ByteCodeList.push("AE", "00", "00");
					}
				}
				else if(isBoolean(equalityNode.children[i].item))
				{
					// Get the boolean value in hex form
					var boolValue = getBooleanHexValue(equalityNode.children[i]);
					// LDA #__ - Load the ACC with the boolean value (00 | 01)
					_ByteCodeList.push("A9", boolValue);
					// STA $00 00 - Store the contents of the ACC in the first memory address (00)
					_ByteCodeList.push("8D", "00", "00");

					// If we are processing the first expr, store it in the X register when finished
					if(i == 0)
					{
						// LDX $00 00 - When all processing is finished, store the value in the X register
						_ByteCodeList.push("AE", "00", "00");
					}
				}
			}
		}

		// CPX $00 00 - Compare the first expr in the X register to the second expr in memory location 00
		_ByteCodeList.push("EC", "00", "00");

		// BNE
		_ByteCodeList.push("D0", getJumpTableKey());

		// Process the statementList portion of the if statement
		generateStatementList(blockNode);

		// Force a false comparison of 00 == 01 to jump back to the while condition
		addFalseComparisonCode();

		// Get the location of the jump value
		var jumpValueLocation = _ByteCodeList.length + 1;

		// Calculate the jump value back to the while condition
		var jumpValue = (255 - jumpValueLocation + conditionalLocation).toString(16).toUpperCase();

		// BNE - branch back (forward?) to the while condition (+256 because we want to loop back around in memory)
		_ByteCodeList.push("D0", jumpValue);

		// Place a No Op after the statement list ends to aid in backpatching the jump
		_ByteCodeList.push("EA");
	}

	//
	// Backpatching
	//

	// Function that replaces all temporary reference values and replaces them with permanent memory locations after all code generation is finished
	function performBackpatching()
	{
		// Reference Variables (static)
		performReferenceBackpatching();
		// Jumps
		performJumpBackpatching();
	}

	// Function that replaces all placeholder / temporary static locations with the actual memory locations
	function performReferenceBackpatching()
	{
		// Before we backpatch, delete the string entries, because their addresses and offsets have already been determined
		for(key in referenceTable)
		{
			// Delete string entries
			if(referenceTable[key].type === "string")
				delete referenceTable[key];
		}

		// Iterate the reference table
		for(key in referenceTable)
		{
			// Calculate the permanent memory location of this static variable (bytecodeList.length + offset) and put it in hex form
			var location = (referenceTable[key].offset + _ByteCodeList.length - 1).toString(16).toUpperCase();

			// Make sure the location is two hex digits
			if(location.length === 1)
				location = "0" + location;

			// Iterate the bytecode list to find all occurances of this key
			for(var i = 0; i < _ByteCodeList.length; i++)
			{
				// When found. replace with the permanent memory location
				if(_ByteCodeList[i] === key)
					_ByteCodeList.splice(i, 1, location)
			}

			// Delete the temp entry in the reference table
			delete referenceTable[key];
		}
	}

	// Function that replaces all placeholder / unknown jump values with the actual values
	function performJumpBackpatching()
	{
		// Iterate the jump table
		for(key in jumpTable)
		{
			// Iterate the bytecode list
			for(var i = 0; i < _ByteCodeList.length; i++)
			{
				// Find the temporary jump key, this is the origin of the jump
				if(_ByteCodeList[i] === key)
					var origin = i;

				// Find the No Op after the if/while statement block, this is the jump destination
				if(_ByteCodeList[i] === "EA")
					var destination = i;
			}

			// Calculate the jump distance in hex
			var jumpDistance = (destination - origin).toString(16).toUpperCase();
			// Make sure the jump distance is two hex digits
			if(jumpDistance.length === 1)
				jumpDistance = "0" + jumpDistance;
			// Replace the temp opcode with the actual jump distance
			_ByteCodeList.splice(origin, 1, jumpDistance)
			// Delete the temp entry in the jump table
			delete jumpTable[key];
		}
	}

	//
	// Helper Functions
	//

	// Function that gets the reference table key for static and heap table entries
	function getReferenceTableKey(idObject)
	{
		// Two cases:
		// 1. Variable already exists in table
		//		a. return that key
		// 2. Variable does not exist in table
		//		a. Get the next temp variable number
		//		b. Make entry to the reference table
		// 		c. return temp value "T_"

		// Get necessary information from the idObject to check and store (if neceesary) in the temp table
		var id 	   = idObject["id"];
		var scope  = idObject["symbolTableEntry"].scope;
		var type   = idObject["symbolTableEntry"].type;

		// Determine if this temp entry already exists
		var entryExists = doesEntryExist(id, scope);

		if(entryExists)
		{
			// Find the entry number of the existing table entry and return it
			for(key in referenceTable)
			{
				if(referenceTable[key].id === id && referenceTable[key].scope === scope)
					return key;
			}
		}
		else
		{
			// The temp variable entry number
			var entryNumber = 0;

			// Get the next entry number
			for(key in referenceTable)
			{
				entryNumber++;
			}

			// Determine the offset
			// Int and Boolean - the offset is the number of int and boolean entries + 1
			// String - the offset is the length of the string plus "00" which we do not know at this time, it needs to be determined at assignment
			if(type === "int" || type === "boolean")
			{
				var offset = 0;

				// Find the number of int and boolean entries already in the reference table
				for(key in referenceTable)
				{
					if(referenceTable[key].type !== "string")
						offset++;
				}

				// The offset for this static var is 1 more than the number of int and boolean
				offset++;
			}
			else if(type === "string")
				var offset = undefined;

			// Make an entry in the temp table
			referenceTable["T" + entryNumber] = {"id": id, "type": type, "scope": scope, "offset": offset};

			// Return the temp adress to be added in the bytecode
			return "T" + entryNumber;
		}
	}

	// Function that determines if an entry already exists in the reference table
	function doesEntryExist(id, scope)
	{
		// Iterate reference table and return whether a match was found
		for(key in referenceTable)
		{
			// Find the matching entry, and return true
			if(referenceTable[key].id === id && referenceTable[key].scope === scope)
				return true;
		}

		// No entry was found...
		return false;
	}

	// Function that gets the placeholder / key for the jump value before backpatching
	function getJumpTableKey()
	{
		// The temp jump entry number
		var entryNumber = 0;

		// Get the next entry number
		for(key in jumpTable)
		{
			entryNumber++;
		}

		// Create the entry with the undefined jump location
		jumpTable["J" + entryNumber] = undefined;

		// Return the key
		return "J" + entryNumber;
	}

	// Function that gets an int value and returns and array containing their hex equivalents
	function getIntHexValues(valueNode, scope)
	{
		// The array of ints represented in hex that make up the int expr
		var hexList = [];
		// Make the intitial call
		processIntExpr(valueNode);
		// Return the hex representations
		return hexList;

		// Function that processes an IntExpr and creates the hex list accordingly
		function processIntExpr(valueNode)
		{
			// Note: all int are 0-9, so no conversion is necessary, just add "0" to the beginning

			// If the value is an operator we have an intExpr, process intExpr
			// Otherwise we have a single int, process the int
			if(isOperator(valueNode.item))
			{
				// Add the left child in hex form
				hexList.push("0" + valueNode.children[0].item);
				// Move to the right child
				valueNode = valueNode.children[1];
				// If the right child is an operator, recurse
				// Otherwise add the right child
				if(isOperator(valueNode.item))
				{
					processIntExpr(valueNode);
				}
				else
				{
					// Two cases:
					// 1. int - add the hex version (normal case)
					// 2. Id - add the Id's value
					if(isInteger(valueNode.item))
					{
						hexList.push("0" + valueNode.item);
					}
					else
					{
						// Get the value
						var val = valueNode.item["symbolTableEntry"].value;

						// If the Id's value is another Id, loop until a non Id value is found
						while(isIdentifier(val))
							val = getSymbolTableEntry(val, scope).value;

						// Add the value to the hex list in hex form
						hexList.push("0" + val);
					}
				}
			}
			else
			{
				// Two cases:
				// 1. int - add the hex version (normal case)
				// 2. Id - add the Id's value
				if(isInteger(valueNode.item))
				{
					hexList.push("0" + valueNode.item);
				}
				else
				{
					// Get the value
					var val = valueNode.item["symbolTableEntry"].value;

					// If the Id's value is another Id, loop until a non Id value is found
					while(isIdentifier(val))
						val = getSymbolTableEntry(val, scope).value;

					// Add the value to the hex list in hex form
					hexList.push("0" + val);
				}
			}
		}
	}

	// Function that gets a boolean value an returns the hex representation
	function getBooleanHexValue(valueNode, scope)
	{
		// The boolean hex value to return
		var value;

		// Two cases:
		// 1. Boolean - return the hex representation
		// 2. Id - get the value of the Id and return the value in hexRepresentation
		if(isBoolean(valueNode.item))
		{
			switch(valueNode.item)
			{
				case "true":  value = "01"; break;
				case "false": value = "00"; break;
			}
		}
		else
		{
			value = valueNode.item["symbolTableEntry"].value;

			// If the Id's value is another Id, loop until a non Id value is found
			while(isIdentifier(value))
				value = getSymbolTableEntry(value, scope).value;

			// Convert the value to hex
			switch(value)
			{
				case "true":  value = "01"; break;
				case "false": value = "00"; break;
			}
		}

		return value;
	}

	// Function that gets a string value and returns an array containing their ascii hex representation
	function getStringHexValues(value, scope)
	{
		// If the string value is an Id object, get the value of the Id
		if(typeof value === "object")
		{
			// Get the value
			value = value["symbolTableEntry"].value;

			// If the Id's value is another Id, loop until a non Id value is found
			while(isIdentifier(value))
				value = getSymbolTableEntry(value, scope).value;
		}

		// Remove the double quotes from the string
		value = value.replace(/\"/g, "");
		// Split the string into characters
		var characterList = value.split("");

		// Add converted character to this list
		var asciiCharList = [];

		// Iterate the characters and generate equivalent ascii codes
		for(var i = 0; i < characterList.length; i++)
		{
			// Convert the charCode to ascii hex format and store it in the asciiCharList in uppercase format
			asciiCharList.push(characterList[i].charCodeAt(0).toString(16).toUpperCase());
		}

		// Add a "00" to the string to make it null terminated
		asciiCharList.push("00");

		// Return the ascii code list
		return asciiCharList;
	}

	// Function to get the current memory address or any upcoming addresses when a lookahead value is supplied
	function getMemoryLocation(lookaheadValue)
	{
		var currentMemoryLocation = 0

		for(; currentMemoryLocation < _ByteCodeList.length; currentMemoryLocation++)
		{
			// currentMemoryLocation already being incremented
		}

		// If a lookahead value was supplied add it to the memory location
		if(lookaheadValue)
		{
			currentMemoryLocation = currentMemoryLocation + lookaheadValue
		}

		// Convert the location to hex
		currentMemoryLocation = currentMemoryLocation.toString(16).toUpperCase();

		// If the location is a single digit, add a "0"
		if(currentMemoryLocation.length === 1)
			currentMemoryLocation = "0" + currentMemoryLocation;

		return currentMemoryLocation;
	}

	// Function that adds the necessary byte codes to perform a false comparison of 0 == 1
	function addFalseComparisonCode()
	{
		// LDA #00 - Load the ACC with 00
		_ByteCodeList.push("A9", "00");
		// STA $00 00 - Store the 00 in memory location 00
		_ByteCodeList.push("8D", "00", "00");
		// LDX $00 00 - Store 00 in the X register
		_ByteCodeList.push("AE", "00", "00");
		// LDA #01 - Load the ACC with 01
		_ByteCodeList.push("A9", "01");
		// STA $00 00 - Store 01 in memory location 00
		_ByteCodeList.push("8D", "00", "00");

		// CPX $00 00 - Compare 00 (in the X register) to 01 (in memory location 00)
		_ByteCodeList.push("EC", "00", "00");
	}
}