export const environment = {
  production: true,
  apiUrl: '/api',
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
