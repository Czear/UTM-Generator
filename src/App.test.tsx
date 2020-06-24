import UTMGenerator from 'Container/UTM-Generator'

interface URLConfig {
    url: string
    valid: boolean
}

const parseBoolIntoInt = (bool: boolean) => bool ? 1 : 0

test('URL regex in UTMGenerator', () => {
    const utmGeneratorHelperClass = class UTMGeneratorTestHelper extends UTMGenerator {
        protected urlsToCheck: URLConfig[] = [
            {
                url: 'https://www.google.com',
                valid: true,
            },
            {
                url: 'http://www.google.com',
                valid: true,
            },
            {
                url: '//www.google.com',
                valid: false,
            },
            {
                url: 'www.google.com',
                valid: true,
            },
            {
                url: 'https://www.google.com/?test1?test2',
                valid: true,
            },
            {
                url: 'www.google.com/',
                valid: true,
            },
            {
                url: 'www.goog?le.com/',
                valid: false,
            },
            {
                url: 'garbageurl',
                valid: false,
            },            {
                url: 'www.google.com///////////////////asdasdasdasd',
                valid: true,
            },
        ]


        public testUrlRegex = (): boolean | string[] => {
            const failedUrls: string[] = []

            for (const urlConfig of this.urlsToCheck) {

                if (parseBoolIntoInt(this.urlRegex.test(urlConfig.url)) ^ parseBoolIntoInt(urlConfig.valid)) {
                    failedUrls.push(urlConfig.url)
                }

            }

            return failedUrls.length ? failedUrls : true
        }
    }


    expect(( new utmGeneratorHelperClass({}) ).testUrlRegex()).toBe(true)
})
