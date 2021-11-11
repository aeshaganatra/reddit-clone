import { Box, Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import { PostsQuery, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps{
    posts: PostsQuery["posts"]["posts"][0];
}


export const UpdootSection: React.FC <UpdootSectionProps> = ({ posts }) => {
    
    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const [loadUpVoteColorState, setUpVoteColorState] = useState<'gray' | 'green'>('gray');
    const [loadDownVoteColorState, setDownVoteColorState] = useState<'gray' | 'red'>('gray');
    const [, vote] = useVoteMutation();

    return (
        <Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
            <IconButton 
            onClick={async () => {
                setLoadingState('updoot-loading');
                const {data} = await vote({
                   postId: posts.id,
                   value: 1
                });
                if(data){
                    posts.points += data?.vote;
                    setUpVoteColorState('green');
                    setDownVoteColorState('gray');
                }
                setLoadingState('not-loading');
            }}
            variantColor={loadUpVoteColorState}
            isLoading={loadingState=="updoot-loading"}
            aria-label="Up Vote" icon="chevron-up" size="sm" />
            <Box marginTop={2} marginBottom={1}> {posts.points} </Box>
            <IconButton 
            onClick={async () => {
                setLoadingState('downdoot-loading');
                const {data} = await vote({
                   postId: posts.id,
                   value: -1
                }) 
                if(data){
                    posts.points += data?.vote;
                    setUpVoteColorState('gray');
                    setDownVoteColorState('red');
                }
                setLoadingState('not-loading');
            }}
            variantColor={loadDownVoteColorState}
            isLoading={loadingState=="downdoot-loading"}
            aria-label="Down Vote" icon="chevron-down" size="sm" />
        </Flex>
    )
}