import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import NextLink from "next/link"

const Index = () => {
  const [{data}] = usePostsQuery();
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>
          <Button mt={4} variantColor="teal"> create post </Button>
        </Link>
      </NextLink>
      <br />
      <Box mt={10}> Posts </Box>
      <br />
      {!data ? <div> Loading... </div>: data.posts.map((p) => <div key={p.id}> {p.title} </div>) }
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
