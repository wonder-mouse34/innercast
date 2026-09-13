import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, TextField, Typography } from 'heroui-native';
import { router } from 'expo-router';

import { goBackOrReplace } from '@/lib/navigation';
import { useCircleStore } from '@/lib/store/circles';

export default function NewCircleScreen() {
  const createCircle = useCircleStore((state) => state.createCircle);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');

  const canCreate = name.trim().length > 1 && tagline.trim().length > 1;

  const handleCreate = () => {
    if (!canCreate) return;
    const trimmedTagline = tagline.trim();
    const circle = createCircle({
      name: name.trim(),
      tagline: trimmedTagline,
      description: trimmedTagline,
      situations: [],
      traitProfile: {},
      cadence: 'Open-ended',
      weeklyPrompt: 'What have you been watching lately?',
    });
    router.dismissTo({ pathname: '/circle/[id]', params: { id: circle.id } });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4 pb-16 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <Typography type="body-sm" color="muted" className="leading-6">
          Give your circle a name and a short line so people know whether it is for them.
        </Typography>

        <TextField isRequired>
          <Label>Name</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="The Sunday Slow Watch"
            autoCapitalize="words"
            returnKeyType="next"
          />
        </TextField>

        <TextField isRequired>
          <Label>One line about who it is for</Label>
          <Input
            value={tagline}
            onChangeText={setTagline}
            placeholder="For people whose weeks end heavier than they start."
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </TextField>

        <View className="gap-3">
          <Button variant="primary" isDisabled={!canCreate} onPress={handleCreate}>
            <Button.Label>Create circle</Button.Label>
          </Button>
          <Button variant="ghost" onPress={() => goBackOrReplace('/circles')}>
            <Button.Label>Cancel</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
