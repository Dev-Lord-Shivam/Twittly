import { Box, Flex, Input } from '@chakra-ui/react'
import React, { useState } from 'react'
import { FaSearch } from "react-icons/fa";
import SuggestedUsers from '../components/SuggestedUsers';
import SuggestedUserComp from '../components/SuggestedUserComp';
import useShowToast from '../hooks/useShowToast';

const SearchUser = () => {

    const showToast = useShowToast();
    const [query, setQuery] = useState('');
    const [users, SetUsers] = useState([])

    const handleInputChange = async (e) => {
        const value = e.target.value;
        
        if (value) {
            setQuery(value);
            try {
                const res = await fetch(`/api/users/SearchUser?q=${query}`)
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error")
                    return;
                }
                SetUsers(data)
            } catch (error) {
                showToast("Error", error.message, "error");
            }
        }
        else{
            SetUsers([])
        }
    }

    return <>
        <Flex>
            <Input
                placeholder='Search for users'
                _placeholder={{ color: 'gray.500' }}
                borderColor={'white'}
                type="text"
                onChange={handleInputChange}
            />
            {/* <FaSearch /> */}
        </Flex>
        <Flex direction={"column"} gap={4} mt={10}>
            {users.length === 0 &&

                <SuggestedUsers />

            }
            {users.length != 0 &&
                users.map(user => <SuggestedUserComp key={user._id} user={user} />)
            }
        </Flex>
    </>
}

export default SearchUser
