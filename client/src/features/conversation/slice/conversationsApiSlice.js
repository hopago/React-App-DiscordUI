import { apiSlice } from "../../authentication/api/apiSlice";

export const conversationsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => (
        {
            getConversations: builder.query({
                query: () => '/conversations',
                providesTags: (result, error, arg) => {
                    return [
                        { type: 'Conversation', id: 'LIST' },
                        ...result.map(({ _id }) => ({
                            type: 'Conversation', id: _id
                        }))
                    ]
                }
            }),
            getSingleConversation: builder.query({
                query: (conversationId) => `/conversations/${conversationId}`,
                providesTags: (result, error, arg) => [
                    { type: 'Conversation', id: arg }
                ]
            }),
            updateConversation: builder.mutation({
                query: (conversationId) => `/conversations/${conversationId}`,
                invalidatesTags: (result, error, arg) => [
                    { type: 'Conversation', id: arg }
                ]
            })
        }
    )
});

export const {
    useGetConversationsQuery,
    useGetSingleConversationQuery,
    useUpdateConversationMutation
} = conversationsApiSlice;