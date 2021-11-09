import { Box, Button, Flex, Link } from "@chakra-ui/core"
import NextLink from "next/link"
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarPros {

}

export const NavBar: React.FC <NavBarPros> = ({}) => {

    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    });
    let body = null;

    // data is loading 
    if(fetching){
        // nothing
    }else if(!data?.me){
        body =  (
            <>
            <NextLink href="/login">
                <Link mr={2}> Login </Link>
            </NextLink>
            <NextLink href="/register">
                <Link> Register </Link>
            </NextLink>
            </>
        );
    }else{
        body = (
            <Flex>
                <Box mr={2}>
                    {data.me.username}
                </Box>
                <Button onClick={() => {
                    logout();
                }} 
                isLoading = {logoutFetching}
                variant="link"> logout </Button>
            </Flex>
        );
    }

    return (
        <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
            <Box ml={"auto"}>
                {body}
            </Box>
        </Flex>
    );

}