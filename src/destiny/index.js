import { Client } from 'destiny2';
console.log(process.env.BUNGIE_API_KEY);
const client = new Client(process.env.BUNGIE_API_KEY);

export const getCharacter = () => {
   client.getProfile('Largoh#2928', '4').then(data => {
       console.log(data);
   });
}
