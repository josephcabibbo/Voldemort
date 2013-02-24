/*  --------------------------------------------------
 *	Filename: cst.js
 *	Author: Joey Cabibbo
 *  Requires: globals.js
 *	Description: The concrete syntax tree parse output
 *	-------------------------------------------------- */

function CST()
{
	// The root of the tree
	this.root = null;
	// The current node object
	this.currentNode = null;

	// Function to add a non-terminal node to the cst
	this.addNonTerminal = function(name)
	{
		// FOR NONTERMINALS, MAY WANT TO CONSIDER CHANGING IT FROM TOKEN TO NAME
		// Non-terminal nodes consists of a token, its children, and its parent node (previously created node)
		var node = {"name": name, "children": [], "parent": this.currentNode, "nodeType": "non-terminal"};

		// If the tree has no root yet, this is the root
		// Otherwise, add the new node as a child to the previous node
		if(!this.root)
		{
			this.root = node;
		}
		else
		{
			this.currentNode.children.push(node);
		}

		// Set the currentNode to the node we just created
		this.currentNode = node;
	}

	// Function to add a terminal  node to the cst
	this.addTerminal = function(token)
	{
		// Terminal nodes consist of a token and its parent node (previously created node)
		var node = {"token": token, "parent":this.currentNode, "nodeType": "terminal"};

		// Add the new node as a child to the previous node
		this.currentNode.children.push(node);
	}

	// Function to jump up a level in the tree once we are done adding children
	this.endChildren = function()
	{
		this.currentNode = this.currentNode.parent;
	}
}