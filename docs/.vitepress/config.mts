import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ngxsmk-gatekeeper',
  description: 'A framework-agnostic middleware engine for Angular that provides route and HTTP request protection through a composable middleware pattern.',
  
  // Base URL for deployment
  // For GitHub Pages: use '/ngxsmk-gatekeeper/' for project pages
  // Use '/' if you have a custom domain or user/org page
  // Can be overridden with VITEPRESS_BASE environment variable
  base: process.env.VITEPRESS_BASE || (process.env.NODE_ENV === 'production' ? '/ngxsmk-gatekeeper/' : '/'),
  
  // Language
  lang: 'en-US',
  
  // Logo and meta configuration
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#42b883' }],
    ['meta', { name: 'author', content: 'ngxsmk-gatekeeper' }],
    ['meta', { property: 'og:title', content: 'ngxsmk-gatekeeper' }],
    ['meta', { property: 'og:description', content: 'Middleware Engine for Angular - Route and HTTP request protection' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: '/logo.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'ngxsmk-gatekeeper' }],
    ['meta', { name: 'twitter:description', content: 'Middleware Engine for Angular' }],
  ],
  
  // Theme configuration
  themeConfig: {
    logo: '/logo.svg',
    
    // Site title in nav
    siteTitle: 'ngxsmk-gatekeeper',
    
    // Edit link
    editLink: {
      pattern: 'https://github.com/NGXSMK/ngxsmk-gatekeeper/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    
    // Last updated
    lastUpdated: {
      text: 'Last updated',
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NGXSMK/ngxsmk-gatekeeper' }
    ],
    
    // Navbar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/NGXSMK/ngxsmk-gatekeeper' }
    ],
    
    // Sidebar
    sidebar: {
      '/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        }
      ],
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Middleware Pattern', link: '/guide/middleware-pattern' },
            { text: 'Features Overview', link: '/guide/features-overview' },
            { text: 'Route Protection', link: '/guide/route-protection' },
            { text: 'HTTP Protection', link: '/guide/http-protection' },
            { text: 'Context & State', link: '/guide/context-state' }
          ]
        },
        {
          text: 'Security',
          items: [
            { text: 'Security Features', link: '/guide/security' },
            { text: 'Access Control', link: '/guide/access-control' }
          ]
        },
        {
          text: 'Request Processing',
          items: [
            { text: 'Request Processing', link: '/guide/request-processing' }
          ]
        },
        {
          text: 'Monitoring',
          items: [
            { text: 'Monitoring & Analytics', link: '/guide/monitoring' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Advanced Control', link: '/guide/advanced-control' },
            { text: 'Pipelines', link: '/guide/pipelines' },
            { text: 'Debug Mode', link: '/guide/debug-mode' },
            { text: 'Performance', link: '/guide/performance' },
            { text: 'SSR Support', link: '/guide/ssr-support' },
            { text: 'Plugins', link: '/guide/plugins' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Demos',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Minimal Auth', link: '/examples/minimal-auth' },
            { text: 'Role-Based Routing', link: '/examples/role-based-routing' },
            { text: 'HTTP Protection', link: '/examples/http-protection' }
          ]
        },
        {
          text: 'More Examples',
          items: [
            { text: 'Adapters', link: '/examples/adapters' },
            { text: 'Plugins', link: '/examples/plugins' },
            { text: 'Standalone Usage', link: '/examples/standalone' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Core', link: '/api/core' },
            { text: 'Middleware', link: '/api/middleware' },
            { text: 'Guards', link: '/api/guards' },
            { text: 'Interceptors', link: '/api/interceptors' }
          ]
        }
      ]
    },
    
    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 ngxsmk-gatekeeper'
    },
    
    // Search
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search documentation'
              },
              modal: {
                noResultsText: 'No results for',
                resetButtonTitle: 'Reset search',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close'
                }
              }
            }
          }
        }
      }
    },
    
    // Outline configuration
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    
    // Doc footer
    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    },
    
    // Return to top
    returnToTopLabel: 'Return to top',
    
    // Dark mode
    darkModeSwitchLabel: 'Appearance',
    sidebarMenuLabel: 'Menu',
    lastUpdatedText: 'Last updated'
  },
  
  // Markdown configuration
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown plugins here if needed
    }
  },
  
  // Build configuration
  buildEnd: async (siteConfig) => {
    // Custom build logic if needed
  },
  
  // Ignore dead links during build
  ignoreDeadLinks: true
});
