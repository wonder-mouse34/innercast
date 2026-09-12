import { Cpu, Smartphone } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import { View } from 'react-native';

import { useNativeThemeColor } from '@/lib/theme';
import type { RecommendationEngine } from '@/lib/types';

type Props = {
  engine: RecommendationEngine;
  modelName?: string;
  note?: string;
};

export function EngineBadge({ engine, modelName, note }: Props) {
  const [accent, muted] = useNativeThemeColor(['accent', 'muted']);
  const isModel = engine === 'local-model';

  return (
    <View className="border-border/70 bg-surface/60 rounded-2xl border px-3 py-2.5">
      <View className="flex-row items-center gap-2">
        {isModel ? <Cpu color={accent} size={15} /> : <Smartphone color={muted} size={15} />}
        <Typography type="body-xs" weight="semibold" className={isModel ? 'text-accent' : ''}>
          {isModel ? `Reasoned by your local model` : 'Ranked on this device'}
        </Typography>
        {isModel && modelName ? (
          <Typography type="body-xs" color="muted" truncate className="flex-1">
            {modelName}
          </Typography>
        ) : null}
      </View>
      <Typography type="body-xs" color="muted" className="mt-1.5 leading-5">
        {note ??
          (isModel
            ? 'Answers were restricted to the show library retrieved below.'
            : 'Retrieval and scoring ran locally against the show library.')}
      </Typography>
    </View>
  );
}
