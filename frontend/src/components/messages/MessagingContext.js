import {createContext,useContext} from 'react';
export const MessagingContext=createContext({socket:null,connected:false,epoch:0});
export const useMessaging=()=>useContext(MessagingContext);
