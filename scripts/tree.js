/*  -----------------------------------------------------------------------------------------
 *	Filename: tree.js
 *	Author: Joey Cabibbo based on the work of Alan Labouseur, Michael Ardizzone, and Tim Smith
 *	Description: A tree data structure used for the CST and AST
 *	----------------------------------------------------------------------------------------- */

function Tree()
{
	// The root of the tree
	this.root = null;
	// The current node object
	this.currentNode = null;

	// Function to add a node to the tree (nodeType = branch || leaf)
	this.addNode = function(item, nodeType)
	{
		// Nodes consists of an item, its children, its parent node (previously created node), and its nodeType
		var node = {"item": item, "children": [], "parent": this.currentNode, "nodeType": nodeType};

		// If the tree has no root yet, this is the root
		// Otherwise, add the new node as a child to the parent node
		if(!this.root)
		{
			this.root = node;
		}
		else
		{
			this.currentNode.children.push(node);
		}

		// If this node is a branch node, set it as the current node
		if(nodeType === "branch")
		{
			this.currentNode = node;
		}
	}

	// Function to jump up a level in the tree to the parent node once we are done adding children ("leafs")
	this.endChildren = function()
	{
		this.currentNode = this.currentNode.parent;
	}

	// Function to "stringify" the tree
	this.toString = function()
	{
		var traversalResult = "";

		// Recursive function to handle the expansion of the nodes
		function expand(node, depth)
		{
			// Format the result based on the current depth to make it look like a tree
			for(var i = 0; i < depth; i++)
			{
				traversalResult += "-";
			}

			// If there are no children, we have a leaf node
			if(!node.children || node.children.length === 0)
			{
				// Possibly use a ternary to disply kind when it is a token, and just the item when it is not a token
				traversalResult +=  node.item + "\n";
			}
			else
			{
				// There are children, so we have a branch node
				traversalResult += "(" + node.item + ")\n";
				// Recursively expand the branch's children
				for(var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1)
				}
			}
		}

		// Make the inital call to expand from the root node
		expand(this.root, 0);
		// Return the result
		return traversalResult;
	}

	// Alternative toString function for the syntax tree generator
	this.toStringAlt = function()
	{
		var traversalResult = "";

		// Recursive function to handle the expansion of the nodes
		function expand(node, depth)
		{
			// If there are no children, we have a leaf node
			if(!node.children || node.children.length === 0)
			{
				// Possibly use a ternary to disply kind when it is a token, and just the item when it is not a token
				traversalResult += "[" + node.item + "]";
			}
			else
			{
				// There are children, so we have a branch node
				traversalResult += "[" + node.item; // + "] ";
				// Recursively expand the branch's children
				for(var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1)
				}

				traversalResult += "]"
			}
		}

		// Make the inital call to expand from the root node
		expand(this.root, 0);
		// Return the result
		return traversalResult;
	}
}