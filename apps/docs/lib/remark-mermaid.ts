import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';

/**
 * Remark plugin that transforms mermaid code blocks into JSX components
 * This runs during markdown parsing, BEFORE conversion to HTML
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      // Only process mermaid code blocks
      if (node.lang !== 'mermaid') return;
      if (!parent || typeof index !== 'number') return;

      // Create a JSX element to replace the code block
      const mermaidNode: any = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'chart',
            value: node.value,
          },
        ],
        children: [],
        data: {
          _mdxExplicitJsx: true,
        },
      };

      // Replace the code node with the Mermaid component
      parent.children[index] = mermaidNode;
    });
  };
}
