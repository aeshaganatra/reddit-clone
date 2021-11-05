import React from 'react'
import {Form, Formik} from "formik"
import { Button, Box } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/inputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps {


}

const Register: React.FC <registerProps> = ({}) =>  {
    const router = useRouter();
    const [,register] = useRegisterMutation();
    return (
       <Formik
            initialValues={{
                username: "",
                password: "",
                email: ""
            }}
            onSubmit={async (value, {setErrors}) => {
                const response = await register({options: value});
                if(response.data?.register.errors){
                    setErrors(toErrorMap(response.data.register.errors));
                }else if(response.data?.register.user){
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
                        <Box mt={4}>
                            <InputField 
                            name="email"
                            placeholder="email"
                            label="email"
                            type="email"
                            />
                        </Box>
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal"> register </Button>
                    </Form>
               </Wrapper>
           )}
       </Formik> 
    );
};

export default withUrqlClient(createUrqlClient)(Register); 