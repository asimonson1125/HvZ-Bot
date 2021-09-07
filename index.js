import fetch from 'node-fetch';

/* ------------------------------------------------------------
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
RENEW YOUR DAMN CERTIFICATE!!!!!!!!!!!!!!!!
   ------------------------------------------------------------ */
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* ------------------------------------------------------------
DO IT NOOOWWW!!!!!!!!!!!!!!!!!!!!
   ------------------------------------------------------------ */

fetch("https://hvz.rit.edu/api/v2/status/dates", {"method": "GET"}).then(response => response.json()).then(json => console.log(json.start));