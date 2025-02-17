const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

const defaultDomain = 'jmcomic1.me';
// list of address: https://jmcomic2.bet
const allowDomain = new Set(['18comic.vip', '18comic.org', 'jmcomic.me', 'jmcomic1.me', 'jm-comic3.art', 'jm-comic.club', 'jm-comic2.ark']);

const getRootUrl = (domain, ctx) => {


    return `https://${domain}`;
};

module.exports = {
    defaultDomain,
    getRootUrl,
    ProcessItems: async (ctx, currentUrl, rootUrl) => {
        currentUrl = currentUrl.replace(/\?$/, '');

        const response = await got(currentUrl);

        const $ = cheerio.load(response.data);

        let items = $('.video-title')
            .slice(0, ctx.query.limit ? Number.parseInt(ctx.query.limit) : 20)
            .toArray()
            .map((item) => {
                item = $(item);

                return {
                    title: item.text().trim(),
                    link: `${rootUrl}${item.prev().find('a').attr('href')}`,
                    guid: `18comic:${item.prev().find('a').attr('href')}`,
                };
            });

        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.guid, async () => {
                    const detailResponse = await got(item.link);

                    const content = cheerio.load(detailResponse.data);

                    item.pubDate = parseDate(content('div[itemprop="datePublished"]').first().attr('content'));
                    item.category = content('span[data-type="tags"]')
                        .first()
                        .find('a')
                        .toArray()
                        .map((c) => $(c).text());
                    item.author = content('span[data-type="author"]')
                        .first()
                        .find('a')
                        .toArray()
                        .map((a) => $(a).text())
                        .join(', ');
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        introduction: content('#intro-block .p-t-5').text(),
                        images: content('.img_zoom_img img')
                            .toArray()
                            .map((image) => content(image).attr('data-original')),
                    });

                    return item;
                })
            )
        );

        return {
            title: $('title').text(),
            link: currentUrl,
            item: items,
            description: $('meta[property="og:description"]').attr('content'),
            allowEmpty: true,
        };
    },
};
