const path=require('node:path');
const {Writable}=require('node:stream');
const readline=require('node:readline/promises');
require('dotenv').config({path:path.join(__dirname,'../.env')});
const mongoose=require('mongoose');
const User=require('../models/user.model');
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk,encoding);callback();}});
const rl=readline.createInterface({input:process.stdin,output,terminal:!!process.stdin.isTTY});
(async()=>{
  const name=(await rl.question('Admin name: ')).trim();
  const email=(await rl.question('Admin email: ')).trim().toLowerCase();
  process.stdout.write('Password (hidden): ');muted=true;const password=await rl.question('');muted=false;process.stdout.write('\n');
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8||password.length>128||!/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/\d/.test(password)||!/[^a-zA-Z0-9]/.test(password))throw Error('Use a name, valid email, and an 8-128 character password with uppercase, lowercase, a number and a symbol.');
  await mongoose.connect(process.env.MONGO_URI);
  if(await User.findOne({email}))throw Error('This email is already registered. Existing accounts are not converted.');
  await User.create({name,email,password:await User.hashPassword(password),role:'admin'});
  console.log('Admin created. Sign in through /login.');
})().catch(error=>{muted=false;console.error(error.message);process.exitCode=1;}).finally(async()=>{rl.close();await mongoose.disconnect();});
