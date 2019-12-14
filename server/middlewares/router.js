// Module imports
const router = require('koa-router')()
const send = require('koa-send')





// Component constants
const DAY_CHAR_LENGTH = 2
const MONTH_CHAR_LENGTH = 2
const YEAR_CHAR_LENGTH = 4





const permanentRedirect = (path) => async (ctx) => {
  ctx.status = 301
  await ctx.redirect(path)
}

const sendFile = (path) => async (ctx) => {
  await send(ctx, path)
}





module.exports = (nextApp, koaServer) => {
  /***************************************************************************\
    File Mappings
  \***************************************************************************/

  // Root dir static file mappings
  router.get('/browserconfig.xml', sendFile('/client/public/static/browserconfig.xml'))
  router.get('/sitemap.xml', sendFile('/client/public/static/sitemap.xml'))
  router.get('/manifest.json', sendFile('/client/public/static/manifest.json'))
  router.get('/favicon.ico', sendFile('/client/public/static/favicon/favicon.ico'))





  /***************************************************************************\
    Redirects
  \***************************************************************************/

  // Permanent Redirects

  router.get('/blogs', permanentRedirect('/blog')) // Old blog used to exist at /blogs
  router.get('/fuel-rats-lexicon', permanentRedirect('https://confluence.fuelrats.com/pages/viewpage.action?pageId=3637257')) // Lexicon used to be local
  router.get('/get-help', permanentRedirect('/i-need-fuel')) // get-help was used at launch of the website, but has since been changed back.
  router.get('/help', permanentRedirect('https://t.fuelr.at/help')) // People often type this one manually into their URL bar to get to the helpdesk
  router.get('/privacy', permanentRedirect('/privacy-policy')) // Common endpoint for privacy policies
  router.get('/statistics', permanentRedirect('https://grafana.fuelrats.com')) // statistics page is no longer on the website
  router.get('/profile', permanentRedirect('/profile/overview')) // Profile page requires a tab name in the path




  // Legacy Wordpress permalinks
  // e.g. /2017/09/07/universal-service-a-fuel-rats-thargoid-cartoon
  router.get('/:year/:month/:day/:slug', async (ctx, next) => {
    const {
      day,
      month,
      slug,
      year,
    } = ctx.params

    const dayIsValid = parseInt(day, 10) && (day.length === DAY_CHAR_LENGTH)
    const monthIsValid = parseInt(month, 10) && (month.length === MONTH_CHAR_LENGTH)
    const yearIsValid = parseInt(year, 10) && (year.length === YEAR_CHAR_LENGTH)

    if (dayIsValid && monthIsValid && yearIsValid) {
      ctx.status = 301
      await ctx.redirect(`/blog/${slug}`)
    }

    await next()
  })





  /***************************************************************************\
    Next-Routes passthrough
  \***************************************************************************/

  const nextRequestHandler = nextApp.getRequestHandler()
  router.get('*', async (ctx) => {
    ctx.respond = false
    await nextRequestHandler(ctx.req, ctx.res)
  })





  /***************************************************************************\
    Configure server and attach router.
  \***************************************************************************/

  koaServer.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })
  koaServer.use(router.routes())
  koaServer.use(router.allowedMethods())
}
/* eslint-enable */
