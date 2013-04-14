/*  ------------------------------------------------------------------------
 *	Filename: scopeManager.js
 *	Author: Joey Cabibbo
 *	Description: A scope object and utility functions to ensure proper creation,
 *				 switching, and maintenance of scope.
 *	------------------------------------------------------------------------ */

function ScopeManager()
{
	// The current scope environment
	this.currentScope = -1;
	// A list containing all previous scope [least recent - most recent]
	this.previousScopeList = [];

	// Function that will initialize and enter a new scope
	this.initializeNewScope = function()
	{
		// Add the current scope to the previous scope list before getting a new scope
		this.previousScopeList.push(this.currentScope);
		// Before we get a new scope store it as the previous scope to be used as the parentScope value
		var previousScope = this.currentScope;
		// Get a new scope
		this.currentScope = this.getNextScope();

		// Initialize the scope in the symbol table with its parentScope value
	    _SymbolTableList[this.currentScope] = {"parentScope": previousScope};
	}

	// Function that will leave the current scope and return to the previous scope
	this.leaveCurrentScope = function()
	{
		// Return to the previous scope
		this.currentScope = this.previousScopeList.pop();
	}

	// Function that return the next availble (unique) scope value
	this.getNextScope = function()
	{
		var nextScope = 0;

		// See how many scopes we already have, and return the next open index
		for(var i = 0; i < _SymbolTableList.length; i++)
		{
			nextScope++;
		}

		return nextScope;
	}
}