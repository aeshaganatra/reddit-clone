import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { betterUpdateQuery } from './betterUpdateQuery';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

export const createUrqlClient = (ssrExchange: any) =>  ({ 
  url: 'http://localhost:4000/graphql',
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (_result, args, cache, info) => {
          betterUpdateQuery <LogoutMutation, MeQuery> (
            cache,
            {query: MeDocument},
            _result,
            () => ({me: null})
          );
        },
        login: (_result, args, cache, info) => {
          betterUpdateQuery <LoginMutation, MeQuery> (
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if(result.login.errors){
                return query;
              }else{
                return {
                  me: result.login.user, 
                }
              }
            }
          );
        },
        register: (_result, args, cache, info) => {
          betterUpdateQuery <RegisterMutation, MeQuery> (
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if(result.register.errors){
                return query;
              }else{
                return {
                  me: result.register.user, 
                }
              }
            }
          );
        } 
      }
    }
  }), 
  ssrExchange,
  fetchExchange],
  fetchOptions: {
    credentials: "include" as const
  }
});