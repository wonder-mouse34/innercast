import { Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import { Separator, Typography } from 'heroui-native';

type MarkdownAnswerProps = {
  children: string;
};

type InlinePart = {
  content: string;
  type: 'bold' | 'italic' | 'text';
};

const INLINE_MARKUP = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_)/g;
const BULLET = /^\s*[-+*]\s+(.+)$/;
const HEADING = /^\s*##\s+(.+)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;

function inlineParts(value: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let cursor = 0;

  for (const match of value.matchAll(INLINE_MARKUP)) {
    const index = match.index;
    if (index > cursor) {
      parts.push({ content: value.slice(cursor, index), type: 'text' });
    }

    const token = match[0];
    if (token.startsWith('**') || token.startsWith('__')) {
      parts.push({ content: token.slice(2, -2), type: 'bold' });
    } else {
      parts.push({ content: token.slice(1, -1), type: 'italic' });
    }
    cursor = index + token.length;
  }

  if (cursor < value.length) {
    parts.push({ content: value.slice(cursor), type: 'text' });
  }

  return parts;
}

function renderInline(value: string, keyPrefix: string): ReactNode {
  return inlineParts(value).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.type === 'bold') {
      return (
        <Typography key={key} type="body-sm" weight="bold">
          {part.content}
        </Typography>
      );
    }
    if (part.type === 'italic') {
      return (
        <Typography key={key} type="body-sm" className="italic">
          {part.content}
        </Typography>
      );
    }
    return <Fragment key={key}>{part.content}</Fragment>;
  });
}

function startsBlock(line: string): boolean {
  return HEADING.test(line) || BULLET.test(line) || QUOTE.test(line) || RULE.test(line);
}

export function MarkdownAnswer({ children }: MarkdownAnswerProps) {
  const lines = children.replaceAll('\r\n', '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push(
        <Typography key={`heading-${index}`} type="h4" weight="semibold" selectable>
          {renderInline(heading[1], `heading-${index}`)}
        </Typography>,
      );
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push(<Separator key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoteLines: string[] = [];
      const start = index;
      while (index < lines.length) {
        const quote = lines[index].match(QUOTE);
        if (!quote) break;
        quoteLines.push(quote[1]);
        index += 1;
      }
      blocks.push(
        <View key={`quote-${start}`} className="border-accent/40 border-l-2 py-0.5 pl-3">
          <Typography type="body-sm" color="muted" className="leading-6 italic" selectable>
            {renderInline(quoteLines.join('\n'), `quote-${start}`)}
          </Typography>
        </View>,
      );
      continue;
    }

    if (BULLET.test(line)) {
      const items: { content: string; lineIndex: number }[] = [];
      const start = index;
      while (index < lines.length) {
        const bullet = lines[index].match(BULLET);
        if (!bullet) break;
        items.push({ content: bullet[1], lineIndex: index });
        index += 1;
      }
      blocks.push(
        <View key={`list-${start}`} className="gap-2">
          {items.map((item) => (
            <View key={`item-${item.lineIndex}`} className="flex-row items-start gap-2.5">
              <Typography type="body-sm" className="text-accent leading-6">
                •
              </Typography>
              <Typography type="body-sm" className="flex-1 leading-6" selectable>
                {renderInline(item.content, `item-${item.lineIndex}`)}
              </Typography>
            </View>
          ))}
        </View>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    const start = index;
    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <Typography key={`paragraph-${start}`} type="body-sm" className="leading-6" selectable>
        {renderInline(paragraphLines.join(' '), `paragraph-${start}`)}
      </Typography>,
    );
  }

  return <View className="gap-3">{blocks}</View>;
}
