const PUBLIC_PATH = '|' // '|'
// https://fonts.googleapis.com/
//  -> https://fonts.googleapis.cnpmjs.org/
//  -> https://fonts.dogedoge.com/
const CSS_CDN_ORIGIN = 'https://fonts.googleapis.cnpmjs.org/'

module.exports = {
  publicPath: PUBLIC_PATH,
  template: {
    index: {
      title: 'Hello, Mobius Project!',
      whisper: 'The author is looking for a job as a product manager \\n             For a quickest preview of his info, check https://example.com/',
      fonts: [
        `${PUBLIC_PATH}statics/fonts/Workbench[wdth,wght].woff2`,
        `${PUBLIC_PATH}statics/fonts/Sixtyfour[wdth,wght].woff2`
      ],
      asyncCss: [
        `${CSS_CDN_ORIGIN}css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
        `${CSS_CDN_ORIGIN}css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
        `${CSS_CDN_ORIGIN}css2?family=Noto+Sans+SC:wght@100;300;400;500;700;900&display=swap`,
        `${CSS_CDN_ORIGIN}css2?family=Noto+Serif+SC:wght@200;300;400;500;600;700;900&display=swap`
      ],
      css: [
        'https://cdn.jsdelivr.net/npm/@we-mobius/mobius-ui@latest'
      ],
      scripts: [],
      favicon: `${PUBLIC_PATH}statics/favicons/thoughts-daily.icon.png`,
      headHtmlSnippet: `
        <style>
          body { developer: cigaret; wechat: cigaret_bot; email: kcigaret@outlook.com; }
        </style>
      `,
      bodyHtmlSnippet: `
        <div id="mobius-app">
          <div class="mobius-width--100vw mobius-height--100vh mobius-layout__vertical">
            <div class="mobius-padding--xl mobius-margin--auto mobius-shadow--normal mobius-rounded--base">
              <div class="mobius-layout__vertical mobius-flex-items--center mobius-select--none">
                <p class="mobius-text--center mobius-text--xl mobius-font--fantasy">
                  <div class="svg-loading" style="width: 45px; height: 45px;"></div>
                </p>
                <p>
                  Mobius Template Project!
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      // from: https://analytics.google.com/analytics/web/
      googleAnalytics: {
        trackingId: false // UA-XXXX-XX
      },
      // from: https://tongji.baidu.com/sc-web/
      baiduAnalytics: {
        trackingId: false // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      }
    }
  }
}
