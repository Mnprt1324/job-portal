import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { isAuthenticationFailure, redirectForExpiredSession } from '../utils/sessionExpiry';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', token);
    return headers;
  },
});

const baseQueryWithSessionExpiry = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (isAuthenticationFailure(result.error?.status)) redirectForExpiredSession();
  return result;
};

export const messagesApi=createApi({
  reducerPath:'messagesApi',
  baseQuery:baseQueryWithSessionExpiry,
  tagTypes:['Inbox','Unread'],keepUnusedDataFor:30,
  endpoints:builder=>({
    conversations:builder.query({query:params=>({url:'/conversations',params}),providesTags:['Inbox']}),
    unread:builder.query({query:()=>'/conversations/unread',providesTags:['Unread']}),
    history:builder.query({query:({id,...params})=>({url:`/conversations/${id}/messages`,params}),keepUnusedDataFor:0}),
    createConversation:builder.mutation({query:applicationId=>({url:'/conversations',method:'POST',body:{applicationId}}),invalidatesTags:['Inbox']}),
    sendMessage:builder.mutation({query:({id,...body})=>({url:`/conversations/${id}/messages`,method:'POST',body}),invalidatesTags:['Inbox','Unread']}),
    readConversation:builder.mutation({query:({id,throughSequence})=>({url:`/conversations/${id}/read`,method:'PATCH',body:{throughSequence}}),invalidatesTags:['Inbox','Unread']}),
  }),
});
export const {useConversationsQuery,useUnreadQuery,useLazyConversationsQuery,useLazyHistoryQuery,useCreateConversationMutation,useSendMessageMutation,useReadConversationMutation}=messagesApi;
