import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/htmlOS-NEXT/docs/",
  title: "htmlOS NEXT Documentation",
  description: "The official documentation for htmlOS NEXT.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Installation", link: "/installation/installation-guide" },
    ],

    sidebar: [
      {
        text: "Installing htmlOS NEXT",
        items: [
          {
            text: "Installation Guide",
            link: "/installation/installation-guide",
          },
          {
            text: "Forwarding with NPM",
            link: "/installation/forwarding-with-nginx-proxy-manager",
          },
        ],
      },
      {
        text: "Management",
        items: [
          {
            text: "User Management",
            link: "/management/user-management",
          },
          {
            text: "Plugin Management",
            link: "/management/plugin-management",
          },
          {
            text: "Backend Directory",
            link: "/management/getting-inside-the-backend-directory",
          },
        ],
      },
      {
        text: "Developing Apps",
        items: [
          { text: "Getting Started", link: "/developing-apps/getting-started" },
          { text: "Best Practices", link: "/developing-apps/best-practices" },
          { text: "Distributing", link: "/developing-apps/distributing" },
          { text: "Manifest", link: "/developing-apps/manifest" },
          {
            text: "Tutorial",
            collapsed: true,
            items: [
              {
                text: "1. Getting Started",
                link: "/developing-apps/tutorial/1-getting-started",
              },
              {
                text: "2. Setting up your environment",
                link: "/developing-apps/tutorial/2-setting-up-your-environment",
              },
            ],
          },
        ],
      },
      {
        text: "Packages",
        items: [
          {
            text: "@htmlos-next/api",
            collapsed: true,
            items: [
              {
                text: "Getting Started",
                link: "/packages/api/getting-started",
              },
              {
                text: "API Reference",
                link: "/packages/api/api-reference",
              },
            ],
          },
          {
            text: "@htmlos-next/ui",
            collapsed: true,
            items: [
              {
                text: "Getting Started",
                link: "/packages/ui/getting-started",
              },
              {
                text: "Best Practices",
                link: "/packages/ui/best-practices",
              },
              {
                text: "Components",
                items: [
                  {
                    text: "AppShell",
                    link: "/packages/ui/components/appshell",
                  },
                  { text: "Balloon", link: "/packages/ui/components/balloon" },
                  { text: "Button", link: "/packages/ui/components/button" },
                  { text: "Card", link: "/packages/ui/components/card" },
                  { text: "Content", link: "/packages/ui/components/content" },
                  {
                    text: "ContextMenu",
                    link: "/packages/ui/components/contextmenu",
                  },
                  {
                    text: "EmptyView",
                    link: "/packages/ui/components/emptyview",
                  },
                  { text: "Icon", link: "/packages/ui/components/icon" },
                  {
                    text: "ListItem",
                    link: "/packages/ui/components/listitem",
                  },
                  { text: "Popup", link: "/packages/ui/components/popup" },
                  {
                    text: "PopupActions",
                    link: "/packages/ui/components/popupactions",
                  },
                  {
                    text: "PopupButton",
                    link: "/packages/ui/components/popupbutton",
                  },
                  {
                    text: "PopupDescription",
                    link: "/packages/ui/components/popupdescription",
                  },
                  {
                    text: "PopupInput",
                    link: "/packages/ui/components/appshell",
                  },
                  {
                    text: "PopupTitle",
                    link: "/packages/ui/components/popuptitle",
                  },
                  {
                    text: "SelectInput",
                    link: "/packages/ui/components/selectinput",
                  },
                  {
                    text: "SidebarButton",
                    link: "/packages/ui/components/sidebarbutton",
                  },
                  {
                    text: "SidebarItem",
                    link: "/packages/ui/components/sidebaritem",
                  },
                  {
                    text: "SidebarTitle",
                    link: "/packages/ui/components/sidebartitle",
                  },
                  { text: "Tab", link: "/packages/ui/components/tab" },
                  { text: "TabBar", link: "/packages/ui/components/tabbar" },
                  {
                    text: "TabContainer",
                    link: "/packages/ui/components/tabcontainer",
                  },
                  {
                    text: "TextInput",
                    link: "/packages/ui/components/textinput",
                  },
                  { text: "Toolbar", link: "/packages/ui/components/toolbar" },
                  {
                    text: "ToolbarActions",
                    link: "/packages/ui/components/toolbaractions",
                  },
                  {
                    text: "ToolbarButton",
                    link: "/packages/ui/components/toolbarbutton",
                  },
                  {
                    text: "ToolbarExpandSidebarButton",
                    link: "/packages/ui/components/toolbarexpandsidebarbutton",
                  },
                  {
                    text: "ToolbarTitle",
                    link: "/packages/ui/components/toolbartitle",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  ignoreDeadLinks: [/^https?:\/\/localhost/],
});
