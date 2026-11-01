import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParentScreen from './parent';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { useDancer } from '../../src/context/DancerContext';
import { useProgress } from '../../src/context/ProgressContext';
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
import { colors, fonts, spacing } from '../../src/theme';

type SubTab = 'dancer' | 'parent';

export default function DancerScreen() {
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubTab>('dancer');

  return (
    <StageBackground>
      <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.segments}>
          <Pressable
            onPress={() => setSub('dancer')}
            style={[styles.segment, sub === 'dancer' && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, sub === 'dancer' && styles.segmentTextActive]}
            >
              Танцор
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSub('parent')}
            style={[styles.segment, sub === 'parent' && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, sub === 'parent' && styles.segmentTextActive]}
            >
              Родитель
            </Text>
          </Pressable>
        </View>

        {sub === 'parent' ? <ParentScreen /> : <DancerProfile />}
      </View>
    </StageBackground>
  );
}

function DancerProfile() {
  const { firstName, lastName, birthDate, avatarUri, update } = useDancer();
  const { completedLessons, practiceSeconds, stars } = useProgress();

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
      update({ avatarUri: result.assets[0].uri });
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Text style={styles.avatarGlyph}>＋</Text>
          </View>
        )}
        <Text style={styles.avatarHint}>Выбрать фото</Text>
      </Pressable>

      <Text style={styles.section}>Профиль танцора</Text>

      <Field
        label="Имя"
        value={firstName}
        placeholder="Например, Танцор"
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
        <Text style={styles.cardLabel}>Возрастная категория</Text>
        <Text style={styles.cardValue}>
          {category ? category.title : 'укажите дату рождения'}
        </Text>
        {age !== null ? (
          <Text style={styles.cardHint}>Полных лет: {age}</Text>
        ) : null}
      </View>

      <Text style={styles.section}>Ранг</Text>
      <View style={[styles.card, { borderColor: withAlpha(rank.color, 0.5) }]}>
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
                    borderColor: withAlpha(tier.color, active ? 0.9 : 0.28),
                    backgroundColor: withAlpha(tier.color, active ? 0.24 : passed ? 0.12 : 0.05),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tierChipText,
                    { color: active || passed ? tier.color : withAlpha(tier.color, 0.45) },
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
                borderColor: withAlpha(LEGEND_COLOR, activeTier === RANK_TIERS.length ? 0.9 : 0.28),
                backgroundColor: withAlpha(
                  LEGEND_COLOR,
                  activeTier === RANK_TIERS.length ? 0.24 : 0.05,
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
                      : withAlpha(LEGEND_COLOR, 0.45),
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
        <Text style={styles.cardHint}>
          {rank.isLegend
            ? `Легенда растёт бесконечно: до «${rank.next}» ещё ${rank.toNext} XP`
            : `До «${rank.next}» ещё ${rank.toNext} XP`}
        </Text>
        <Text style={styles.cardHint}>
          XP растёт за уроки, звёзды и практику под метрономом.
        </Text>
      </View>
    </ScrollView>
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
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        style={styles.input}
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
    gap: 8,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
  },
  segmentActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.14)',
  },
  segmentText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: colors.panel,
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontSize: 34,
    color: colors.cyan,
  },
  avatarHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  section: {
    fontFamily: fonts.brand,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  field: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 4,
  },
  input: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 6,
  },
  cardLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  cardValue: {
    fontFamily: fonts.bodyExtra,
    fontSize: 20,
    color: colors.ink,
  },
  cardHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankTitle: {
    fontFamily: fonts.brand,
    fontSize: 26,
    letterSpacing: 0.5,
  },
  rankXp: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.muted,
  },
  rankLadder: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tierChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tierChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  rankTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginVertical: 4,
  },
  rankFill: {
    height: '100%',
    borderRadius: 4,
  },
});
