const got = require('@/utils/got');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const site = ctx.params.site;

    // docs on: https://misskey-hub.net/docs/api/endpoints/notes/featured.html
    const url = `https://${site}/api/notes/featured`;
    const response = await got({
        method: 'post',
        url,
        json: {
            limit: 10,
            offset: 0,
        },
    });

    const list = response.data;

    ctx.state.data = {
        title: `Featured Notes on ${site}`,
        link: `https://${site}/explore`,
        item: utils.parseNotes(list, site),
    };
};
