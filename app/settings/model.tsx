import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import {
  Button,
  Chip,
  Description,
  Input,
  Label,
  Slider,
  Spinner,
  Surface,
  Switch,
  TextField,
  Typography,
} from 'heroui-native';
import { Check, Cpu, PlugZap, RotateCcw } from 'lucide-react-native';

import {
  MODEL_PRESETS,
  normalizeBaseUrl,
  testConnection,
  type ModelSettings,
} from '@/lib/rag/llmClient';
import { SectionHeading } from '@/components/SectionHeading';
import { relativeTime } from '@/lib/circleAffinity';
import { useNativeThemeColor } from '@/lib/theme';
import { useSettingsStore } from '@/lib/store/settings';

function temperatureLabel(value: number): string {
  if (value <= 0.2) return 'Very literal';
  if (value <= 0.5) return 'Grounded';
  if (value <= 0.8) return 'A little loose';
  return 'Loose';
}

export default function ModelSettingsScreen() {
  const model = useSettingsStore((state) => state.model);
  const updateModel = useSettingsStore((state) => state.updateModel);
  const resetModel = useSettingsStore((state) => state.resetModel);
  const recordTest = useSettingsStore((state) => state.recordTest);
  const discoveredModels = useSettingsStore((state) => state.discoveredModels);
  const lastTestedAt = useSettingsStore((state) => state.lastTestedAt);
  const lastTestOk = useSettingsStore((state) => state.lastTestOk);
  const lastTestMessage = useSettingsStore((state) => state.lastTestMessage);

  const [accent, muted, accentForeground] = useNativeThemeColor([
    'accent',
    'muted',
    'accent-foreground',
  ]);
  const [testing, setTesting] = useState(false);

  const patch = useCallback(
    <K extends keyof ModelSettings>(key: K, value: ModelSettings[K]) => {
      updateModel({ [key]: value });
    },
    [updateModel],
  );

  const runTest = useCallback(async () => {
    setTesting(true);
    const normalized = normalizeBaseUrl(model.baseUrl);
    if (normalized && normalized !== model.baseUrl) updateModel({ baseUrl: normalized });
    const result = await testConnection({ ...model, baseUrl: normalized || model.baseUrl });
    if (result.ok) {
      recordTest(
        true,
        result.models.length > 0
          ? `Reachable. ${result.models.length} model${result.models.length === 1 ? '' : 's'} available.`
          : 'Reachable, but it did not list any models.',
        result.models,
      );
    } else {
      recordTest(false, result.error, []);
    }
    setTesting(false);
  }, [model, recordTest, updateModel]);

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-16 gap-7"
        keyboardShouldPersistTaps="handled"
      >
        <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Typography type="body" weight="semibold">
                Use my own model
              </Typography>
              <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                InnerCast sends your situation and the shows it retrieved to a server you run.
                Nothing goes anywhere else.
              </Typography>
            </View>
            <Switch
              isSelected={model.enabled}
              onSelectedChange={(value) => patch('enabled', value)}
            />
          </View>
          <Typography type="body-xs" color="muted" className="leading-5">
            When the server is off, unreachable or slow, matches fall back to on-device ranking of
            the same library — you will see which one answered.
          </Typography>
        </Surface>

        <View>
          <SectionHeading
            title="Where it runs"
            caption="Pick a preset, then adjust if your server is on another machine."
          />
          <View className="mb-4 flex-row flex-wrap gap-2">
            {MODEL_PRESETS.map((preset) => {
              const active = normalizeBaseUrl(model.baseUrl) === preset.baseUrl;
              return (
                <Chip
                  key={preset.label}
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  color={active ? 'accent' : 'default'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => patch('baseUrl', preset.baseUrl)}
                >
                  <Chip.Label>{preset.label}</Chip.Label>
                </Chip>
              );
            })}
          </View>

          <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
            <TextField>
              <Label>Server address</Label>
              <Input
                value={model.baseUrl}
                onChangeText={(value) => patch('baseUrl', value)}
                placeholder="http://localhost:11434/v1"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <Description>
                Any OpenAI-compatible endpoint: Ollama, LM Studio, llama.cpp, vLLM. On a phone, use
                your computer’s LAN address rather than localhost.
              </Description>
            </TextField>

            <TextField>
              <Label>Model name</Label>
              <Input
                value={model.model}
                onChangeText={(value) => patch('model', value)}
                placeholder="llama3.1:8b"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </TextField>

            <TextField>
              <Label>API key</Label>
              <Input
                value={model.apiKey}
                onChangeText={(value) => patch('apiKey', value)}
                placeholder="Only if your server asks for one"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </TextField>
          </Surface>
        </View>

        <View>
          <SectionHeading title="Connection" />
          <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
            <Button
              variant="primary"
              isDisabled={testing}
              onPress={() => {
                void runTest();
              }}
            >
              {testing ? <Spinner size="sm" /> : <PlugZap color={accentForeground} size={16} />}
              <Button.Label>{testing ? 'Trying…' : 'Test connection'}</Button.Label>
            </Button>

            {lastTestMessage ? (
              <View className="gap-1">
                <Typography
                  type="body-sm"
                  className={lastTestOk ? 'text-success' : 'text-danger'}
                  weight="medium"
                >
                  {lastTestMessage}
                </Typography>
                {lastTestedAt ? (
                  <Typography type="body-xs" color="muted">
                    Checked {relativeTime(lastTestedAt)}
                  </Typography>
                ) : null}
              </View>
            ) : (
              <Typography type="body-xs" color="muted" className="leading-5">
                Not tested yet.
              </Typography>
            )}

            {discoveredModels.length > 0 ? (
              <View className="gap-2">
                <Typography type="body-sm" weight="semibold">
                  Models on that server
                </Typography>
                {discoveredModels.map((name) => {
                  const active = name === model.model;
                  return (
                    <Pressable
                      key={name}
                      onPress={() => patch('model', name)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      className="flex-row items-center gap-2.5 py-1.5"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      {active ? (
                        <Check color={accent} size={16} />
                      ) : (
                        <Cpu color={muted} size={16} />
                      )}
                      <Typography
                        type="body-sm"
                        className={active ? 'text-accent flex-1' : 'flex-1'}
                        numberOfLines={1}
                      >
                        {name}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </Surface>
        </View>

        <View>
          <SectionHeading title="How it answers" />
          <Surface variant="secondary" className="gap-6 rounded-3xl p-4">
            <View className="gap-2">
              <View className="flex-row items-baseline justify-between gap-3">
                <Typography type="body-sm" weight="medium">
                  Temperature
                </Typography>
                <Typography type="body-xs" color="muted">
                  {model.temperature.toFixed(2)} · {temperatureLabel(model.temperature)}
                </Typography>
              </View>
              <Slider
                value={model.temperature}
                minValue={0}
                maxValue={1}
                step={0.05}
                onChange={(value) => patch('temperature', Array.isArray(value) ? value[0] : value)}
                accessibilityLabel="Temperature"
              >
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
              <Typography type="body-xs" color="muted" className="leading-5">
                Lower keeps the wording close to the library records. Higher lets the model phrase
                things more freely.
              </Typography>
            </View>

            <View className="gap-2">
              <View className="flex-row items-baseline justify-between gap-3">
                <Typography type="body-sm" weight="medium">
                  Patience
                </Typography>
                <Typography type="body-xs" color="muted">
                  {Math.round(model.timeoutMs / 1000)}s
                </Typography>
              </View>
              <Slider
                value={model.timeoutMs / 1000}
                minValue={10}
                maxValue={120}
                step={5}
                onChange={(value) =>
                  patch('timeoutMs', (Array.isArray(value) ? value[0] : value) * 1000)
                }
                accessibilityLabel="Patience in seconds"
              >
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
              <Typography type="body-xs" color="muted" className="leading-5">
                How long to wait before falling back to on-device ranking. Small models on a laptop
                often need 30 seconds or more.
              </Typography>
            </View>

            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Typography type="body-sm" weight="semibold">
                  Ask for strict JSON
                </Typography>
                <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                  Keep this on if your server supports it. Turn it off if requests come back
                  rejected.
                </Typography>
              </View>
              <Switch
                isSelected={model.jsonMode}
                onSelectedChange={(value) => patch('jsonMode', value)}
              />
            </View>
          </Surface>
        </View>

        <Button variant="ghost" onPress={resetModel}>
          <RotateCcw color={muted} size={15} />
          <Button.Label>Reset to defaults</Button.Label>
        </Button>

        <Typography type="body-xs" color="muted" className="leading-5">
          The show library never leaves this device. Only your situation and the handful of records
          retrieved for it are sent to the address above, and the model may only choose from those.
        </Typography>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
