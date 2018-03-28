import { Fragment } from 'react'
import Head from 'next/head'

const Page = ({ title, description, children }) => (
  <Fragment>
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta name="theme-color" content="white" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@jaydenseric" />
      <meta name="twitter:creator" content="@jaydenseric" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta
        property="og:image"
        content={`${process.env.DOMAIN}/static/thumbnail.png`}
      />
      <link rel="icon" sizes="192x192" href="/static/icon.png" />
      <link rel="apple-touch-icon" href="/static/apple-touch-icon.png" />
      <link rel="manifest" href="/static/manifest.webmanifest" />
    </Head>
    <style jsx global>{`
      html {
        text-size-adjust: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica,
          Arial, sans-serif;
      }
      body {
        box-sizing: border-box;
        margin: 0;
        padding: 2em 1.5em 4em;
        min-width: 320px;
        max-width: 36em;
        font-size: 120%;
      }
    `}</style>
    {children}
  </Fragment>
)

export default Page
