export class RadixTreeNode {
    children: { [key: string]: RadixTreeNode };
    isEndOfWord: boolean;
  
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }
  
  class RadixTree {
    root: RadixTreeNode;
  
    constructor() {
      this.root = new RadixTreeNode();
    }
  
    insert(word: string) {
      let currentNode = this.root;
  
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
  
        if (!currentNode.children[char]) {
          currentNode.children[char] = new RadixTreeNode();
        }
  
        currentNode = currentNode.children[char];
      }
  
      currentNode.isEndOfWord = true;
    }
  
    search(query: string): string[] {
      let currentNode = this.root;
      const results: string[] = [];
  
      for (let i = 0; i < query.length; i++) {
        const char = query[i];
  
        if (!currentNode.children[char]) {
          return results; // No matching results found
        }
  
        currentNode = currentNode.children[char];
      }
  
      this.traverse(currentNode, query, results);
      return results;
    }
  
    traverse(node: RadixTreeNode, prefix: string, results: string[]) {
      if (node.isEndOfWord) {
        results.push(prefix);
      }
  
      for (const char in node.children) {
        this.traverse(node.children[char], prefix + char, results);
      }
    }
  }
  