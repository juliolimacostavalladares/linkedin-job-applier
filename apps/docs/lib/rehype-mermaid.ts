import { visit } from 'unist-util-visit';
import type { Root } from 'hast';

/**
 * Rehype plugin that transforms mermaid code blocks into custom components
 * This runs during MDX compilation, before syntax highlighting
 */
export function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      // Look for <pre><code class="language-mermaid">...</code></pre>
      if (
        node.tagName === 'pre' &&
        Array.isArray(node.children) &&
        node.children.length === 1 &&
        node.children[0].type === 'element' &&
        node.children[0].tagName === 'code'
      ) {
        const codeNode = node.children[0];
        const className = codeNode.properties?.className;

        // Check if it's a mermaid code block
        if (
          Array.isArray(className) &&
          className.some((c) => c === 'language-mermaid')
        ) {
          // Extract the mermaid code
          const textNode = codeNode.children.find((child) => child.type === 'text');
          if (!textNode || textNode.type !== 'text') return;

          const code = textNode.value;

          // Replace the pre element with our Mermaid component
          if (parent && typeof index === 'number') {
            parent.children[index] = {
              type: 'element',
              tagName: 'Mermaid',
              properties: {
                chart: code,
              },
              children: [],
            };
          }
        }
      }
    });
  };
}
