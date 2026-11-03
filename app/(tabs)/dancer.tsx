import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParentScreen from './parent';
import { Chip } from '../../src/components/Chip';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { useDancer } from '../../src/context/DancerContext';
import { useProgress } from '../../src/context/ProgressContext';
import { useSettings } from '../../src/context/SettingsContext';
import {
  LEGEND_COLOR,
  RANK_TIERS,
  ageFromBirthDate,
  categoryForAge,
  formatBirthDateInput,
  rankFor,
  xpFor,
} from '../../src/lib/dancer';
import { withAlpha } from '../../src/lib/color';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

type SubTab = 'dancer' | 'parent';

export default function DancerScreen() {
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubTab>('dancer');
  const { palettes, activeTab } = useSettings();
  const accent = (palettes[activeTab] ?? palettes.index).from;

  return (
    <StageBackground>
      <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.segments}>
          <Chip
            label="Профиль"
            active={sub === 'dancer'}
            onPress={() => setSub('dancer')}
            accent={accent}
          />
          <Chip
            label="Родитель"
            active={sub === 'parent'}
            onPress={() => setSub('parent')}
            accent={accent}
          />
        </View>

        {sub === 'parent' ? <ParentScreen /> : <DancerProfile />}
      </View>
    </StageBackground>
  );
}

function DancerProfile() {
  const insets = useSafeAreaInsets();
  const { firstName, lastName, birthDate, avatarUri, update } = useDancer();
  const { completedLessons, practiceSeconds, stars } = useProgress();
  // Файл аватара мог исчезнуть (очистка кеша) — тогда показываем заглушку.
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(avatarUri) && !avatarFailed;

  const age = ageFromBirthDate(birthDate);
  const category = categoryForAge(age);
  const xp = xpFor({
    lessons: completedLessons.length,
    practiceMinutes: Math.floor(practiceSeconds / 60),
    stars,
  });
  const rank = rankFor(xp);
  const activeTier = rank.isLegend ? RANK_TIERS.length : Math.floor(rank.index / 3);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarFailed(false);
      update({ avatarUri: result.assets[0].uri });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.scroll}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          // Запас под плавающую панель вкладок.
          { paddingBottom: insets.bottom + 108 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <Pressable
        onPress={pickAvatar}
        style={styles.avatarWrap}
        accessibilityRole="button"
        accessibilityLabel="Выбрать фото профиля из галереи"
      >
        {/* Плюс лежит под фото: если файл не открылся, заглушка всё равно видна. */}
        <View style={[styles.avatar, styles.avatarEmpty]}>
          <Text style={styles.avatarGlyph}>+</Text>
          {showAvatar ? (
            <Image
              source={{ uri: avatarUri ?? undefined }}
              style={styles.avatarImage}
              onError={() => setAvatarFailed(true)}
            />
          ) : null}
        </View>
        <Text style={type.caption}>Выбрать фото</Text>
      </Pressable>

      <Text style={[type.section, styles.section]}>Профиль танцора</Text>

      <Field
        label="Имя"
        value={firstName}
        placeholder="Например, Алиса"
        onChangeText={(value) => update({ firstName: value })}
      />
      <Field
        label="Фамилия"
        value={lastName}
        placeholder="Фамилия"
        onChangeText={(value) => update({ lastName: value })}
      />
      <Field
        label="Дата рождения"
        value={birthDate}
        placeholder="ДД.ММ.ГГГГ"
        keyboardType="number-pad"
        onChangeText={(value) => update({ birthDate: formatBirthDateInput(value) })}
      />

      <View style={styles.card}>
        <Text style={type.label}>Возрастная категория</Text>
        <Text style={type.section}>
          {category ? category.title : 'Укажи дату рождения'}
        </Text>
        {age !== null ? (
          <Text style={type.caption}>Полных лет: {age}</Text>
        ) : null}
      </View>

      <Text style={[type.section, styles.section]}>Ранг</Text>
      <View style={[styles.card, { borderColor: withAlpha(rank.color, 0.4) }]}>
        <View style={styles.rankRow}>
          <Text style={[styles.rankTitle, { color: rank.color }]}>{rank.title}</Text>
          <Text style={styles.rankXp}>{xp} XP</Text>
        </View>
        <View style={styles.rankLadder}>
          {RANK_TIERS.map((tier, tierIndex) => {
            const active = activeTier === tierIndex;
            const passed = activeTier > tierIndex;
            return (
              <View
                key={tier.name}
                style={[
                  styles.tierChip,
                  {
                    borderColor: withAlpha(tier.color, active ? 0.85 : 0.22),
                    backgroundColor: withAlpha(
                      tier.color,
                      active ? 0.2 : passed ? 0.1 : 0.04,
                    ),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tierChipText,
                    {
                      color: active
                        ? tier.color
                        : passed
                          ? withAlpha(tier.color, 0.8)
                          : withAlpha(tier.color, 0.4),
                    },
                  ]}
                >
                  {tier.name}
                </Text>
              </View>
            );
          })}
          <View
            style={[
              styles.tierChip,
              {
                borderColor: withAlpha(
                  LEGEND_COLOR,
                  activeTier === RANK_TIERS.length ? 0.85 : 0.22,
                ),
                backgroundColor: withAlpha(
                  LEGEND_COLOR,
                  activeTier === RANK_TIERS.length ? 0.2 : 0.04,
                ),
              },
            ]}
          >
            <Text
              style={[
                styles.tierChipText,
                {
                  color:
                    activeTier === RANK_TIERS.length
                      ? LEGEND_COLOR
                      : withAlpha(LEGEND_COLOR, 0.4),
                },
              ]}
            >
              Легенда
            </Text>
          </View>
        </View>
        <View style={styles.rankTrack}>
          <View
            style={[
              styles.rankFill,
              {
                width: `${Math.round(rank.progress * 100)}%`,
                backgroundColor: rank.color,
              },
            ]}
          />
        </View>
        <Text style={type.caption}>{rank.hint}</Text>
        <Text style={type.caption}>
          XP растёт за уроки, звёзды и практику под метрономом. Звание
          показывается на всех экранах — это единственная шкала прогресса.
        </Text>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={[type.label, styles.fieldLabel]}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        style={styles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  avatarWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
    overflow: 'hidden',
  },
  avatarImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontFamily: fonts.body,
    fontSize: 34,
    lineHeight: 40,
    color: colors.muted,
  },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  field: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    backgroundColor: colors.panel,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankTitle: {
    fontFamily: fonts.brand,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.4,
  },
  rankXp: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  rankLadder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tierChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tierChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  rankTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  rankFill: {
    height: '100%',
    borderRadius: 3,
  },
});
