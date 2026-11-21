import {useUnreadQuery} from '../../redux/messagesApi';
export function UnreadBadge(){
  const {data}=useUnreadQuery(undefined,{pollingInterval:20000});
  return data?.unread>0?<span className="js-nav-count" aria-label={`${data.unread} unread messages`}>{data.unread>99?'99+':data.unread}</span>:null;
}
