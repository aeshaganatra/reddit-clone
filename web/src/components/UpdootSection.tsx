import { Box, Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import { Post, PostsQuery, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps{
    posts: PostsQuery["posts"]["posts"][0];
}


export const UpdootSection: React.FC <UpdootSectionProps> = ({ posts }) => {
    
    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const [, vote] = useVoteMutation();

    return (
        <Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
            <IconButton 
            onClick={async () => {
                setLoadingState('updoot-loading');
                await vote({
                   postId: posts.id,
                   value: 1
                });
                setLoadingState('not-loading');
            }}
            isLoading={loadingState=="updoot-loading"}
            aria-label="Up Vote" icon="chevron-up" size="sm" />
            <Box marginTop={2} marginBottom={1}> {posts.points} </Box>
            <IconButton 
            onClick={async () => {
                setLoadingState('downdoot-loading');
                vote({
                   postId: posts.id,
                   value: -1
                }) 
                setLoadingState('not-loading');
            }}
            isLoading={loadingState=="downdoot-loading"}
            aria-label="Down Vote" icon="chevron-down" size="sm" />
        </Flex>
    )
}