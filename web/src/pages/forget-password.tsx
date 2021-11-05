import { Box, Button } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/inputField";
import { Wrapper } from "../components/Wrapper";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgetPasswordMutation } from "../generated/graphql";

export const ForgetPassword: React.FC <{}> = ({}) => {
    
    const [complete, setComplete] = useState(false);
    const [, ForgetPassword] = useForgetPasswordMutation();

    return (
       <Wrapper variant = "small">
       <Formik
            initialValues={{
                email: ""
            }}
            onSubmit={async (value) => {
                await ForgetPassword(value);
                setComplete(true);
            }}
       >
           {( {isSubmitting} ) => complete ? 
           <Box> if account with that email exist we send it to you?</Box>
           :(
                    <Form>
                        <InputField 
                        name="email"
                        placeholder="email"
                        label="email"
                        type="email"
                        />
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal"> Forget Password </Button>
                    </Form>
           )}
       </Formik> 
       </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgetPassword);