import { ScrollView, View } from 'react-native';
import { Surface, Typography } from 'heroui-native';
import { AlertTriangle, CheckCircle2, CircleSlash, Info } from 'lucide-react-native';

import { SectionHeading } from '@/components/SectionHeading';
import { CHARACTERS } from '@/lib/data/characters';
import { SHOWS } from '@/lib/data/shows';
import { corpusDiagnostics, corpusSource } from '@/lib/graph/corpus';
import { graphSummary } from '@/lib/graph/store';
import { GRAPH_EDGE_TYPES, GRAPH_NODE_TYPES } from '@/lib/graph/types';
import { useNativeThemeColor } from '@/lib/theme';

/**
 * What graph the app is running on, and what is wrong with it.
 *
 * Reading a graph file is the one place where a silent failure would be
 * invisible — a typo'd id or a dangling edge just quietly removes matches. So
 * every diagnostic the loader and the projection raised is shown here in full.
 */
export default function GraphStatusScreen() {
  const [accent, muted, warning, danger] = useNativeThemeColor([
    'accent',
    'muted',
    'warning',
    'danger',
  ]);

  const summary = graphSummary();
  const source = corpusSource();
  const diagnostics = [...summary.diagnostics, ...corpusDiagnostics()];

  const nodeCounts = GRAPH_NODE_TYPES.map((type) => ({
    type,
    count: summary.stats[type] ?? 0,
  })).filter((row) => row.count > 0);

  const otherNodes = Object.entries(summary.stats).filter(
    ([key]) =>
      key !== 'nodes' && key !== 'edges' && !(GRAPH_NODE_TYPES as readonly string[]).includes(key),
  );

  const errors = diagnostics.filter((entry) => entry.level === 'error').length;
  const warnings = diagnostics.filter((entry) => entry.level === 'warning').length;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 px-5 pb-16 pt-4"
      keyboardShouldPersistTaps="handled"
    >
      <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
        <View className="flex-row items-center gap-3">
          {summary.supplied ? (
            <CheckCircle2 color={accent} size={20} />
          ) : (
            <CircleSlash color={muted} size={20} />
          )}
          <View className="flex-1">
            <Typography type="body" weight="medium">
              {summary.supplied ? (summary.name ?? 'Graph loaded') : 'No graph supplied'}
            </Typography>
            <Typography type="body-xs" color="muted" className="mt-1 leading-5">
              {summary.supplied
                ? `${summary.stats.nodes} nodes · ${summary.stats.edges} edges`
                : `Drop a graph document at ${summary.assetPath} and reload.`}
            </Typography>
          </View>
        </View>

        <Typography type="body-xs" color="muted" className="leading-5">
          Recommendations are running on{' '}
          <Typography type="body-xs" weight="semibold">
            {source === 'graph' ? 'the supplied graph' : 'the built-in corpus'}
          </Typography>
          : {SHOWS.length} shows, {CHARACTERS.length} characters. A graph with show nodes replaces
          the built-in corpus entirely; one without them still adds links the search can walk.
        </Typography>
      </Surface>

      {summary.supplied && nodeCounts.length > 0 ? (
        <View className="gap-3">
          <SectionHeading title="What is in it" />
          <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
            {nodeCounts.map((row) => (
              <View key={row.type} className="flex-row items-center justify-between">
                <Typography type="body-sm" className="capitalize">
                  {row.type}
                </Typography>
                <Typography type="body-sm" color="muted">
                  {row.count}
                </Typography>
              </View>
            ))}
            {otherNodes.length > 0 ? (
              <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                Also carrying node types the app has no structure for, which take part in the walk
                only: {otherNodes.map(([type, count]) => `${type} (${count})`).join(', ')}.
              </Typography>
            ) : null}
          </Surface>
        </View>
      ) : null}

      <View className="gap-3">
        <SectionHeading
          title="Checks"
          caption={
            diagnostics.length === 0
              ? 'Nothing to report.'
              : `${errors} error${errors === 1 ? '' : 's'} · ${warnings} warning${
                  warnings === 1 ? '' : 's'
                }`
          }
        />
        <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
          {diagnostics.length === 0 ? (
            <Typography type="body-sm" color="muted" className="leading-6">
              The file parsed cleanly and every edge points at a node that exists.
            </Typography>
          ) : (
            diagnostics.map((entry) => (
              <View key={`${entry.level}-${entry.message}`} className="flex-row gap-3">
                {entry.level === 'error' ? (
                  <AlertTriangle color={danger} size={16} />
                ) : entry.level === 'warning' ? (
                  <AlertTriangle color={warning} size={16} />
                ) : (
                  <Info color={muted} size={16} />
                )}
                <Typography type="body-xs" color="muted" className="flex-1 leading-5">
                  {entry.message}
                </Typography>
              </View>
            ))
          )}
        </Surface>
      </View>

      <View className="gap-3">
        <SectionHeading title="The shape it expects" />
        <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
          <Typography type="body-xs" color="muted" className="leading-5">
            Ids are namespaced, as in{' '}
            <Typography type="body-xs" weight="semibold">
              show:the-bear
            </Typography>
            . Prose goes in a node&apos;s{' '}
            <Typography type="body-xs" weight="semibold">
              text
            </Typography>{' '}
            field so it is searchable; relationships go in edges, not properties. Weights are 0-1
            and scale how strongly a search crosses that link.
          </Typography>
          <Typography type="body-xs" color="muted" className="leading-5">
            Node types read structurally: {GRAPH_NODE_TYPES.join(', ')}.
          </Typography>
          <Typography type="body-xs" color="muted" className="leading-5">
            Edge types with tuned weights: {GRAPH_EDGE_TYPES.join(', ')}. Anything outside these
            lists is kept and walked weakly rather than rejected.
          </Typography>
        </Surface>
      </View>
    </ScrollView>
  );
}
