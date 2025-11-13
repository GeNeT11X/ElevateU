const { LinkedinScraper, events } = require('linkedin-jobs-scraper');

(async () => {
    const scraper = new LinkedinScraper({
        headless: true,
        slowMo: 500,
        cookies: [
            {
                name: 'li_at',
                value: 'YOUR_LI_AT_COOKIE_HERE',
                domain: '.linkedin.com',
            },
        ],
    });

    scraper.on(events.data, (data) => {
        console.log(
            `\nTitle: ${data.title}\nCompany: ${data.company}\nLocation: ${data.location}\nDescription: ${data.descriptionSnippet}\nLink: ${data.link}`
        );
    });

    await scraper.run([
        {
            query: 'Software Engineer',
            options: {
                filters: {
                    location: 'India',
                },
                limit: 3,
            },
        },
    ]);

    await scraper.close();
})();
