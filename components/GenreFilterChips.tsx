import { Chip, Typography } from 'heroui-native';
import { View } from 'react-native';

import { GENRE_OPTIONS, type GenreFilter } from '@/lib/genres';

type GenreFilterProps = {
  selected: GenreFilter[];
  onToggle: (genre: GenreFilter) => void;
};

export function GenreFilterChips({ selected, onToggle }: GenreFilterProps) {
  return (
    <View className="gap-2.5">
      <Typography type="body-sm" weight="medium">
        Genre
      </Typography>
      <View className="flex-row flex-wrap gap-2">
        {GENRE_OPTIONS.map((genre) => {
          const active = selected.includes(genre);
          return (
            <Chip
              key={genre}
              size="sm"
              variant={active ? 'primary' : 'secondary'}
              color={active ? 'accent' : 'default'}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onToggle(genre)}
            >
              <Chip.Label>{genre}</Chip.Label>
            </Chip>
          );
        })}
      </View>
      <Typography type="body-xs" color="muted" className="leading-5">
        Choose any that fit. Leave all unselected to search every genre.
      </Typography>
    </View>
  );
}
