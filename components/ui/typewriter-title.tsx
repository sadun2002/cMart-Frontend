'use client';

import Typewriter from 'typewriter-effect';

export function TypewriterTitle() {
  return (
    <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6 transition-colors min-h-[140px] sm:min-h-[120px] md:min-h-[80px]">
      The Smart Way to <br className="md:hidden" />
      <span className="text-blue-600">
        <Typewriter
          options={{
            strings: ['Run Your Store', 'Manage Inventory', 'Track Sales'],
            autoStart: true,
            loop: true,
            delay: 75,
            deleteSpeed: 50,
          }}
        />
      </span>
    </h1>
  );
}
