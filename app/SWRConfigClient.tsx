'use client';
import { ComponentProps } from 'react';
import { SWRConfig } from 'swr';

// HACK: 直接 import 'swr' すると 'use client' をつけるよう怒られるから SWRConfigClient を介している
export const SWRConfigClient = (props: ComponentProps<typeof SWRConfig>) => (
  <SWRConfig {...props} />
);
