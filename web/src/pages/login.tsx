import React from 'react'
import {Form, Formik} from "formik"
import { Button, Box } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/inputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from "next/router";

const Login: React.FC <{}> = ({}) =>  {
    const router = useRouter();
    const [,login] = useLoginMutation();
    return (
       <Formik
            initialValues={{
                username: "",
                password: ""
            }}
            onSubmit={async (value, {setErrors}) => {
                const response = await login({ options: value });
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
                        name="username"
                        placeholder="username"
                        label="username"
                        />
                        <Box mt={4}>
                            <InputField 
                            name="password"
                            placeholder="password"
                            label="password"
                            type="password"
                            />
                        </Box>
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal"> register </Button>
                    </Form>
               </Wrapper>
           )}
       </Formik> 
    );
};

export default Login;