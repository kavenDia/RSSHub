const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const { allowHost } = require('./common');

module.exports = async (ctx) => {
    const { namespace, project, host } = ctx.params;

    const host_ = host ?? 'gitlab.com';
    const namespace_ = encodeURIComponent(namespace);

    const api_url = `https://${host_}/api/v4/projects/${namespace_}%2F${project}/repository/tags`;

    const response = await got({
        method: 'get',
        url: api_url,
    });
    const data = response.data;

    ctx.state.data = {
        title: `${project} - Tags - Gitlab`,
        link: `https://${host_}/${namespace}/${project}/-/tags`,
        description: `${namespace}/${project} Tags`,
        item: data.map((item) => ({
            title: item.name,
            author: item.commit.author_name,
            description: item.message,
            pubDate: parseDate(item.commit.created_at),
            link: item.commit.web_url,
        })),
    };
};
