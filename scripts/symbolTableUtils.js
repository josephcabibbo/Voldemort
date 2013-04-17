/*  ------------------------------------------------------------------------
 *	Filename: symbolTableUtils.js
 *	Author: Joey Cabibbo
 *	Description: Symbol table utility functions
 *	------------------------------------------------------------------------ */

// Function that will return the symbol table entry for the supplied id
// If the id is not in the current scope, check the parent scope hierarchy until found
function getSymbolTableEntry(id, scope)
{
	// Dafualt entry assuming this entry exists in this scope
	var entry = _SymbolTableList[scope][id];

	// If the current scope does not have an entry associated with this id, check the parent scope until found
	// When found, return that symbol table entry
	//if(!_SymbolTableList[scope].hasOwnProperty(id))
	while(entry === undefined)
		entry = getSymbolTableEntry(id, _SymbolTableList[scope].parentScope);

	return entry;
}

// Function to set an identifier as "used"
function setIdentifierAsUsed(id, scope)
{
	// Dafualt entry assuming this entry exists in this scope
	var entry = _SymbolTableList[scope][id];

	// If the current scope does not have an entry associated with this id call getSymbolTableEntry()
	// to look in the parent hierarchy until found.  When found set it as "used"
	if(!_SymbolTableList[scope].hasOwnProperty(id))
		entry = getSymbolTableEntry(id, scope);

	entry.isUsed = true;
}

// Function to check the symbol table for declared but uninitialized variables
function checkForUninitializedVariables()
{
	// Iterate each scope's symbol table
	for(var i = 0; i < _SymbolTableList.length; i++)
	{
		// Iterate each symbol in the scope's symbol table
		for(symbol in _SymbolTableList[i])
		{
			// If the symbol table entry exists and has no value and is not the parentScope attribute, it is uninitialized.  Warn the user and initialized it to a default value.
			if(_SymbolTableList[i][symbol].value === undefined && symbol !== "parentScope" )
			{
				uninitializedVariableWarning(symbol, i);
				initializeToDefaultValue(symbol, i);
			}
		}
	}
}

// Function called by checkForUninitializedVariables() to initialize uninitialized variables to default values
function initializeToDefaultValue(symbol, scope)
{
	// Get the symbol table entry in the current scope
	var symbolTableEntry = _SymbolTableList[scope][symbol];

	// Set the value to a default value corresponding to its type
	switch(symbolTableEntry.type)
	{
		case "int":    symbolTableEntry.value = "0"; break;
		case "string": symbolTableEntry.value = "\"\"";  break;
	}

	// Display a trace event
	_OutputManager.addTraceEvent("Initialized identifier '" + symbol + "' to a default " + symbolTableEntry.type + " value")
}

// Function to check the symbol table for unused variables
function checkForUnusedVariables()
{
	// Iterate each scope's symbol table
	for(var i = 0; i < _SymbolTableList.length; i++)
	{
		// Iterate each symbol in the scope's symbol table
		for(symbol in _SymbolTableList[i])
		{
			// If the symbol table entry's "isUsed" property is false it is not used.  Warn the user.
			if(_SymbolTableList[i][symbol].isUsed === false)
				unusedVariableWarning(symbol, i);
		}
	}
}
