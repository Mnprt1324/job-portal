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

const sessionAwareQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (isAuthenticationFailure(result.error?.status)) redirectForExpiredSession();
  return result;
};

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: sessionAwareQuery,
  tagTypes: ['Notifications', 'NotificationUnread'],
  endpoints: (builder) => ({
    notifications: builder.query({ query: (params) => ({ url: '/notifications', params }), providesTags: ['Notifications'] }),
    notificationUnread: builder.query({ query: () => '/notifications/unread', providesTags: ['NotificationUnread'] }),
    markNotificationRead: builder.mutation({ query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }), invalidatesTags: ['Notifications', 'NotificationUnread'] }),
    markAllNotificationsRead: builder.mutation({ query: () => ({ url: '/notifications/read-all', method: 'PATCH' }), invalidatesTags: ['Notifications', 'NotificationUnread'] }),
  }),
});

export const { useNotificationsQuery, useNotificationUnreadQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } = notificationsApi;
