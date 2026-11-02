import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
			},
			colors: {
				border: 'hsl(var(--border))',
				'border-strong': 'hsl(var(--border-strong))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					active: 'hsl(var(--primary-active))',
					soft: 'hsl(var(--primary-soft))',
					'soft-strong': 'hsl(var(--primary-soft-strong))',
					'on-band': 'hsl(var(--primary-on-band))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				band: {
					DEFAULT: 'hsl(var(--band))',
					'2': 'hsl(var(--band-2))',
					foreground: 'hsl(var(--band-foreground))',
					muted: 'hsl(var(--band-muted))',
					card: 'hsl(var(--band-card))',
					border: 'hsl(var(--band-border))',
					hover: 'hsl(var(--band-hover))'
				},
				cta: {
					soft: 'hsl(var(--cta-soft))',
					border: 'hsl(var(--cta-soft-border))'
				},
				receipt: {
					DEFAULT: 'hsl(var(--receipt))',
					ink: 'hsl(var(--receipt-ink))',
					'muted-ink': 'hsl(var(--receipt-ink-muted))',
					rule: 'hsl(var(--receipt-rule))',
					accent: 'hsl(var(--receipt-accent))'
				}
			},
			borderRadius: {
				sm: '8px',
				md: '12px',
				lg: '18px',
				xl: '28px',
				'2xl': '40px',
				full: '9999px'
			},
			boxShadow: {
				card: 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				band: 'var(--shadow-band)',
				receipt: 'var(--shadow-receipt)',
				focus: 'var(--shadow-focus)',
				hairline: 'var(--inset-hairline)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
