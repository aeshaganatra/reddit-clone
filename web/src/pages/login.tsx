import React from 'react'
import {Form, Formik} from "formik"
import { Button, Box, Link, Flex } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/inputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from "next/link"

const Login: React.FC <{}> = ({}) =>  {
    const router = useRouter();
    const [,login] = useLoginMutation();
    return (
       <Formik
            initialValues={{
                usernameOrEmail: "",
                password: ""
            }}
            onSubmit={async (value, {setErrors}) => {
                const response = await login(value);
                if(response.data?.login.errors){
                    setErrors(toErrorMap(response.data.login.errors));
                }else if(response.data?.login.user){
                    router.push('/');
                }
            }}
       >
           {( {isSubmitting} ) => (
               <Wrapper variant = "small">
                    <Form>
                        <InputField 
                        name="usernameOrEmail"
                        placeholder="usernameOrEmail"
                        label="usernameOrEmail"
                        />
                        <Box mt={4}>
                            <InputField 
                            name="password"
                            placeholder="password"
                            label="password"
                            type="password"
                            />
                        </Box>

                        <Flex>
                            <NextLink href="/forget-password">
                                <Link mt={2} ml="auto">
                                    forget password?
                                </Link>
                            </NextLink>
                        </Flex>
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal"> Login </Button>
                    </Form>
               </Wrapper>
           )}
       </Formik> 
    );
};

export default withUrqlClient(createUrqlClient)(Login);