import React from 'react'
import { Avatar, Flex, Text, Divider } from '@chakra-ui/react'


const Comment = ({reply, lastReply}) => {

  return (
    <>
      <Flex gap={4} w={"full"} my={2} py={2}>
        <Avatar src={reply.userProfilePic} size={"sm"} />
        <Flex gap={1} w={"full"} flexDirection={"column"}>
            <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                <Text fontSize={"sm"} fontWeight={"bold"}>{reply.username}</Text>

            </Flex>
            <Text>{reply.text}</Text>
            
        </Flex>
      </Flex>
     {!lastReply ? <Divider /> : null}
    </>
  )
}

export default Comment
