// https://github.com/vercel/next.js/discussions/41934#discussioncomment-7195052
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useEffect, ComponentProps } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export const NextLink: FC<ComponentProps<typeof Link>> = ({
  href,
  ...props
}) => {
  const pathname = usePathname();
  useEffect(() => {
    return () => {
      NProgress.done();
    };
  }, [pathname]);

  return (
    <Link href={href} legacyBehavior>
      <a
        onClick={(e) => {
          const shouldStartAnimation =
            // middle or right mouse button click
            e.button === 1 || e.button === 2 ? false
              // Check if it's a left mouse click without any keyboard modifiers
            : e.button === 0 && !e.ctrlKey && !e.shiftKey && !e.metaKey ?
              href !== window.location.pathname // Don't start the animation for same route links
              // Check if it's an accessibility event (e.g., screen reader activation)
            : e.type === 'click' && e.detail === 0;

          if (!shouldStartAnimation) {
            return;
          }
          NProgress.start();
        }}
        onKeyDown={(e) => {
          // Check if it's an accessibility event (e.g., screen reader activation)
          if (e.type !== 'click' || e.detail !== 0) {
            return;
          }
          NProgress.start();
        }}
        tabIndex={0} // Ensure the link is keyboard focusable
        {...props}
      />
    </Link>
  );
};
