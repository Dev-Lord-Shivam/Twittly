import { AddIcon } from '@chakra-ui/icons'
import {
    Button, FormControl, Textarea, Text, useColorModeValue, useDisclosure,
    Modal, ModalOverlay, ModalHeader, ModalFooter, ModalBody, ModalContent,
    ModalCloseButton,
    Input,
    Flex,
    CloseButton,
    Image
} from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import usePreviewImg from '../hooks/usePreviewImg'
import { BsFillImageFill } from 'react-icons/bs'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'
import postAtom from '../atoms/postAtom'
import { useParams } from 'react-router-dom'

const MAX_CHAR = 500;

const CreatePost = () => {

    const [postTest, setPostText] = useState('');
    const [loading, setLoading] = useState(false)
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg()
    const { isOpen, onOpen, onClose } = useDisclosure();
    const user = useRecoilValue(userAtom)
    const imageRef = useRef(null);
    const showToast = useShowToast();
    const [remainingChar, setRemainingText] = useState(MAX_CHAR);
    const [posts,setPosts] = useRecoilState(postAtom)
    const {username} = useParams();

    const handleTextChange = (e) => {
        const inputText = e.target.value;
        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setRemainingText(0);
        }
        else {
            setPostText(inputText);
            setRemainingText(MAX_CHAR - inputText.length);
        }
    }

    const handleCreatePost = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ postedBy: user._id, text: postTest, img: imgUrl }),
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error")
                return;
            }
            showToast("Success", "Post created successfully", "success")
            if(username === user.username){
                setPosts([data,...posts]);
            }
            
            onClose();
            setPostText("")
            setImgUrl("")

        } catch (error) {
            showToast("Error", error, "error")
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Button
                position={'fixed'}
                bottom={10}
                right={5}
                bg={useColorModeValue("gray.300", "gray.dark")}
                onClick={onOpen}
                size={{base:"sm",sm:"md"}}
            >
                <AddIcon />
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}
                size={
                    {
                        base: "md",
                        md: "xl"
                    }
                }
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>

                        <FormControl>
                            <Textarea placeholder='Whats going on...'
                                onChange={handleTextChange}
                                value={postTest}
                            />
                            <Text
                                fontSize="xs"
                                fontWeight="bold"
                                textAlign={"right"}
                                color={"gray.600"}
                            >
                                {remainingChar}/{MAX_CHAR}
                            </Text>
                            <Input
                                type='file'
                                hidden
                                ref={imageRef}
                                onChange={handleImageChange}
                            />
                            <BsFillImageFill
                                style={{ marginLeft: "5px", cursor: "pointer" }}
                                size={16}
                                onClick={() => imageRef.current.click()}
                            />
                        </FormControl>
                        {imgUrl && (
                            <Flex mt={5} w={"full"} position={"relative"}>
                                <Image src={imgUrl} alt='selected img' />
                                <CloseButton
                                    onClick={() => {
                                        setImgUrl("")
                                    }}
                                    bg={"gray.800"}
                                    position={"absolute"}
                                    top={2}
                                    right={2}
                                />
                            </Flex>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme='blue'
                            mr={3}
                            onClick={handleCreatePost}
                            isLoading={loading}
                        >
                            Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default CreatePost
