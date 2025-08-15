/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      extend: {
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        fontFamily: {
          sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
          mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
        },
        keyframes: {
          'accordion-down': {
            from: { height: '0' },
            to: { height: 'var(--radix-accordion-content-height)' },
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: '0' },
          },
          'slide-up': {
            from: { transform: 'translateY(100%)', opacity: '0' },
            to: { transform: 'translateY(0)', opacity: '1' },
          },
          'slide-down': {
            from: { transform: 'translateY(-100%)', opacity: '0' },
            to: { transform: 'translateY(0)', opacity: '1' },
          },
          'fade-in': {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
          'fade-out': {
            from: { opacity: '1' },
            to: { opacity: '0' },
          },
          'pulse-ring': {
            '0%': {
              transform: 'scale(0.95)',
              boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
            },
            '70%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
            },
            '100%': {
              transform: 'scale(0.95)',
              boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
            },
          },
          blob: {
            '0%': {
              transform: 'translate(0px, 0px) scale(1)',
            },
            '33%': {
              transform: 'translate(30px, -50px) scale(1.1)',
            },
            '66%': {
              transform: 'translate(-20px, 20px) scale(0.9)',
            },
            '100%': {
              transform: 'translate(0px, 0px) scale(1)',
            },
          },
          wave: {
            '0%, 40%, 100%': {
              transform: 'scaleY(0.4)',
            },
            '20%': {
              transform: 'scaleY(1)',
            },
          },
          typing: {
            '0%, 80%, 100%': {
              transform: 'scale(1)',
              opacity: '0.6',
            },
            '40%': {
              transform: 'scale(1.3)',
              opacity: '1',
            },
          },
          shimmer: {
            '100%': {
              transform: 'translateX(100%)',
            },
          },
          float: {
            '0%, 100%': {
              transform: 'translateY(0)',
            },
            '50%': {
              transform: 'translateY(-10px)',
            },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
          'slide-up': 'slide-up 0.3s ease-out',
          'slide-down': 'slide-down 0.3s ease-out',
          'fade-in': 'fade-in 0.3s ease-out',
          'fade-out': 'fade-out 0.3s ease-out',
          'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          blob: 'blob 7s infinite',
          wave: 'wave 1.2s linear infinite',
          typing: 'typing 1.4s infinite ease-in-out',
          shimmer: 'shimmer 2s linear infinite',
          float: 'float 3s ease-in-out infinite',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          'grid-pattern': 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="gray" stroke-width="0.5" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)" /%3E%3C/svg%3E")',
        },
        transitionTimingFunction: {
          'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
        screens: {
          xs: '475px',
        },
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
          '9999': '9999',
          '99999': '99999',
        },
        boxShadow: {
          'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.15)',
          'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
          'glow-lg': '0 0 40px rgba(59, 130, 246, 0.5)',
        },
        backdropBlur: {
          xs: '2px',
        },
      },
    },
    plugins: [
      require('tailwindcss-animate'),
      // Add custom plugin for animation delays
      function({ matchUtilities, theme }) {
        matchUtilities(
          {
            'animation-delay': (value) => ({
              animationDelay: value,
            }),
          },
          { values: theme('transitionDelay') }
        );
      },
      // Add custom plugin for RTL support
      function({ addUtilities }) {
        const newUtilities = {
          '.rtl': {
            direction: 'rtl',
          },
          '.ltr': {
            direction: 'ltr',
          },
        };
        addUtilities(newUtilities);
      },
    ],
  };