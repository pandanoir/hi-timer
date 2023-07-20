'use client';
import { ComponentProps } from 'react';
import { Key, SWRConfig, unstable_serialize } from 'swr';

// HACK: 直接 import 'swr' すると 'use client' をつけるよう怒られるから SWRConfigClient を介している
export const SWRConfigClient = ({
  keyValues,
  value,
  ...props
}: ComponentProps<typeof SWRConfig> & { keyValues?: [Key, unknown][] }) => (
  <SWRConfig
    {...props}
    value={{
      fallback: {
        ...(value && 'fallback' in value ? value.fallback : null),
        ...Object.fromEntries(
          keyValues?.flatMap(([k, v]) => [
            [unstable_serialize(k), v],
            [`$inf$${unstable_serialize(k)}`, [v]],
          ]) ?? []
        ),
      },
    }}
  />
);
