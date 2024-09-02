const got = require('@/utils/got');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const site = ctx.params.site;
    const only_media = ctx.params.only_media ? 'true' : 'false';

    const url = `http://${site}/api/v1/timelines/public?remote=true&only_media=${only_media}`;

    const response = await got.get(url);
    const list = response.data;

    ctx.state.data = {
        title: `Federated Public${ctx.params.only_media ? ' Media' : ''} Timeline on ${site}`,
        link: `https://${site}`,
        item: utils.parseStatuses(list),
    };
};
