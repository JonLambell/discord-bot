import { Client } from 'destiny2';

const client = new Client(process.env.BUNGIE_API_KEY);

export const getCharacter = (name) => {
   client.getProfile(name, '4').then(data => {
       console.log(data);
   }).catch(error => {
       console.log('There was an error', error);
   });
}
