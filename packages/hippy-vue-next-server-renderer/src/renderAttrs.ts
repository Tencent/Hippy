import type { NeedToTyped } from '@tencent/hippy-vue-next-shared';
import { ssrRenderSlotInner } from '@vue/server-renderer';
import { isString, normalizeStyle } from '@vue/shared';

export type SSRBuffer = SSRBufferItem[] & { hasAsync?: boolean };
export type SSRBufferItem = string | SSRBuffer | Promise<SSRBuffer>;
export type PushFn = (item: SSRBufferItem) => void;
export type Props = Record<string, unknown>;
export type SSRSlots = Record<string, SSRSlot>;
export type SSRSlot = (
  props: Props,
  push: PushFn,
  parentComponent: NeedToTyped,
  scopeId: string | null,
) => void;

export function ssrRenderStyle(raw: unknown): string {
  if (!raw) {
    return '{}';
  }
  if (isString(raw)) {
    return '{}';
  }

  return JSON.stringify(normalizeStyle(raw) ?? {});
}

export function ssrGetDirectiveProps(): unknown {
  return {};
}

export function ssrRenderSlot(
  slots: SSRSlots,
  slotName: string,
  slotProps: Props,
  fallbackRenderFn: (() => void) | null,
  push: PushFn,
  parentComponent: NeedToTyped,
  slotScopeId?: string,
): void {
  // template-compiled slots are always rendered as fragments
  push('{"id": -1,"name":"comment","props":{"text":"["}},');
  ssrRenderSlotInner(
    slots,
    slotName,
    slotProps,
    fallbackRenderFn,
    push,
    parentComponent,
    slotScopeId,
  );
  push('{"id": -1,"name":"comment","props":{"text":"]"}},');
}
