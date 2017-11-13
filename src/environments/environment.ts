// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  regions: [
    {
      id: 'ng',
      label: 'US South',
      flag: 'us',
      env_id: 'ibm:yp:us-south',
    },
    {
      id: 'eu-gb',
      label: 'United Kingdom',
      flag: 'gb',
      env_id: 'ibm:yp:eu-gb',
    },
    {
      id: 'eu-de',
      label: 'Germany',
      flag: 'de',
      env_id: 'ibm:yp:eu-de',
    },
    {
      id: 'au-syd',
      label: 'Sydney',
      flag: 'au',
      env_id: 'ibm:yp:au-syd',
    }
  ]
};
