const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {

    const { url } = ctx.params;
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.params.routeParams);
    const $ = cheerio.load(response.data, { xmlMode: true });

    const rssTitle = routeParams.get('title') || ($('urlset url').length && $('urlset url').first().find('loc').text() ? $('urlset url').first().find('loc').text() : 'Sitemap');

    const urls = $('urlset url').toArray();
    const items =
        urls && urls.length
            ? urls
                  .map((item) => {
                      try {
                          const title = $(item).find('loc').text() || '';
                          const link = $(item).find('loc').text() || '';
                          const description = $(item).find('loc').text() || '';
                          const pubDate = $(item).find('lastmod').text() || undefined;

                          return {
                              title,
                              link,
                              description,
                              pubDate,
                          };
                      } catch {
                          return null;
                      }
                  })
                  .filter(Boolean)
            : [];

    ctx.state.data = {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
