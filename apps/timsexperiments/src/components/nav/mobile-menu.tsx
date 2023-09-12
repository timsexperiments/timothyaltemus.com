import { Popover } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronUpIcon,
  GithubIcon,
  LinkedinIcon,
  MenuIcon,
} from 'lucide-react';
import React from 'react';

function Link(props: React.ComponentProps<'a'>) {
  return <a {...props}></a>;
}

function MobileNavLink({
  className,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof Popover.Button<any>>,
  'as' | 'className'
>) {
  return (
    <Popover.Button
      as={Link}
      className={[
        'hover:text-grey-50 block text-base leading-7 tracking-tight text-grey-200',
        className,
      ].join(' ')}
      {...props}
    />
  );
}

export function MobileNavMenu() {
  return (
    <Popover className="lg:hidden">
      {({ open }) => (
        <>
          <Popover.Button
            className="ui-not-focus-visible:outline-none stroke-grey-50 active:stroke-grey-50 relative z-10 -m-2 inline-flex items-center rounded-lg p-2 hover:bg-gray-200/50 hover:stroke-grey-600"
            aria-label="Toggle site navigation">
            {({ open }) =>
              open ? (
                <ChevronUpIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )
            }
          </Popover.Button>
          <AnimatePresence initial={false}>
            {open && (
              <>
                <Popover.Overlay
                  static
                  as={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-0 bg-gray-300/60 backdrop-blur"
                />
                <Popover.Panel
                  static
                  as={motion.div}
                  initial={{ opacity: 0, y: -32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -32,
                    transition: { duration: 0.2 },
                  }}
                  className="absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-grey-900 px-6 pb-6 pt-32 shadow-2xl shadow-gray-900/20">
                  <div className="space-y-4">
                    <MobileNavLink href="/#features">Features</MobileNavLink>
                    <MobileNavLink href="/#reviews">Reviews</MobileNavLink>
                    <MobileNavLink href="/#pricing">Pricing</MobileNavLink>
                    <MobileNavLink
                      href="https://github.com/timsexperiments"
                      className="hover:stroke-grey-50 stroke-grey-200">
                      <GithubIcon />
                    </MobileNavLink>
                    <MobileNavLink
                      href="https://www.linkedin.com/in/timothyaltemus"
                      className="hover:stroke-grey-50 stroke-grey-200">
                      <LinkedinIcon />
                    </MobileNavLink>
                  </div>
                </Popover.Panel>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  );
}

export default MobileNavMenu;
