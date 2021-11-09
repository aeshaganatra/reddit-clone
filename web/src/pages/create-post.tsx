import { Box, Button, Textarea, Text } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { __InputValue } from "graphql";
import React, {useEffect, useState} from "react"
import { InputField } from "../components/inputField";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC <{}> = ({}) => {

    useIsAuth();
    const router = useRouter();
    const [text, setValue] = useState("");
    const handleInputChange = (event: any) => setValue(event.target.value);
    const [, createPost] = useCreatePostMutation();

    return (
        <Layout variant="small">
        <Formik
            initialValues={{
                title: "",
                text: ""
            }}
            onSubmit={async (values, {setErrors}) => {
                values.text = text;
                const {error} = await createPost({input: values});
                if(!error){
                    router.push("/"); 
                }

            }}
       >
           {( {isSubmitting} ) => (
                    <Form>
                        <InputField 
                        name="title"
                        placeholder="title"
                        label="title"
                        />
                        <Box mt={4}>
                            <Text mb="8px">text</Text>
                            <Textarea
                                value={text}
                                onChange={handleInputChange}
                                placeholder="Here is a sample placeholder"
                                size="sm"
                            />
                        </Box>
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal"> Create Post </Button>
                    </Form>
           )}
       </Formik> 
       </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);