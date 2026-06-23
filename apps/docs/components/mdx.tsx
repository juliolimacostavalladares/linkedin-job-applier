import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { type ReactNode, type ComponentProps } from 'react';
import { APIPage } from './api-page-client';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Mermaid } from './mermaid';

function Pre(props: ComponentProps<'pre'>) {
  const children = props.children as ReactNode;

  if (
    typeof children === 'object' &&
    children !== null &&
    'props' in children
  ) {
    const childProps = children.props as { className?: string; children?: ReactNode };
    const className = childProps.className ?? '';

    if (className.includes('language-mermaid')) {
      const code =
        typeof childProps.children === 'string'
          ? childProps.children
          : '';
      return <Mermaid chart={code} />;
    }
  }

  return <pre {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: Pre,
    Mermaid,
    APIPage: APIPage,
    OpenAPIPage: APIPage,
    Step,
    Steps,
    Tabs,
    Tab,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
