import type { ComponentType } from 'react';
import { LayoutSplit } from './LayoutSplit';
import { LayoutSplitArc } from './LayoutSplitArc';
import { LayoutClassic } from './LayoutClassic';
import { LayoutHero } from './LayoutHero';
import { LayoutSunArc } from './LayoutSunArc';
import { LayoutFocus } from './LayoutFocus';
import { LayoutCompact } from './LayoutCompact';
import type { LayoutProps } from './types';
import type { LayoutKey } from '@/components/layout/LayoutSwitcher';

const LAYOUT_MAP: Record<LayoutKey, ComponentType<LayoutProps>> = {
  split: LayoutSplit,
  splitarc: LayoutSplitArc,
  classic: LayoutClassic,
  hero: LayoutHero,
  sunarc: LayoutSunArc,
  focus: LayoutFocus,
};

export function LayoutRouter(props: LayoutProps) {
  if (props.settings.compact_mode === 'true') {
    return <LayoutCompact {...props} />;
  }
  const key = (props.settings.layout as LayoutKey) ?? 'split';
  const Comp = LAYOUT_MAP[key] ?? LayoutSplit;
  return <Comp {...props} />;
}
