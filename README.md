# Give another look at your resources

My Console uses the Cloud Foundry API to show a snapshot of your organizations, spaces, applications and services.

**My Console does not store any of your Cloud Foundry information. All data is stored locally in your web browser [local storage](https://en.wikipedia.org/wiki/Web_storage).**

## Usage

  * Go to [My Console](https://myconsole.mybluemix.net):

  ![](xdocs/01-home.png)

  * Go to [the settings](https://myconsole.mybluemix.net/#/settings):

  ![](xdocs/02-settings.png)

  * Open a terminal and retrieve an authentication token from Cloud Foundry:

  ```
  cf oauth-token
  ```

  ![](xdocs/03-cf-oauth-token.png)

  * Copy and paste the result in the settings:

  ![](xdocs/04-set-token.png)

  > Make sure to copy the full output including the *bearer* keyword.

  * Switch to [the dashboard](https://myconsole.mybluemix.net/#/dashboard):

  ![](xdocs/05-back-to-dashboard.png)

  * **Refresh All** data:

  ![](xdocs/06-refresh-all.png)

  * After a while global numbers are shown:

  ![](xdocs/07-dashboard.png)

  * Use the [Navigator](https://myconsole.mybluemix.net/#/navigate) view to quickly navigate organizations, spaces, apps and services:

  ![](xdocs/08-navigate.png)

  * or the [Browser](https://myconsole.mybluemix.net/#/browse) view. Here showing all Object Storage services:

  ![](xdocs/09-browse.png)

  * or the [List]() view. Here showing all apps marked as stopped or down:

  ![](xdocs/10-find-down-apps.png)

  * or use the Search bar to find an app by its routes:

  ![](xdocs/11-find-app-by-url.png)

  * or limit to a given space to find how much your solution (many regions, apps and services) consume:

  ![](xdocs/12-solution-usage.png)

  * Check [the help](https://myconsole.mybluemix.net/#/help) for more additional details and tips on using the search bar.

## License

My Console is licensed under the Apache License Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0).
