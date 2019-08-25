module.exports= function help()
{
    return [
            {
                route: 'update_and_retrieve_topic_to_pages_edges_using_google',
                description:`
                    1. Function recieves a search to be converted to topic.
                    2. If needed or requested, searches google for relevant pages links, and saves to database as page to topic edges.
                    3. Pulls saved topic to pages edges from database, and self user's ranking if logged in.
                    4. returns edges with populated pages
                    `,
                params: [
                    {
                        var_name: 'search',
                        var_type: 'string',
                        description: 'Representing topicName to search'
                    },
                    {
                        var_name: 'force_google_search',
                        var_type: 'boolean',
                        description: 'If not true then checks when last time searched to see if google search needed'
                    }
                ],
                premissions: [
                    {
                        status: 'not logged in',
                        actions: 'allowed, no self ranknigs will be loaded'
                    },
                    {
                        status: 'logged in',
                        actions: 'allowed, self ranknigs will be loaded'
                    }
                ]
            }
        ]
}