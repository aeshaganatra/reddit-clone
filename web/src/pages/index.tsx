import { NavBar } from "../components/NavBar"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{data}] = usePostsQuery();
  return (
    <>
    {/* I don't understand why this blank thing is here */}
    {/* may be because of scope insert!! */}
    <NavBar/>
    <div> Posts </div>
    <br />
    {!data ? <div> Loading... </div>: data.posts.map((p) => <div key={p.id}> {p.title} </div>) }
    </>
  );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
