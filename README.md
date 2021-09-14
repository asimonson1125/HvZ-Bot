# RIT Humans vz Zombies Bot
Discord bot to handle [Rochester Institute of Technology's Humans vs Zombies](https://hvz.rit.edu) games


## Uses
<details>
  <summary>Link discord accounts to players in the game and view their status</summary>

<sub>example players not affiliated with project or devs</sub>
  
  <img src="/images/identityTheft.png" width="300">
<br />  
  <img src="/images/status.png" width="300">
</details>

<details>
  <summary>Integrate with server-specific roles</summary>

<img src="/images/setRoles.png" width="600">
  
</details>

<details>
  <summary>Update user roles based on in-game data</summary>

<img src="/images/updateRole.gif" width="450">
</details>

<details>
  <summary>create scoreboards that automatically update every 15 minutes (Also updates user roles on this interval!)</summary>

<img src="/images/score.png" width="400">
<br />
<img src="/images/score2.png" width="400">
<br />
<img scr="/images/score3.png" width="400">
  </details>
  
## Install
Clone repository:  
```git clone https://github.com/asimonson1125/HvZ-Bot```

Install dependencies:  
```npm install```

Create `auth.js` with template:
```js
export const token = "BOT_TOKEN";
export const SQLUser = "USER";
export const SQLPass = "PASSWORD";
```

All done!  
Run: `node index.js`
