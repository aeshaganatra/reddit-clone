import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../../components/inputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from "next/link"

const ChangePassword: React.FC <{}> = ({}) => {

    const router = useRouter();
    const [, ChangePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');

    return (
       <Wrapper variant = "small">
       <Formik
            initialValues={{
                newPassword: ""
            }}
            onSubmit={async (value, {setErrors}) => {
                const response = await ChangePassword({
                    newPassword: value.newPassword,
                    token:  typeof router.query.token === "string" ? router.query.token : "",
                });
                if(response.data?.changePassword.errors){
                    const errorMap = toErrorMap(response.data.changePassword.errors);
                    if("token" in errorMap){
                        setTokenError(errorMap.token);
                    }else{
                        setErrors(errorMap);
                    }
                }else if(response.data?.changePassword.user){
                    router.push('/');
                }
            }}
       >
           {( {isSubmitting} ) => (
                    <Form>
                        <InputField 
                        name="newPassword"
                        placeholder="newPassword"
                        label="newPassword"
                        type="password"
                        /> 
                        {tokenError ? 
                            <Flex>
                                <NextLink href="/forget-password">
                                <Link>forget it again?</Link>
                                </NextLink>
                            <Box ml={2} style={{color: "red"}}> {tokenError} </Box>
                            </Flex>: null}
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal"> Change Password </Button>
                    </Form>
           )}
       </Formik> 
       </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient, {ssr: false})(ChangePassword);
// i don't understand why linter is showing me error it's anoying. 