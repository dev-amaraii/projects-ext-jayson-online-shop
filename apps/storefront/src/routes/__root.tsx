import { createRootRoute, HeadContent, Scripts, Outlet } from '@tanstack/react-router'
import '../styles.css'

function RootDocument() {
 return (
  <html lang="en" suppressHydrationWarning>
   <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <HeadContent />
    <script dangerouslySetInnerHTML={{ __html: "(function(){try{var p=localStorage.getItem('jayson-theme')||'system';var dark=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light'}catch(e){}})();" }} />
   </head>
   <body>
    <Outlet />
    <Scripts />
   </body>
  </html>
 )
}

export const Route = createRootRoute({
 head: () => ({
  meta: [
   { title: 'Jayson Tech — Gadget Store Demo' },
   { name: 'description', content: 'Jayson Tech online shop concept demo' },
  ],
 }),
 component: RootDocument,
})
